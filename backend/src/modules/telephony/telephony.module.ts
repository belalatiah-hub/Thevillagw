import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { TelephonyController } from './telephony.controller';
import { TelephonyListener } from './telephony.listener';
import { TelephonyService } from './telephony.service';

@Module({
  imports: [NotificationsModule],
  controllers: [TelephonyController],
  providers: [TelephonyService, TelephonyListener],
  exports: [TelephonyService],
})
export class TelephonyModule {}
