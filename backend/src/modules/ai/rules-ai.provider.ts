import { Injectable } from '@nestjs/common';
import { AiProvider, AiSummary, LeadContext } from './ai.types';

/**
 * Deterministic, explainable AI provider — the default when no OpenAI key is
 * configured. It produces a genuinely useful summary + next action from the
 * lead's own signals (score, temperature, source, recency) with zero external
 * calls, so the feature works offline and in CI. Same interface as the LLM
 * provider, so upgrading is a config flip.
 */
@Injectable()
export class RulesAiProvider implements AiProvider {
  readonly name = 'rules-v1';

  async summarizeLead(ctx: LeadContext): Promise<AiSummary> {
    const { lead, recentActivities } = ctx;
    const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
    const temp = lead.temperature.toLowerCase();
    const daysIdle = lead.lastActivityAt
      ? Math.floor((Date.now() - new Date(lead.lastActivityAt).getTime()) / 86_400_000)
      : null;

    const bits: string[] = [
      `${name} is a ${temp} lead (score ${lead.score}/100) from ${lead.source}.`,
    ];
    if (lead.interestArea) bits.push(`Interested in ${lead.interestArea}.`);
    if (lead.budgetMinor && lead.budgetMinor > 0n) {
      bits.push(
        `Stated budget around ${(Number(lead.budgetMinor) / 100).toLocaleString()} ${lead.currency}.`,
      );
    }
    if (recentActivities.length) {
      bits.push(`Last touch: ${recentActivities[0].subject}.`);
    }
    if (daysIdle != null && daysIdle >= 3) {
      bits.push(`No activity for ${daysIdle} days — at risk of going cold.`);
    }

    let nextAction: string;
    let suggestedChannel: AiSummary['suggestedChannel'];
    if (lead.score >= 70) {
      nextAction = 'High intent — call within the hour and offer a site visit this week.';
      suggestedChannel = 'CALL';
    } else if (lead.score >= 40) {
      nextAction =
        'Send a tailored WhatsApp with 2–3 matching units, then follow up by call in 24h.';
      suggestedChannel = 'WHATSAPP';
    } else {
      nextAction =
        'Nurture: add to a drip email sequence and re-qualify budget before spending call time.';
      suggestedChannel = 'EMAIL';
    }
    if (daysIdle != null && daysIdle >= 3 && lead.score >= 40) {
      nextAction = `Re-engage now — ${nextAction}`;
    }

    // Confidence scales with how much signal we actually have.
    let signal = 0.4;
    if (lead.interestArea) signal += 0.15;
    if (lead.budgetMinor && lead.budgetMinor > 0n) signal += 0.2;
    if (recentActivities.length) signal += 0.15;

    return {
      summary: bits.join(' '),
      nextAction,
      suggestedChannel,
      confidence: Math.min(0.95, signal),
      provider: this.name,
    };
  }
}
