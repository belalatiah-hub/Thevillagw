import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

/** Notifies the assignee when a customer replies on WhatsApp. */
@Injectable()
export class WhatsappListener {
  private readonly logger = new Logger(WhatsappListener.name);

  constructor(private readonly notifications: NotificationsService) {}

  @OnEvent('whatsapp.inbound')
  async onInbound(e: {
    companyId: string;
    userId: string;
    conversationId: string;
    leadId?: string;
    preview: string;
  }): Promise<void> {
    try {
      await this.notifications.create({
        companyId: e.companyId,
        userId: e.userId,
        type: NotificationType.MENTION,
        title: '💬 New WhatsApp message',
        body: e.preview || 'Open the conversation to reply',
        entityType: e.leadId ? 'lead' : 'whatsapp',
        entityId: e.leadId ?? e.conversationId,
        push: true,
      });
    } catch (err) {
      this.logger.warn(`whatsapp.inbound notification failed: ${(err as Error).message}`);
    }
  }
}
