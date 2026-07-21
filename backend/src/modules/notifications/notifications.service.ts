import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationPriority, NotificationType, Prisma } from '@prisma/client';
import { DOMAIN_EVENTS, NotificationCreatedEvent } from '../../common/events/domain-events';
import { PrismaService } from '../../prisma/prisma.service';
import { PushService } from './push.service';

export interface CreateNotificationInput {
  companyId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  priority?: NotificationPriority;
  entityType?: string;
  entityId?: string;
  data?: Prisma.InputJsonValue;
  /** When true, also attempt an FCM push (if the tenant has it connected). */
  push?: boolean;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly pushService: PushService,
  ) {}

  /**
   * Persist a notification, relay it to the recipient's socket for a live bell,
   * and optionally dispatch an FCM push. The push is best-effort and never
   * blocks the in-app notification.
   */
  async create(input: CreateNotificationInput) {
    const pushable = input.push !== false;
    const pushResult = pushable
      ? await this.pushService.send(input.companyId, input.userId, {
          title: input.title,
          body: input.body,
          data: input.entityId
            ? { entityType: input.entityType ?? '', entityId: input.entityId }
            : undefined,
        })
      : { dispatched: false };

    const notification = await this.prisma.notification.create({
      data: {
        companyId: input.companyId,
        userId: input.userId,
        type: input.type,
        priority: input.priority ?? NotificationPriority.NORMAL,
        title: input.title,
        body: input.body,
        entityType: input.entityType,
        entityId: input.entityId,
        data: input.data,
        pushedAt: pushResult.dispatched ? new Date() : null,
      },
    });

    const payload: NotificationCreatedEvent = {
      companyId: input.companyId,
      userId: input.userId,
      notification: {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        body: notification.body,
        entityType: notification.entityType,
        entityId: notification.entityId,
        createdAt: notification.createdAt,
      },
    };
    this.events.emit(DOMAIN_EVENTS.NOTIFICATION_CREATED, payload);
    return notification;
  }

  /** A user's notifications, newest first. `unreadOnly` narrows to the unread inbox. */
  list(companyId: string, userId: string, opts: { unreadOnly?: boolean; take?: number } = {}) {
    return this.prisma.notification.findMany({
      where: { companyId, userId, ...(opts.unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: Math.min(opts.take ?? 50, 100),
    });
  }

  async unreadCount(companyId: string, userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { companyId, userId, read: false } });
  }

  /** Mark one notification read — scoped to the owner so users can't touch others'. */
  async markRead(companyId: string, userId: string, id: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, companyId, userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  async markAllRead(companyId: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { companyId, userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { updated: result.count };
  }
}
