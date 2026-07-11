/**
 * Domain event names + payloads. Services emit these via EventEmitter2; the
 * EventsGateway relays them to the right company's socket room in realtime.
 * Decoupled by design: emitting a lead event never needs to know a gateway
 * exists.
 */
export const DOMAIN_EVENTS = {
  LEAD_CAPTURED: 'lead.captured',
  LEAD_ASSIGNED: 'lead.assigned',
  OPPORTUNITY_MOVED: 'opportunity.moved',
} as const;

export interface CompanyScopedEvent {
  companyId: string;
}

export interface LeadCapturedEvent extends CompanyScopedEvent {
  leadId: string;
  firstName: string;
  source: string;
  score: number;
  temperature: string;
}

export interface LeadAssignedEvent extends CompanyScopedEvent {
  leadId: string;
  ownerId: string;
}

export interface OpportunityMovedEvent extends CompanyScopedEvent {
  opportunityId: string;
  stageId: string;
  status: string;
}
