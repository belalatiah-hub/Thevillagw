import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AiService } from './ai.service';
import { BriefRole } from './role-brief';

const ROLES: BriefRole[] = ['AGENT', 'MANAGER', 'DIRECTOR', 'FINANCE', 'MARKETING', 'CEO'];

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('leads/:id/summary')
  @RequirePermissions('lead:read')
  @ApiOperation({ summary: 'AI summary + recommended next action for a lead' })
  summarize(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ai.summarizeLead(user, id);
  }

  @Get('assistant')
  @RequirePermissions('dashboard:read')
  @ApiOperation({ summary: 'Role-aware AI brief: headline, insights, next actions' })
  @ApiQuery({ name: 'role', required: false, enum: ROLES })
  assistant(@CurrentUser() user: AuthUser, @Query('role') role?: string) {
    // The requested role is only honoured when the caller's own permissions
    // justify it. Previously ?role=CEO returned company-wide revenue, weighted
    // forecast and commission totals to any authenticated user.
    const permissions = user.permissions ?? [];
    const has = (p: string) => permissions.includes('*') || permissions.includes(p);
    const allowed: BriefRole[] = ['AGENT'];
    if (has('report:read') || has('dashboard:read')) allowed.push('MANAGER');
    if (has('finance:read') || has('commission:read')) allowed.push('FINANCE');
    if (has('*')) allowed.push('CEO');
    const requested = role as BriefRole;
    const chosen: BriefRole =
      ROLES.includes(requested) && allowed.includes(requested) ? requested : allowed[allowed.length - 1];
    return this.ai.assistant(user, chosen);
  }
}
