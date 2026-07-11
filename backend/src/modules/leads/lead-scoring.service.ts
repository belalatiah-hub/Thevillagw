import { Injectable } from '@nestjs/common';
import { Lead, LeadSource, LeadTemperature } from '@prisma/client';

export interface ScoreInput {
  source?: LeadSource | null;
  email?: string | null;
  phone?: string | null;
  interestArea?: string | null;
  budgetMinor?: bigint | null;
  message?: string | null;
  projectId?: string | null;
}

export interface ScoreResult {
  score: number; // 0–100
  temperature: LeadTemperature;
}

/**
 * Transparent, rules-based lead scoring. Deterministic and explainable (no
 * black box) — a good default until the AI scoring model (Phase 8) is wired in
 * behind the same interface. Higher score = more sales-ready.
 */
@Injectable()
export class LeadScoringService {
  // High-intent portals and direct channels weigh more than broad social reach.
  private readonly sourceWeights: Partial<Record<LeadSource, number>> = {
    PROPERTY_FINDER: 25,
    BAYUT: 22,
    DUBIZZLE: 20,
    REFERRAL: 25,
    WHATSAPP: 20,
    PHONE_CALL: 22,
    WEBSITE: 18,
    LANDING_PAGE: 18,
    GOOGLE_ADS: 15,
    FACEBOOK: 10,
    INSTAGRAM: 10,
    TIKTOK: 8,
    MANUAL: 12,
    IMPORT: 5,
    QR_CODE: 12,
    OTHER: 5,
  };

  score(input: ScoreInput): ScoreResult {
    let score = 0;

    score += this.sourceWeights[input.source ?? LeadSource.OTHER] ?? 5;

    // Contactability
    if (input.phone) score += 15;
    if (input.email) score += 10;

    // Declared intent / qualification signals
    if (input.interestArea) score += 12;
    if (input.projectId) score += 15;
    if (input.budgetMinor && input.budgetMinor > 0n) score += 15;
    if (input.message && input.message.trim().length > 20) score += 8;

    score = Math.max(0, Math.min(100, score));
    return { score, temperature: this.temperatureFor(score) };
  }

  /** Single source of truth mapping a 0–100 score to a temperature band. */
  temperatureFor(score: number): LeadTemperature {
    return score >= 70 ? 'HOT' : score >= 40 ? 'WARM' : 'COLD';
  }

  /** Convenience: rescore an existing lead entity. */
  scoreLead(lead: Pick<Lead, keyof ScoreInput & keyof Lead>): ScoreResult {
    return this.score(lead);
  }
}
