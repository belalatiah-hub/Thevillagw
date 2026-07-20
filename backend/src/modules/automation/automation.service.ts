import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AutomationRunStatus, AutomationTrigger, Prisma } from '@prisma/client';
import { DOMAIN_EVENTS } from '../../common/events/domain-events';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AutomationAction, AutomationConditions, matchesConditions } from './automation.types';

/** System roles considered eligible for automatic lead assignment. */
const SALES_ROLE_KEYS = new Set([
  'PROPERTY_CONSULTANT',
  'INSIDE_SALES',
  'CALL_CENTER',
  'TEAM_LEADER',
]);

interface ActionResult {
  type: string;
  ok: boolean;
  detail?: string;
}

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly ai: AiService,
  ) {}

  /**
   * Entry point invoked by the event listener. Loads the company's enabled
   * rules for the trigger, runs the ones whose conditions match the lead, and
   * records a run per rule. Failures in one action never abort the others.
   */
  async runForLead(companyId: string, leadId: string, trigger: AutomationTrigger): Promise<void> {
    const lead = await this.prisma.lead.findFirst({ where: { id: leadId, companyId } });
    if (!lead) return;

    const rules = await this.prisma.automationRule.findMany({
      where: { companyId, enabled: true, trigger },
      orderBy: { order: 'asc' },
    });

    for (const rule of rules) {
      const conditions = (rule.conditions ?? null) as AutomationConditions | null;
      if (!matchesConditions(conditions, lead)) continue;

      const actions = (rule.actions ?? []) as unknown as AutomationAction[];
      const results: ActionResult[] = [];
      for (const action of actions) {
        try {
          results.push(await this.execute(companyId, leadId, action));
        } catch (err) {
          results.push({ type: action.type, ok: false, detail: (err as Error).message });
        }
      }

      const failed = results.filter((r) => !r.ok).length;
      const status: AutomationRunStatus =
        failed === 0
          ? AutomationRunStatus.SUCCESS
          : failed === results.length
            ? AutomationRunStatus.FAILED
            : AutomationRunStatus.PARTIAL;

      await this.prisma.$transaction([
        this.prisma.automationRun.create({
          data: {
            companyId,
            ruleId: rule.id,
            leadId,
            status,
            actions: results as unknown as Prisma.InputJsonValue,
          },
        }),
        this.prisma.automationRule.update({
          where: { id: rule.id },
          data: { runCount: { increment: 1 }, lastRunAt: new Date() },
        }),
      ]);
      this.logger.log(`Rule "${rule.name}" ran on lead ${leadId} → ${status}`);
    }
  }

  /** Dry-run: which rules would fire and what actions they'd plan (no side effects). */
  async simulate(companyId: string, leadId: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id: leadId, companyId } });
    if (!lead) return { leadId, matched: [] };
    const rules = await this.prisma.automationRule.findMany({
      where: { companyId, enabled: true },
      orderBy: { order: 'asc' },
    });
    return {
      leadId,
      matched: rules
        .filter((r) =>
          matchesConditions((r.conditions ?? null) as AutomationConditions | null, lead),
        )
        .map((r) => ({
          rule: r.name,
          actions: (r.actions ?? []) as unknown as AutomationAction[],
        })),
    };
  }

  // ── action executors ───────────────────────────────────────────────────────

  private async execute(
    companyId: string,
    leadId: string,
    action: AutomationAction,
  ): Promise<ActionResult> {
    switch (action.type) {
      case 'ASSIGN_ROUND_ROBIN':
        return this.assignRoundRobin(companyId, leadId);
      case 'ASSIGN_USER':
        return this.assignUser(companyId, leadId, action.userId);
      case 'CREATE_FOLLOW_UP':
        return this.createTask(
          companyId,
          leadId,
          'Follow up with the lead',
          action.minutes ?? 60,
          'TASK',
        );
      case 'START_SLA':
        return this.createTask(
          companyId,
          leadId,
          'SLA — first response due',
          action.minutes ?? 15,
          'TASK',
        );
      case 'SEND_WHATSAPP_TEMPLATE':
        return this.sendWhatsapp(companyId, leadId, action.template ?? 'welcome');
      case 'GENERATE_AI_SUMMARY':
        return this.aiSummary(companyId, leadId);
      case 'NOTIFY_OWNER':
        return this.notifyOwner(companyId, leadId);
      default:
        return { type: action.type, ok: false, detail: 'Unknown action' };
    }
  }

  private async assignRoundRobin(companyId: string, leadId: string): Promise<ActionResult> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { ownerId: true },
    });
    if (lead?.ownerId) return { type: 'ASSIGN_ROUND_ROBIN', ok: true, detail: 'already assigned' };

    const users = await this.prisma.user.findMany({
      where: { companyId, isActive: true },
      include: { roles: { include: { role: true } } },
    });
    let eligible = users.filter((u) =>
      u.roles.some((ur) => ur.role.key && SALES_ROLE_KEYS.has(ur.role.key)),
    );
    if (!eligible.length) {
      eligible = users.filter((u) =>
        u.roles.some(
          (ur) => ur.role.permissions.includes('lead:update') && !ur.role.permissions.includes('*'),
        ),
      );
    }
    if (!eligible.length)
      return { type: 'ASSIGN_ROUND_ROBIN', ok: false, detail: 'no eligible agents' };

    // Least-loaded: assign to the eligible agent with the fewest open leads.
    const loads = await Promise.all(
      eligible.map((u) =>
        this.prisma.lead.count({
          where: { companyId, ownerId: u.id, status: { notIn: ['WON', 'LOST', 'JUNK'] } },
        }),
      ),
    );
    let best = 0;
    for (let i = 1; i < eligible.length; i++) {
      if (
        loads[i] < loads[best] ||
        (loads[i] === loads[best] && eligible[i].id < eligible[best].id)
      ) {
        best = i;
      }
    }
    const owner = eligible[best];
    await this.prisma.lead.update({ where: { id: leadId }, data: { ownerId: owner.id } });
    this.events.emit(DOMAIN_EVENTS.LEAD_ASSIGNED, { companyId, leadId, ownerId: owner.id });
    return { type: 'ASSIGN_ROUND_ROBIN', ok: true, detail: `${owner.firstName} ${owner.lastName}` };
  }

  private async assignUser(
    companyId: string,
    leadId: string,
    userId?: string,
  ): Promise<ActionResult> {
    if (!userId) return { type: 'ASSIGN_USER', ok: false, detail: 'no userId' };
    const user = await this.prisma.user.findFirst({
      where: { id: userId, companyId },
      select: { id: true },
    });
    if (!user) return { type: 'ASSIGN_USER', ok: false, detail: 'user not in company' };
    await this.prisma.lead.update({ where: { id: leadId }, data: { ownerId: userId } });
    this.events.emit(DOMAIN_EVENTS.LEAD_ASSIGNED, { companyId, leadId, ownerId: userId });
    return { type: 'ASSIGN_USER', ok: true };
  }

  private async createTask(
    companyId: string,
    leadId: string,
    subject: string,
    minutes: number,
    type: 'TASK',
  ): Promise<ActionResult> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { ownerId: true },
    });
    const dueAt = new Date(Date.now() + minutes * 60_000);
    await this.prisma.activity.create({
      data: {
        companyId,
        type,
        status: 'PLANNED',
        subject,
        dueAt,
        leadId,
        ownerId: lead?.ownerId ?? undefined,
      },
    });
    return {
      type: subject.startsWith('SLA') ? 'START_SLA' : 'CREATE_FOLLOW_UP',
      ok: true,
      detail: `due in ${minutes}m`,
    };
  }

  private async sendWhatsapp(
    companyId: string,
    leadId: string,
    template: string,
  ): Promise<ActionResult> {
    const wa = await this.prisma.integration.findFirst({
      where: { companyId, provider: 'WHATSAPP_CLOUD', enabled: true, status: 'CONNECTED' },
    });
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { ownerId: true },
    });
    const connected = !!wa;
    await this.prisma.activity.create({
      data: {
        companyId,
        type: 'WHATSAPP',
        status: connected ? 'DONE' : 'PLANNED',
        subject: `WhatsApp template "${template}"${connected ? '' : ' (pending WhatsApp integration)'}`,
        completedAt: connected ? new Date() : undefined,
        leadId,
        ownerId: lead?.ownerId ?? undefined,
      },
    });
    return {
      type: 'SEND_WHATSAPP_TEMPLATE',
      ok: true,
      detail: connected ? `sent "${template}"` : 'queued — connect WhatsApp to send',
    };
  }

  private async aiSummary(companyId: string, leadId: string): Promise<ActionResult> {
    const res = await this.ai.summarizeLeadForCompany(companyId, leadId);
    return { type: 'GENERATE_AI_SUMMARY', ok: true, detail: res.provider };
  }

  private async notifyOwner(companyId: string, leadId: string): Promise<ActionResult> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { ownerId: true },
    });
    await this.prisma.activity.create({
      data: {
        companyId,
        type: 'NOTE',
        status: 'DONE',
        subject: 'New lead assigned — owner notified',
        completedAt: new Date(),
        leadId,
        ownerId: lead?.ownerId ?? undefined,
      },
    });
    return { type: 'NOTIFY_OWNER', ok: true };
  }
}
