import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadScoringService } from './lead-scoring.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, LeadScoringService],
  exports: [LeadsService, LeadScoringService],
})
export class LeadsModule {}
