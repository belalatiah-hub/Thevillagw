import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CallOutcome, CallStatus, LeadStatus, Prisma } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { normalizePhone } from '../../common/util/phone';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/scope/scope.service';
import { LogCallDto, QueryCallsDto } from './dto/call.dto';

/** Call outcomes that should move the lead's status forward/back. */
const OUTCOME_TO_STATUS: Partial<Record<CallOutcome, LeadStatus>> = {
  INTERESTED: LeadStatus.QUALIFIED,
  MEETING_BOOKED: LeadStatus.MEETING_SET,
  NOT_INTERESTED: LeadStatus.LOST,
  WRONG_NUMBER: LeadStatus.JUNK,
  DO_NOT_CALL: LeadStatus.JUNK,
};

@Injectable()
export class TelephonyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly scope: ScopeService,
  ) {}

  /** Log a call (click-to-call result, manual entry, or agent wrap-up). */
  async logCall(user: AuthUser, dto: LogCallDto) {
    const lead = dto.leadId
      ? await this.prisma.lead.findFirst({
          where: { id: dto.leadId, companyId: user.companyId },
          select: { id: true, ownerId: true, phone: true, status: true },
        })
      : null;

    const call = await this.prisma.call.create({
      data: {
        companyId: user.companyId,
        leadId: lead?.id,
        customerId: dto.customerId,
        agentId: dto.agentId ?? user.id,
        direction: dto.direction ?? 'OUTBOUND',
        status: dto.status ?? 'COMPLETED',
        outcome: dto.outcome,
        fromNumber: dto.fromNumber,
        toNumber: dto.toNumber ?? lead?.phone ?? undefined,
        durationSec: dto.durationSec ?? 0,
        recordingUrl: dto.recordingUrl,
        notes: dto.notes,
        provider: dto.provider ?? 'MANUAL',
        externalId: dto.externalId,
        endedAt: new Date(),
      },
    });

    // Mirror the call onto the lead timeline as an Activity and advance status.
    if (lead) {
      const nextStatus = dto.outcome ? OUTCOME_TO_STATUS[dto.outcome] : undefined;
      await this.prisma.$transaction([
        this.prisma.activity.create({
          data: {
            companyId: user.companyId,
            type: 'CALL',
            status: 'DONE',
            subject: `Call — ${dto.outcome ?? dto.status ?? 'completed'}${dto.durationSec ? ` (${dto.durationSec}s)` : ''}`,
            body: dto.notes,
            completedAt: new Date(),
            leadId: lead.id,
            ownerId: dto.agentId ?? user.id,
          },
        }),
        ...(nextStatus && nextStatus !== lead.status
          ? [
              this.prisma.lead.update({
                where: { id: lead.id },
                data: { status: nextStatus, lastActivityAt: new Date() },
              }),
            ]
          : [
              this.prisma.lead.update({
                where: { id: lead.id },
                data: { lastActivityAt: new Date() },
              }),
            ]),
      ]);
    }

    this.events.emit('call.logged', {
      companyId: user.companyId,
      callId: call.id,
      leadId: lead?.id,
    });
    return call;
  }

  /** Scoped call log — agents see their own calls, leaders the team's. */
  async list(user: AuthUser, query: QueryCallsDto) {
    const ownerIds = await this.scope.visibleOwnerIds(user);
    const where: Prisma.CallWhereInput = {
      companyId: user.companyId,
      ...(ownerIds ? { agentId: { in: ownerIds } } : {}),
      ...(query.direction ? { direction: query.direction } : {}),
      ...(query.outcome ? { outcome: query.outcome } : {}),
      ...(query.leadId ? { leadId: query.leadId } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.call.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          lead: { select: { id: true, firstName: true, lastName: true } },
          agent: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.call.count({ where }),
    ]);
    return new PaginatedResult(data, total, query.page, query.limit);
  }

  /** Full call history for one lead (newest first). */
  forLead(user: AuthUser, leadId: string) {
    return this.prisma.call.findMany({
      where: { companyId: user.companyId, leadId },
      orderBy: { createdAt: 'desc' },
      include: { agent: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  /** Scoped call KPIs for the dashboard (total, answered, missed, avg duration). */
  async stats(user: AuthUser) {
    const ownerIds = await this.scope.visibleOwnerIds(user);
    const where: Prisma.CallWhereInput = {
      companyId: user.companyId,
      ...(ownerIds ? { agentId: { in: ownerIds } } : {}),
    };
    const calls = await this.prisma.call.findMany({
      where,
      select: { status: true, outcome: true, durationSec: true },
    });
    const answeredStates = new Set<CallStatus>([CallStatus.ANSWERED, CallStatus.COMPLETED]);
    const missedStates = new Set<CallStatus>([
      CallStatus.MISSED,
      CallStatus.BUSY,
      CallStatus.FAILED,
      CallStatus.VOICEMAIL,
    ]);
    const answered = calls.filter((c) => answeredStates.has(c.status)).length;
    const missed = calls.filter((c) => missedStates.has(c.status)).length;
    const totalDuration = calls.reduce((s, c) => s + c.durationSec, 0);
    const byOutcome: Record<string, number> = {};
    for (const c of calls) if (c.outcome) byOutcome[c.outcome] = (byOutcome[c.outcome] ?? 0) + 1;
    return {
      total: calls.length,
      answered,
      missed,
      answerRate: calls.length ? Math.round((answered / calls.length) * 100) : 0,
      avgDurationSec: answered ? Math.round(totalDuration / answered) : 0,
      byOutcome,
    };
  }

  /**
   * Public PBX/telephony webhook. Providers POST call events keyed by the
   * company slug; we correlate to a lead by the customer's phone number and
   * record the call. Never throws back at the provider on a soft miss.
   */
  async ingestWebhook(companySlug: string, payload: Record<string, unknown>) {
    const company = await this.prisma.company.findUnique({
      where: { slug: companySlug },
      select: { id: true },
    });
    if (!company) return { ok: false, reason: 'unknown company' };

    const customerNumber = String(payload.from ?? payload.caller ?? payload.to ?? '');
    const normalized = normalizePhone(customerNumber);
    const lead = normalized
      ? await this.prisma.lead.findFirst({
          where: { companyId: company.id, phoneNormalized: normalized },
          select: { id: true, ownerId: true },
        })
      : null;

    const call = await this.prisma.call.create({
      data: {
        companyId: company.id,
        leadId: lead?.id,
        agentId: lead?.ownerId ?? undefined,
        direction: (payload.direction as string) === 'outbound' ? 'OUTBOUND' : 'INBOUND',
        status: this.mapProviderStatus(String(payload.status ?? 'completed')),
        fromNumber: String(payload.from ?? ''),
        toNumber: String(payload.to ?? ''),
        durationSec: Number(payload.duration ?? 0),
        recordingUrl: payload.recordingUrl ? String(payload.recordingUrl) : undefined,
        provider: String(payload.provider ?? 'PBX'),
        externalId: payload.callId ? String(payload.callId) : undefined,
        endedAt: new Date(),
      },
    });
    // A missed inbound call from a known lead is worth a nudge.
    if (call.status === 'MISSED' && lead?.ownerId) {
      this.events.emit('call.missed', {
        companyId: company.id,
        leadId: lead.id,
        ownerId: lead.ownerId,
      });
    }
    return { ok: true, callId: call.id, matchedLead: !!lead };
  }

  private mapProviderStatus(s: string): CallStatus {
    const up = s.toUpperCase();
    if (up.includes('MISS') || up.includes('NO-ANSWER') || up.includes('NOANSWER')) return 'MISSED';
    if (up.includes('BUSY')) return 'BUSY';
    if (up.includes('FAIL')) return 'FAILED';
    if (up.includes('VOICE')) return 'VOICEMAIL';
    if (up.includes('ANSWER')) return 'ANSWERED';
    return 'COMPLETED';
  }
}
