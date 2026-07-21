import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { LogCallDto, QueryCallsDto } from './dto/call.dto';
import { TelephonyService } from './telephony.service';

@ApiTags('telephony')
@ApiBearerAuth()
@Controller('calls')
export class TelephonyController {
  constructor(private readonly telephony: TelephonyService) {}

  @Post()
  @RequirePermissions('call:create')
  @ApiOperation({ summary: 'Log a call (click-to-call result or manual wrap-up)' })
  logCall(@CurrentUser() user: AuthUser, @Body() dto: LogCallDto) {
    return this.telephony.logCall(user, dto);
  }

  @Get()
  @RequirePermissions('call:read')
  @ApiOperation({ summary: 'Call log (scoped to the caller)' })
  list(@CurrentUser() user: AuthUser, @Query() query: QueryCallsDto) {
    return this.telephony.list(user, query);
  }

  @Get('stats')
  @RequirePermissions('call:read')
  @ApiOperation({ summary: 'Call KPIs (total, answered, missed, avg duration)' })
  stats(@CurrentUser() user: AuthUser) {
    return this.telephony.stats(user);
  }

  @Get('lead/:leadId')
  @RequirePermissions('call:read')
  @ApiOperation({ summary: 'Call history for a lead' })
  forLead(@CurrentUser() user: AuthUser, @Param('leadId') leadId: string) {
    return this.telephony.forLead(user, leadId);
  }

  @Public()
  @Post('webhook/:companySlug')
  @ApiOperation({ summary: 'Public: PBX / telephony provider call-event webhook' })
  webhook(@Param('companySlug') companySlug: string, @Req() req: Request) {
    const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as Record<
      string,
      unknown
    >;
    return this.telephony.ingestWebhook(companySlug, body ?? {});
  }
}

function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s || '{}');
  } catch {
    return {};
  }
}
