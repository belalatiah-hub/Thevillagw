import { Injectable, NotFoundException } from '@nestjs/common';
import { DistributionStrategy, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDistributionRuleDto, UpdateDistributionRuleDto } from './dto/distribution.dto';

/** Roles eligible to receive auto-distributed leads. */
const SALES_ROLE_KEYS = new Set([
  'PROPERTY_CONSULTANT',
  'INSIDE_SALES',
  'CALL_CENTER',
  'SALES_AGENT',
  'SENIOR_SALES',
  'TEAM_LEADER',
]);

interface RuleConditions {
  source?: string[];
  area?: string[];
  minScore?: number;
}

interface LeadFacts {
  source: string;
  interestArea?: string | null;
  score: number;
}

export interface AssignResult {
  userId: string | null;
  ruleId?: string;
  ruleName?: string;
  strategy?: DistributionStrategy;
  reason?: string;
}

@Injectable()
export class DistributionService {
  constructor(private readonly prisma: PrismaService) {}

  // ── CRUD ─────────────────────────────────────────────────────────────────
  list(companyId: string) {
    return this.prisma.distributionRule.findMany({
      where: { companyId },
      orderBy: { order: 'asc' },
    });
  }

  create(companyId: string, dto: CreateDistributionRuleDto) {
    return this.prisma.distributionRule.create({
      data: {
        companyId,
        name: dto.name,
        enabled: dto.enabled ?? true,
        order: dto.order ?? 0,
        conditions: (dto.conditions ?? {}) as Prisma.InputJsonValue,
        strategy: dto.strategy ?? 'ROUND_ROBIN',
        targetTeamId: dto.targetTeamId,
        targetUserId: dto.targetUserId,
        dailyCapPerAgent: dto.dailyCapPerAgent,
      },
    });
  }

  async update(companyId: string, id: string, dto: UpdateDistributionRuleDto) {
    await this.ensure(companyId, id);
    return this.prisma.distributionRule.update({
      where: { id },
      data: {
        name: dto.name,
        enabled: dto.enabled,
        order: dto.order,
        conditions: dto.conditions ? (dto.conditions as Prisma.InputJsonValue) : undefined,
        strategy: dto.strategy,
        targetTeamId: dto.targetTeamId,
        targetUserId: dto.targetUserId,
        dailyCapPerAgent: dto.dailyCapPerAgent,
      },
    });
  }

  async remove(companyId: string, id: string) {
    await this.ensure(companyId, id);
    await this.prisma.distributionRule.delete({ where: { id } });
  }

  // ── Assignment engine ──────────────────────────────────────────────────────
  /**
   * Pick the agent a lead should be assigned to. Walks enabled rules in order,
   * returns the first match's chosen agent, honouring per-agent daily caps.
   * Falls back to `{userId:null}` when no rule matches or all agents are capped.
   */
  async pickAssignee(companyId: string, lead: LeadFacts): Promise<AssignResult> {
    const rules = await this.prisma.distributionRule.findMany({
      where: { companyId, enabled: true },
      orderBy: { order: 'asc' },
    });
    for (const rule of rules) {
      if (!this.matches((rule.conditions ?? null) as RuleConditions | null, lead)) continue;
      const userId = await this.resolve(companyId, rule);
      if (userId) {
        await this.prisma.distributionRule.update({
          where: { id: rule.id },
          data: { assignedCount: { increment: 1 } },
        });
        return { userId, ruleId: rule.id, ruleName: rule.name, strategy: rule.strategy };
      }
    }
    return { userId: null, reason: 'no matching rule with an available agent' };
  }

  /** Dry-run: which rule would fire and who would receive the lead. */
  async preview(companyId: string, leadId: string): Promise<AssignResult> {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
      select: { source: true, interestArea: true, score: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    const rules = await this.prisma.distributionRule.findMany({
      where: { companyId, enabled: true },
      orderBy: { order: 'asc' },
    });
    for (const rule of rules) {
      if (!this.matches((rule.conditions ?? null) as RuleConditions | null, lead)) continue;
      const userId = await this.resolve(companyId, rule);
      return { userId, ruleId: rule.id, ruleName: rule.name, strategy: rule.strategy };
    }
    return { userId: null, reason: 'no matching rule' };
  }

  private matches(cond: RuleConditions | null, lead: LeadFacts): boolean {
    if (!cond) return true;
    if (cond.source?.length && !cond.source.includes(lead.source)) return false;
    if (typeof cond.minScore === 'number' && lead.score < cond.minScore) return false;
    if (cond.area?.length) {
      const area = (lead.interestArea ?? '').toLowerCase();
      if (!cond.area.some((a) => area.includes(a.toLowerCase()))) return false;
    }
    return true;
  }

  private async resolve(
    companyId: string,
    rule: {
      strategy: DistributionStrategy;
      targetUserId: string | null;
      targetTeamId: string | null;
      dailyCapPerAgent: number | null;
    },
  ): Promise<string | null> {
    // Candidate pool by strategy.
    let candidates: string[] = [];
    if (rule.strategy === 'SPECIFIC_USER' && rule.targetUserId) {
      candidates = [rule.targetUserId];
    } else if (rule.strategy === 'SPECIFIC_TEAM' && rule.targetTeamId) {
      const members = await this.prisma.user.findMany({
        where: { companyId, teamId: rule.targetTeamId, isActive: true },
        select: { id: true },
      });
      candidates = members.map((m) => m.id);
    } else {
      candidates = await this.eligibleAgents(companyId, rule.targetTeamId);
    }
    if (!candidates.length) return null;

    // Enforce the daily cap: drop agents who already hit their limit today.
    if (rule.dailyCapPerAgent != null) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const counts = await Promise.all(
        candidates.map((id) =>
          this.prisma.lead.count({
            where: { companyId, ownerId: id, createdAt: { gte: startOfToday } },
          }),
        ),
      );
      candidates = candidates.filter((_, i) => counts[i] < rule.dailyCapPerAgent!);
      if (!candidates.length) return null;
    }

    // Round-robin & least-busy both pick the agent with the fewest OPEN leads
    // (tie broken deterministically by id) — spreading load fairly.
    const loads = await Promise.all(
      candidates.map((id) =>
        this.prisma.lead.count({
          where: { companyId, ownerId: id, status: { notIn: ['WON', 'LOST', 'JUNK'] } },
        }),
      ),
    );
    let best = 0;
    for (let i = 1; i < candidates.length; i++) {
      if (
        loads[i] < loads[best] ||
        (loads[i] === loads[best] && candidates[i] < candidates[best])
      ) {
        best = i;
      }
    }
    return candidates[best];
  }

  private async eligibleAgents(companyId: string, teamId: string | null): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: { companyId, isActive: true, ...(teamId ? { teamId } : {}) },
      include: { roles: { include: { role: true } } },
    });
    return users
      .filter((u) => u.roles.some((ur) => ur.role.key && SALES_ROLE_KEYS.has(ur.role.key)))
      .map((u) => u.id);
  }

  private async ensure(companyId: string, id: string): Promise<void> {
    const found = await this.prisma.distributionRule.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Distribution rule not found');
  }
}
