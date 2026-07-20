/**
 * Automation rule shapes + a pure condition matcher. Keeping matching pure and
 * side-effect free makes the engine trivially testable and identical wherever
 * it runs.
 */

export type AutomationActionType =
  | 'ASSIGN_ROUND_ROBIN'
  | 'ASSIGN_USER'
  | 'CREATE_FOLLOW_UP'
  | 'START_SLA'
  | 'SEND_WHATSAPP_TEMPLATE'
  | 'GENERATE_AI_SUMMARY'
  | 'NOTIFY_OWNER';

export interface AutomationAction {
  type: AutomationActionType;
  minutes?: number; // for CREATE_FOLLOW_UP / START_SLA
  userId?: string; // for ASSIGN_USER
  template?: string; // for SEND_WHATSAPP_TEMPLATE
}

export interface AutomationConditions {
  source?: string[];
  temperature?: string[];
  minScore?: number;
  area?: string[]; // substring match against interestArea
}

/** The lead facts a rule is evaluated against. */
export interface LeadFacts {
  source: string;
  temperature: string;
  score: number;
  interestArea?: string | null;
}

/** True when every specified condition passes (unspecified conditions are ignored). */
export function matchesConditions(
  conditions: AutomationConditions | null | undefined,
  lead: LeadFacts,
): boolean {
  if (!conditions) return true;

  if (conditions.source?.length && !conditions.source.includes(lead.source)) {
    return false;
  }
  if (conditions.temperature?.length && !conditions.temperature.includes(lead.temperature)) {
    return false;
  }
  if (typeof conditions.minScore === 'number' && lead.score < conditions.minScore) {
    return false;
  }
  if (conditions.area?.length) {
    const area = (lead.interestArea ?? '').toLowerCase();
    const hit = conditions.area.some((a) => area.includes(a.toLowerCase()));
    if (!hit) return false;
  }
  return true;
}
