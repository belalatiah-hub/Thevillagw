import { Lead } from '@prisma/client';

/**
 * The AI provider contract. Both the deterministic rules provider and the
 * OpenAI-backed provider implement this, so callers (services/controllers)
 * never know which is active — swapping providers is a config change, not a
 * code change. This is the seam the Phase-8 model plugs into.
 */
export const AI_PROVIDER = Symbol('AI_PROVIDER');

export interface LeadContext {
  lead: Lead;
  recentActivities: { type: string; subject: string; createdAt: Date }[];
}

export interface AiSummary {
  summary: string;
  nextAction: string;
  suggestedChannel: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING';
  confidence: number; // 0–1
  provider: string;
}

export interface AiProvider {
  readonly name: string;
  /** A short natural-language summary + recommended next action for a lead. */
  summarizeLead(ctx: LeadContext): Promise<AiSummary>;
}
