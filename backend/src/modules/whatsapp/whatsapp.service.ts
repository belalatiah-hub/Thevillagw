import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, WaMessageStatus } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { normalizePhone } from '../../common/util/phone';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/scope/scope.service';
import { SendWaMessageDto, StartConversationDto } from './dto/whatsapp.dto';

/** Built-in message templates (a tenant would sync these from WhatsApp Business). */
export const WA_TEMPLATES = [
  {
    name: 'welcome',
    label: 'Welcome',
    body: 'Hi {{name}} 👋 thanks for your interest in The Village. How can I help you today?',
  },
  {
    name: 'hot_intro',
    label: 'Hot lead intro',
    body: 'Hi {{name}}! I have a unit that matches exactly what you asked for — free for a quick call today?',
  },
  {
    name: 'payment_plan',
    label: 'Payment plan',
    body: 'Here is a 10% down / 8-year plan for {{project}} that fits your budget. Want the full breakdown?',
  },
  {
    name: 'site_visit',
    label: 'Site visit',
    body: 'Would you like to book a site visit at {{project}} this week? I can arrange transport.',
  },
  {
    name: 'follow_up',
    label: 'Follow up',
    body: 'Just following up 🙂 are you still looking in {{area}}? I have new options.',
  },
];

@Injectable()
export class WhatsappService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly scope: ScopeService,
  ) {}

  templates() {
    return WA_TEMPLATES;
  }

  /** Conversations inbox — scoped: agents see conversations assigned to them. */
  async listConversations(user: AuthUser) {
    const ownerIds = await this.scope.visibleOwnerIds(user);
    const where: Prisma.WaConversationWhereInput = {
      companyId: user.companyId,
      ...(ownerIds ? { OR: [{ assigneeId: { in: ownerIds } }, { assigneeId: null }] } : {}),
    };
    return this.prisma.waConversation.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  /** Open a conversation (returns its messages) and clear its unread counter. */
  async getConversation(user: AuthUser, id: string) {
    const convo = await this.prisma.waConversation.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
    });
    if (!convo) throw new NotFoundException('Conversation not found');
    if (convo.unread > 0) {
      await this.prisma.waConversation.update({ where: { id }, data: { unread: 0 } });
    }
    return convo;
  }

  /** Start (or reuse) a conversation with a lead. */
  async startConversation(user: AuthUser, dto: StartConversationDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: dto.leadId, companyId: user.companyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        phoneNormalized: true,
        ownerId: true,
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    const waNumber = lead.phone ?? lead.phoneNormalized ?? dto.waNumber ?? '';
    return this.prisma.waConversation.upsert({
      where: { companyId_waNumber: { companyId: user.companyId, waNumber } },
      update: { assigneeId: lead.ownerId ?? user.id },
      create: {
        companyId: user.companyId,
        leadId: lead.id,
        assigneeId: lead.ownerId ?? user.id,
        waNumber,
        contactName: [lead.firstName, lead.lastName].filter(Boolean).join(' '),
      },
    });
  }

  /**
   * Send an outbound message. If the tenant has WhatsApp Cloud connected the
   * message is marked SENT (transport is wired at the integration boundary),
   * otherwise it is QUEUED until they connect it — never lost.
   */
  async sendMessage(user: AuthUser, conversationId: string, dto: SendWaMessageDto) {
    const convo = await this.prisma.waConversation.findFirst({
      where: { id: conversationId, companyId: user.companyId },
      select: { id: true },
    });
    if (!convo) throw new NotFoundException('Conversation not found');

    const connected = await this.isConnected(user.companyId);
    const template = dto.templateName
      ? WA_TEMPLATES.find((t) => t.name === dto.templateName)
      : null;
    const body = dto.body ?? template?.body ?? '';

    const message = await this.prisma.waMessage.create({
      data: {
        companyId: user.companyId,
        conversationId,
        direction: 'OUTBOUND',
        type: dto.templateName ? 'TEMPLATE' : 'TEXT',
        body,
        templateName: dto.templateName,
        status: connected ? WaMessageStatus.SENT : WaMessageStatus.QUEUED,
        senderId: user.id,
      },
    });
    await this.prisma.waConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), status: 'OPEN' },
    });
    return { message, delivery: connected ? 'sent' : 'queued — connect WhatsApp Cloud to deliver' };
  }

  /**
   * Public inbound webhook (WhatsApp Cloud). Finds/creates the conversation by
   * the sender's number, correlates a lead by phone, appends the message and
   * bumps the unread counter; notifies the assignee.
   */
  async ingestWebhook(companySlug: string, payload: Record<string, unknown>) {
    const company = await this.prisma.company.findUnique({
      where: { slug: companySlug },
      select: { id: true },
    });
    if (!company) return { ok: false, reason: 'unknown company' };

    const from = String(payload.from ?? payload.waId ?? '');
    const text = String(payload.text ?? payload.body ?? '');
    if (!from) return { ok: false, reason: 'no sender' };
    const normalized = normalizePhone(from);
    const lead = normalized
      ? await this.prisma.lead.findFirst({
          where: { companyId: company.id, phoneNormalized: normalized },
          select: { id: true, ownerId: true, firstName: true, lastName: true },
        })
      : null;

    const convo = await this.prisma.waConversation.upsert({
      where: { companyId_waNumber: { companyId: company.id, waNumber: from } },
      update: { unread: { increment: 1 }, lastMessageAt: new Date(), status: 'OPEN' },
      create: {
        companyId: company.id,
        leadId: lead?.id,
        assigneeId: lead?.ownerId ?? undefined,
        waNumber: from,
        contactName: lead
          ? [lead.firstName, lead.lastName].filter(Boolean).join(' ')
          : String(payload.name ?? from),
        unread: 1,
      },
    });
    await this.prisma.waMessage.create({
      data: {
        companyId: company.id,
        conversationId: convo.id,
        direction: 'INBOUND',
        type: 'TEXT',
        body: text,
        status: WaMessageStatus.RECEIVED,
        externalId: payload.messageId ? String(payload.messageId) : undefined,
      },
    });
    if (convo.assigneeId) {
      this.events.emit('whatsapp.inbound', {
        companyId: company.id,
        userId: convo.assigneeId,
        conversationId: convo.id,
        leadId: lead?.id,
        preview: text.slice(0, 80),
      });
    }
    return { ok: true, conversationId: convo.id, matchedLead: !!lead };
  }

  private async isConnected(companyId: string): Promise<boolean> {
    const wa = await this.prisma.integration.findFirst({
      where: { companyId, provider: 'WHATSAPP_CLOUD', enabled: true, status: 'CONNECTED' },
      select: { id: true },
    });
    return !!wa;
  }
}
