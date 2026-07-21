import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationPriority, NotificationType } from '@prisma/client';
import {
  DOMAIN_EVENTS,
  LeadAssignedEvent,
  OpportunityMovedEvent,
} from '../../common/events/domain-events';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

/**
 * Translates domain events into user-facing notifications. Decoupled from the
 * services that emit them — adding a new notification trigger never touches the
 * lead/opportunity code. Handlers are defensive: a missing owner or lead is
 * skipped silently, never throwing back into the emitter.
 */
@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @OnEvent(DOMAIN_EVENTS.LEAD_ASSIGNED)
  async onLeadAssigned(e: LeadAssignedEvent): Promise<void> {
    try {
      const lead = await this.prisma.lead.findFirst({
        where: { id: e.leadId, companyId: e.companyId },
        select: {
          firstName: true,
          lastName: true,
          source: true,
          temperature: true,
          interestArea: true,
        },
      });
      if (!lead) return;
      const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'New lead';
      const hot = lead.temperature === 'HOT';
      await this.notifications.create({
        companyId: e.companyId,
        userId: e.ownerId,
        type: NotificationType.LEAD_ASSIGNED,
        priority: hot ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
        title: `New lead assigned: ${name}`,
        body: [
          lead.source ? `Source: ${lead.source.toLowerCase()}` : null,
          lead.interestArea ? `Interested in ${lead.interestArea}` : null,
          hot ? '🔥 Hot — respond within your SLA' : null,
        ]
          .filter(Boolean)
          .join(' · '),
        entityType: 'lead',
        entityId: e.leadId,
        push: true,
      });
    } catch (err) {
      this.logger.warn(`lead.assigned notification failed: ${(err as Error).message}`);
    }
  }

  @OnEvent(DOMAIN_EVENTS.OPPORTUNITY_MOVED)
  async onOpportunityMoved(e: OpportunityMovedEvent): Promise<void> {
    try {
      const opp = await this.prisma.opportunity.findFirst({
        where: { id: e.opportunityId, companyId: e.companyId },
        select: { ownerId: true, title: true, stage: { select: { name: true } } },
      });
      if (!opp?.ownerId) return;
      const won = e.status === 'WON';
      const lost = e.status === 'LOST';
      await this.notifications.create({
        companyId: e.companyId,
        userId: opp.ownerId,
        type: NotificationType.OPPORTUNITY_MOVED,
        priority: won ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
        title: won
          ? `🎉 Deal won: ${opp.title}`
          : lost
            ? `Deal lost: ${opp.title}`
            : `Deal moved to ${opp.stage?.name ?? 'next stage'}: ${opp.title}`,
        entityType: 'opportunity',
        entityId: e.opportunityId,
        push: won,
      });
    } catch (err) {
      this.logger.warn(`opportunity.moved notification failed: ${(err as Error).message}`);
    }
  }
}
