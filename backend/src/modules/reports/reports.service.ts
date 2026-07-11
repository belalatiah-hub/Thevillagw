import { Injectable } from '@nestjs/common';
import { LeadStatus, OpportunityStatus } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

export interface DashboardStats {
  leads: { total: number; newToday: number; hot: number; byStatus: Record<string, number> };
  leadsBySource: { source: string; count: number }[];
  leadsByTemperature: { temperature: string; count: number }[];
  pipeline: {
    openValueMinor: string;
    weightedForecastMinor: string;
    wonThisMonthMinor: string;
    openCount: number;
  };
  topOwners: { ownerId: string; name: string; leads: number }[];
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Everything the executive dashboard needs. We pull the lead rows we need to
   * break down (a slim projection) once and aggregate in memory — clearer and
   * more portable than a fan of groupBy queries, and fast at CRM scale.
   */
  async dashboard(user: AuthUser): Promise<DashboardStats> {
    const companyId = user.companyId;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [leadRows, openOpps, wonOpps, owners] = await Promise.all([
      this.prisma.lead.findMany({
        where: { companyId },
        select: {
          status: true,
          source: true,
          temperature: true,
          ownerId: true,
          createdAt: true,
        },
      }),
      this.prisma.opportunity.findMany({
        where: { companyId, status: OpportunityStatus.OPEN },
        select: { valueMinor: true, stage: { select: { probability: true } } },
      }),
      this.prisma.opportunity.findMany({
        where: { companyId, status: OpportunityStatus.WON, updatedAt: { gte: startOfMonth } },
        select: { valueMinor: true },
      }),
      this.prisma.user.findMany({
        where: { companyId },
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);

    // Lead aggregates
    const byStatus: Record<string, number> = {};
    Object.values(LeadStatus).forEach((s) => (byStatus[s] = 0));
    const bySource = new Map<string, number>();
    const byTemp = new Map<string, number>();
    const byOwner = new Map<string, number>();
    let newToday = 0;
    let hot = 0;

    for (const l of leadRows) {
      byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
      bySource.set(l.source, (bySource.get(l.source) ?? 0) + 1);
      byTemp.set(l.temperature, (byTemp.get(l.temperature) ?? 0) + 1);
      if (l.ownerId) byOwner.set(l.ownerId, (byOwner.get(l.ownerId) ?? 0) + 1);
      if (l.temperature === 'HOT') hot++;
      if (l.createdAt >= startOfToday) newToday++;
    }

    // Pipeline aggregates
    const openValue = openOpps.reduce((sum, o) => sum + o.valueMinor, 0n);
    const weighted = openOpps.reduce(
      (sum, o) => sum + (o.valueMinor * BigInt(o.stage.probability)) / 100n,
      0n,
    );
    const wonThisMonth = wonOpps.reduce((sum, o) => sum + o.valueMinor, 0n);

    const nameById = new Map(owners.map((o) => [o.id, `${o.firstName} ${o.lastName}`]));

    return {
      leads: { total: leadRows.length, newToday, hot, byStatus },
      leadsBySource: [...bySource.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      leadsByTemperature: [...byTemp.entries()].map(([temperature, count]) => ({
        temperature,
        count,
      })),
      pipeline: {
        openValueMinor: openValue.toString(),
        weightedForecastMinor: weighted.toString(),
        wonThisMonthMinor: wonThisMonth.toString(),
        openCount: openOpps.length,
      },
      topOwners: [...byOwner.entries()]
        .map(([ownerId, leads]) => ({ ownerId, name: nameById.get(ownerId) ?? 'Unknown', leads }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 5),
    };
  }
}
