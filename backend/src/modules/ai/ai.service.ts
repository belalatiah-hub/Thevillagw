import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';
import { AI_PROVIDER, AiProvider, AiSummary } from './ai.types';
import { BriefRole, buildRoleBrief, RoleBrief } from './role-brief';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: ReportsService,
    @Inject(AI_PROVIDER) private readonly provider: AiProvider,
  ) {}

  /**
   * The role-aware assistant brief — the "core of the CRM". Reads live
   * aggregates and returns a headline, insights, and recommended next actions
   * tailored to the caller's role. Deterministic and grounded; the LLM provider
   * can enrich phrasing without changing the underlying facts.
   */
  async assistant(user: AuthUser, role: BriefRole): Promise<RoleBrief> {
    const stats = await this.reports.dashboard(user);

    const [pendingAgg, paidAgg] = await this.prisma.$transaction([
      this.prisma.commission.aggregate({
        where: { companyId: user.companyId, status: { in: ['PENDING', 'APPROVED'] } },
        _sum: { amountMinor: true },
      }),
      this.prisma.commission.aggregate({
        where: { companyId: user.companyId, status: 'PAID' },
        _sum: { amountMinor: true },
      }),
    ]);

    return buildRoleBrief(role, {
      totalLeads: stats.leads.total,
      newToday: stats.leads.newToday,
      hot: stats.leads.hot,
      pipelineOpenMinor: BigInt(stats.pipeline.openValueMinor),
      weightedForecastMinor: BigInt(stats.pipeline.weightedForecastMinor),
      wonThisMonthMinor: BigInt(stats.pipeline.wonThisMonthMinor),
      openCount: stats.pipeline.openCount,
      currency: 'EGP',
      topSource: stats.leadsBySource[0] ?? null,
      topOwner: stats.topOwners[0] ? { name: stats.topOwners[0].name, leads: stats.topOwners[0].leads } : null,
      commissionPendingMinor: pendingAgg._sum.amountMinor ?? 0n,
      commissionPaidMinor: paidAgg._sum.amountMinor ?? 0n,
    });
  }

  /**
   * Summarise a lead and recommend a next action. Persists the summary back on
   * the lead (aiSummary) so the UI can show it without re-calling the model.
   */
  async summarizeLead(user: AuthUser, leadId: string): Promise<AiSummary> {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId: user.companyId },
    });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    const recentActivities = await this.prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { type: true, subject: true, createdAt: true },
    });

    const result = await this.provider.summarizeLead({ lead, recentActivities });

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { aiSummary: result.summary },
    });
    return result;
  }
}
