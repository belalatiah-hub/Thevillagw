import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/action.dto';

@ApiTags('actions')
@ApiBearerAuth()
@Controller()
export class ActionsController {
  constructor(private readonly actions: ActionsService) {}

  @Post('leads/:leadId/actions')
  @RequirePermissions('lead:update')
  @ApiOperation({ summary: 'Log a lead action (next action + stage date + comment)' })
  create(
    @CurrentUser() user: AuthUser,
    @Param('leadId') leadId: string,
    @Body() dto: CreateActionDto,
  ) {
    return this.actions.create(user, leadId, dto);
  }

  @Get('leads/:leadId/actions')
  @RequirePermissions('lead:read')
  @ApiOperation({ summary: 'Action history for a lead' })
  history(@CurrentUser() user: AuthUser, @Param('leadId') leadId: string) {
    return this.actions.history(user, leadId);
  }

  @Get('actions/my')
  @RequirePermissions('lead:read')
  @ApiOperation({ summary: "The caller's upcoming planned actions" })
  myFeed(@CurrentUser() user: AuthUser) {
    return this.actions.myFeed(user);
  }

  @Get('actions/delayed')
  @RequirePermissions('lead:read')
  @ApiOperation({ summary: 'Overdue actions backlog (Total Delay)' })
  delayed(@CurrentUser() user: AuthUser) {
    return this.actions.delayed(user);
  }

  @Post('actions/:id/complete')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('lead:update')
  @ApiOperation({ summary: 'Mark an action done' })
  complete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.actions.complete(user, id);
  }

  @Get('actions/efficiency')
  @RequirePermissions('lead:read')
  @ApiOperation({ summary: 'Efficiency tracker: agent leaderboard + totals (scoped)' })
  efficiency(@CurrentUser() user: AuthUser) {
    return this.actions.efficiency(user);
  }
}
