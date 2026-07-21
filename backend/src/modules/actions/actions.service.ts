import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadActionStatus, Prisma } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/scope/scope.service';
import { CreateActionDto } from './dto/action.dto';

/** Map a quick "due" preset (like the After-1h / Tomorrow chips) to a date. */
function resolveDue(preset?: string, explicit?: string): Date | undefined {
  if (explicit) return new Date(explicit);
  if (!preset) return undefined;
  const now = Date.now();
  switch (preset) {
    case 'after_1h':
      return new Date(now + 60 * 60 * 1000);
    case 'after_2h':
      return new Date(now + 2 * 60 * 60 * 1000);
    case 'tomorrow':
      return new Date(now + 24 * 60 * 60 * 1000);
    case 'next_week':
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    default:
      return undefined;
  }
}

@Injectable()
export class ActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly scope: ScopeService,
  ) {}

  /**
   * Log a lead action. Completes the lead's previous PLANNED action (an action
   * supersedes the last one), records the new next-action + stage date, mirrors
   * it onto the activity timeline, and optionally moves the lead's stage.
   */
  async create(user: AuthUser, leadId: string, dto: CreateActionDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId: user.companyId },
      select: { id: true, ownerId: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const dueAt = resolveDue(dto.due, dto.dueAt);

    // Close out the previous open action for this lead.
    await this.prisma.leadAction.updateMany({
      where: { leadId, status: LeadActionStatus.PLANNED },
      data: { status: LeadActionStatus.DONE, doneAt: new Date() },
    });

    const action = await this.prisma.leadAction.create({
      data: {
        companyId: user.companyId,
        leadId,
        agentId: dto.agentId ?? lead.ownerId ?? user.id,
        nextAction: dto.nextAction,
        stageName: dto.stageName,
        dueAt,
        comment: dto.comment,
        voiceNoteUrl: dto.voiceNoteUrl,
        rating: dto.rating,
        status: dueAt ? LeadActionStatus.PLANNED : LeadActionStatus.DONE,
        doneAt: dueAt ? null : new Date(),
      },
    });

    // Mirror to the timeline and touch the lead.
    await this.prisma.$transaction([
      this.prisma.activity.create({
        data: {
          companyId: user.companyId,
          type: 'NOTE',
          status: dueAt ? 'PLANNED' : 'DONE',
          subject: `Action: ${dto.nextAction}${dto.stageName ? ` → ${dto.stageName}` : ''}`,
          body: dto.comment,
          dueAt,
          completedAt: dueAt ? undefined : new Date(),
          leadId,
          ownerId: dto.agentId ?? lead.ownerId ?? user.id,
        },
      }),
      this.prisma.lead.update({
        where: { id: leadId },
        data: { lastActivityAt: new Date() },
      }),
    ]);

    this.events.emit('lead.action', { companyId: user.companyId, leadId, actionId: action.id });
    return action;
  }

  /** Action history for a lead (newest first). */
  history(user: AuthUser, leadId: string) {
    return this.prisma.leadAction.findMany({
      where: { companyId: user.companyId, leadId },
      orderBy: { createdAt: 'desc' },
      include: { agent: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  /** The caller's upcoming planned actions (scoped), soonest first. */
  async myFeed(user: AuthUser) {
    const ownerIds = await this.scope.visibleOwnerIds(user);
    return this.prisma.leadAction.findMany({
      where: {
        companyId: user.companyId,
        status: LeadActionStatus.PLANNED,
        ...(ownerIds ? { agentId: { in: ownerIds } } : {}),
      },
      orderBy: { dueAt: 'asc' },
      take: 100,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /** Overdue planned actions (the "Total Delay" backlog), most overdue first. */
  async delayed(user: AuthUser) {
    const ownerIds = await this.scope.visibleOwnerIds(user);
    return this.prisma.leadAction.findMany({
      where: {
        companyId: user.companyId,
        status: LeadActionStatus.PLANNED,
        dueAt: { lt: new Date() },
        ...(ownerIds ? { agentId: { in: ownerIds } } : {}),
      },
      orderBy: { dueAt: 'asc' },
      take: 100,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async complete(user: AuthUser, id: string) {
    const found = await this.prisma.leadAction.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Action not found');
    return this.prisma.leadAction.update({
      where: { id },
      data: { status: LeadActionStatus.DONE, doneAt: new Date() },
    });
  }

  /**
   * Efficiency tracker: per-agent action counts, delayed backlog, and won/lost,
   * plus company totals (Total Actions / Won / Lost / Total Delay hours). Scoped.
   */
  async efficiency(user: AuthUser) {
    const ownerIds = await this.scope.visibleOwnerIds(user);
    const actionWhere: Prisma.LeadActionWhereInput = {
      companyId: user.companyId,
      ...(ownerIds ? { agentId: { in: ownerIds } } : {}),
    };
    const [actions, users, wonLeads, lostLeads] = await Promise.all([
      this.prisma.leadAction.findMany({
        where: actionWhere,
        select: { agentId: true, status: true, dueAt: true },
      }),
      this.prisma.user.findMany({
        where: { companyId: user.companyId, ...(ownerIds ? { id: { in: ownerIds } } : {}) },
        select: { id: true, firstName: true, lastName: true },
      }),
      this.prisma.lead.groupBy({
        by: ['ownerId'],
        where: {
          companyId: user.companyId,
          status: 'WON',
          ...(ownerIds ? { ownerId: { in: ownerIds } } : {}),
        },
        _count: { _all: true },
      }),
      this.prisma.lead.groupBy({
        by: ['ownerId'],
        where: {
          companyId: user.companyId,
          status: 'LOST',
          ...(ownerIds ? { ownerId: { in: ownerIds } } : {}),
        },
        _count: { _all: true },
      }),
    ]);

    const now = Date.now();
    const nameById = new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));
    const wonBy = new Map(wonLeads.map((w) => [w.ownerId, w._count._all]));
    const lostBy = new Map(lostLeads.map((l) => [l.ownerId, l._count._all]));

    const perAgent = new Map<string, { actions: number; delayed: number; delayMs: number }>();
    let totalDelayMs = 0;
    for (const a of actions) {
      if (!a.agentId) continue;
      const row = perAgent.get(a.agentId) ?? { actions: 0, delayed: 0, delayMs: 0 };
      row.actions++;
      if (a.status === 'PLANNED' && a.dueAt && a.dueAt.getTime() < now) {
        row.delayed++;
        const d = now - a.dueAt.getTime();
        row.delayMs += d;
        totalDelayMs += d;
      }
      perAgent.set(a.agentId, row);
    }

    const leaderboard = [...perAgent.entries()]
      .map(([agentId, r]) => ({
        agentId,
        name: nameById.get(agentId) ?? 'Unknown',
        actions: r.actions,
        delayed: r.delayed,
        delayHours: Math.round(r.delayMs / 3_600_000),
        won: wonBy.get(agentId) ?? 0,
        lost: lostBy.get(agentId) ?? 0,
      }))
      .sort((a, b) => b.actions - a.actions);

    return {
      totals: {
        actions: actions.length,
        delayed: actions.filter((a) => a.status === 'PLANNED' && a.dueAt && a.dueAt.getTime() < now)
          .length,
        delayHours: Math.round(totalDelayMs / 3_600_000),
        won: [...wonBy.values()].reduce((s, n) => s + n, 0),
        lost: [...lostBy.values()].reduce((s, n) => s + n, 0),
        users: users.length,
      },
      leaderboard,
    };
  }
}
