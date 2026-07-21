import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsListener } from './notifications.listener';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsListener, PushService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
