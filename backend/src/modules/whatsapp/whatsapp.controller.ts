import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { SendWaMessageDto, StartConversationDto } from './dto/whatsapp.dto';
import { WhatsappService } from './whatsapp.service';

@ApiTags('whatsapp')
@ApiBearerAuth()
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsapp: WhatsappService) {}

  @Get('templates')
  @RequirePermissions('whatsapp:read')
  @ApiOperation({ summary: 'Message templates' })
  templates() {
    return this.whatsapp.templates();
  }

  @Get('conversations')
  @RequirePermissions('whatsapp:read')
  @ApiOperation({ summary: 'Conversation inbox (scoped)' })
  conversations(@CurrentUser() user: AuthUser) {
    return this.whatsapp.listConversations(user);
  }

  @Get('conversations/:id')
  @RequirePermissions('whatsapp:read')
  @ApiOperation({ summary: 'Open a conversation with its messages' })
  conversation(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.whatsapp.getConversation(user, id);
  }

  @Post('conversations/:id/messages')
  @RequirePermissions('whatsapp:create')
  @ApiOperation({ summary: 'Send a message (free text or template)' })
  send(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SendWaMessageDto) {
    return this.whatsapp.sendMessage(user, id, dto);
  }

  @Post('start')
  @RequirePermissions('whatsapp:create')
  @ApiOperation({ summary: 'Start (or reuse) a conversation with a lead' })
  start(@CurrentUser() user: AuthUser, @Body() dto: StartConversationDto) {
    return this.whatsapp.startConversation(user, dto);
  }

  @Public()
  @Post('webhook/:companySlug')
  @ApiOperation({ summary: 'Public: WhatsApp Cloud inbound message webhook' })
  webhook(@Param('companySlug') companySlug: string, @Req() req: Request) {
    const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as Record<
      string,
      unknown
    >;
    return this.whatsapp.ingestWebhook(companySlug, body ?? {});
  }
}

function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s || '{}');
  } catch {
    return {};
  }
}
