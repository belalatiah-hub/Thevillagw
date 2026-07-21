import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  DOMAIN_EVENTS,
  LeadAssignedEvent,
  LeadCapturedEvent,
  NotificationCreatedEvent,
  OpportunityMovedEvent,
} from '../../common/events/domain-events';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

/**
 * Realtime gateway. Clients connect with their access token (handshake
 * `auth.token` or `Authorization` header); on success they join a room scoped
 * to their company, so a broadcast only reaches that tenant. Domain events are
 * relayed straight to the room — the sales board and lead inbox update live.
 */
@WebSocketGateway({ cors: { origin: true }, namespace: '/realtime' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) {
        throw new Error('missing token');
      }
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });
      client.data.companyId = payload.companyId;
      client.data.userId = payload.sub;
      await client.join(this.room(payload.companyId));
      await client.join(this.userRoom(payload.sub));
      this.logger.debug(`socket ${client.id} joined company ${payload.companyId}`);
    } catch (err) {
      this.logger.debug(`socket ${client.id} rejected: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`socket ${client.id} disconnected`);
  }

  @OnEvent(DOMAIN_EVENTS.LEAD_CAPTURED)
  onLeadCaptured(e: LeadCapturedEvent): void {
    this.server.to(this.room(e.companyId)).emit(DOMAIN_EVENTS.LEAD_CAPTURED, e);
  }

  @OnEvent(DOMAIN_EVENTS.LEAD_ASSIGNED)
  onLeadAssigned(e: LeadAssignedEvent): void {
    this.server.to(this.room(e.companyId)).emit(DOMAIN_EVENTS.LEAD_ASSIGNED, e);
  }

  @OnEvent(DOMAIN_EVENTS.OPPORTUNITY_MOVED)
  onOpportunityMoved(e: OpportunityMovedEvent): void {
    this.server.to(this.room(e.companyId)).emit(DOMAIN_EVENTS.OPPORTUNITY_MOVED, e);
  }

  /** Deliver a notification only to the recipient's own sockets (live bell). */
  @OnEvent(DOMAIN_EVENTS.NOTIFICATION_CREATED)
  onNotificationCreated(e: NotificationCreatedEvent): void {
    this.server
      .to(this.userRoom(e.userId))
      .emit(DOMAIN_EVENTS.NOTIFICATION_CREATED, e.notification);
  }

  private room(companyId: string): string {
    return `company:${companyId}`;
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}
