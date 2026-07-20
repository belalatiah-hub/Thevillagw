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
  @ApiOperation({ summary: 'Role-aware AI brief: headline, insights, next actions' })
  @ApiQuery({ name: 'role', required: false, enum: ROLES })
  assistant(@CurrentUser() user: AuthUser, @Query('role') role?: string) {
    const chosen = ROLES.includes(role as BriefRole) ? (role as BriefRole) : 'AGENT';
    return this.ai.assistant(user, chosen);
  }
}
