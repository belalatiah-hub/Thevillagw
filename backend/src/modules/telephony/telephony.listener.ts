import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationPriority, NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

/** Turns a missed inbound call from a known lead into an actionable notification. */
@Injectable()
export class TelephonyListener {
  private readonly logger = new Logger(TelephonyListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @OnEvent('call.missed')
  async onMissedCall(e: { companyId: string; leadId: string; ownerId: string }): Promise<void> {
    try {
      const lead = await this.prisma.lead.findFirst({
        where: { id: e.leadId, companyId: e.companyId },
        select: { firstName: true, lastName: true, phone: true },
      });
      const name = [lead?.firstName, lead?.lastName].filter(Boolean).join(' ') || 'a lead';
      await this.notifications.create({
        companyId: e.companyId,
        userId: e.ownerId,
        type: NotificationType.SLA_DUE,
        priority: NotificationPriority.HIGH,
        title: `📞 Missed call from ${name}`,
        body: lead?.phone ? `Call back ${lead.phone} now` : 'Call back now',
        entityType: 'lead',
        entityId: e.leadId,
        push: true,
      });
    } catch (err) {
      this.logger.warn(`missed-call notification failed: ${(err as Error).message}`);
    }
  }
}
