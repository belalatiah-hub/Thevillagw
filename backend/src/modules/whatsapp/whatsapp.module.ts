import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappListener } from './whatsapp.listener';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [NotificationsModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappListener],
  exports: [WhatsappService],
})
export class WhatsappModule {}
