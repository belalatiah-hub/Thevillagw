import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AutomationTrigger } from '@prisma/client';
import { DOMAIN_EVENTS, LeadCapturedEvent } from '../../common/events/domain-events';
import { AutomationService } from './automation.service';

/**
 * Bridges domain events to the automation engine. Decoupled: emitting a
 * lead event never needs to know the engine exists.
 */
@Injectable()
export class AutomationListener {
  private readonly logger = new Logger(AutomationListener.name);

  constructor(private readonly automation: AutomationService) {}

  @OnEvent(DOMAIN_EVENTS.LEAD_CAPTURED)
  onCaptured(e: LeadCapturedEvent): void {
    void this.automation
      .runForLead(e.companyId, e.leadId, AutomationTrigger.LEAD_CAPTURED)
      .catch((err) => this.logger.error(`automation (captured) failed: ${err.message}`));
  }

  @OnEvent(DOMAIN_EVENTS.LEAD_CREATED)
  onCreated(e: LeadCapturedEvent): void {
    void this.automation
      .runForLead(e.companyId, e.leadId, AutomationTrigger.LEAD_CREATED)
      .catch((err) => this.logger.error(`automation (created) failed: ${err.message}`));
  }
}
