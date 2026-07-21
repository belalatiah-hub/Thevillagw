import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { DistributionModule } from '../distribution/distribution.module';
import { AutomationController } from './automation.controller';
import { AutomationListener } from './automation.listener';
import { AutomationService } from './automation.service';

@Module({
  imports: [AiModule, DistributionModule],
  controllers: [AutomationController],
  providers: [AutomationService, AutomationListener],
  exports: [AutomationService],
})
export class AutomationModule {}
