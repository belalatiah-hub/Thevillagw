import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListNotificationsDto } from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';

/**
 * Notifications are strictly user-owned: every endpoint scopes to the caller's
 * own inbox, so no RBAC permission key is required beyond being authenticated.
 * The JwtAuthGuard (global) already enforces that.
 */
@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's notifications" })
  list(@CurrentUser() user: AuthUser, @Query() query: ListNotificationsDto) {
    return this.notifications.list(user.companyId, user.id, {
      unreadOnly: query.unreadOnly === 'true',
      take: query.take,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread badge count for the bell' })
  async unreadCount(@CurrentUser() user: AuthUser) {
    return { count: await this.notifications.unreadCount(user.companyId, user.id) };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark one notification as read' })
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.notifications.markRead(user.companyId, user.id, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark every notification as read' })
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.notifications.markAllRead(user.companyId, user.id);
  }
}
