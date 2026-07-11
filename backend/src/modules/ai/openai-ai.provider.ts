import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiSummary, LeadContext } from './ai.types';
import { RulesAiProvider } from './rules-ai.provider';

/**
 * OpenAI-backed provider (Phase 8). Active only when OPENAI_API_KEY is set.
 * Uses the built-in fetch (Node 18+) — no SDK dependency — and always falls
 * back to the deterministic provider on any error, so an AI outage never
 * breaks the CRM. Responses are constrained to strict JSON.
 */
@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly apiKey?: string;
  private readonly model: string;

  constructor(
    config: ConfigService,
    private readonly fallback: RulesAiProvider,
  ) {
    this.apiKey = config.get<string>('openaiApiKey');
    this.model = config.get<string>('openaiModel') ?? 'gpt-4o-mini';
  }

  async summarizeLead(ctx: LeadContext): Promise<AiSummary> {
    if (!this.apiKey) {
      return this.fallback.summarizeLead(ctx);
    }
    try {
      const payload = this.buildPrompt(ctx);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are a senior real-estate sales assistant. Return STRICT JSON with keys ' +
                '"summary" (<=60 words), "nextAction" (<=30 words), "suggestedChannel" ' +
                '(one of CALL, WHATSAPP, EMAIL, MEETING), "confidence" (0-1).',
            },
            { role: 'user', content: payload },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenAI ${res.status}`);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty completion');
      }
      const parsed = JSON.parse(content) as Partial<AiSummary>;
      return {
        summary: parsed.summary ?? '',
        nextAction: parsed.nextAction ?? '',
        suggestedChannel: parsed.suggestedChannel ?? 'CALL',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.6,
        provider: this.name,
      };
    } catch (err) {
      this.logger.warn(`OpenAI summarize failed, using fallback: ${(err as Error).message}`);
      return this.fallback.summarizeLead(ctx);
    }
  }

  private buildPrompt(ctx: LeadContext): string {
    const { lead, recentActivities } = ctx;
    return JSON.stringify({
      name: [lead.firstName, lead.lastName].filter(Boolean).join(' '),
      score: lead.score,
      temperature: lead.temperature,
      source: lead.source,
      status: lead.status,
      interestArea: lead.interestArea,
      budget: lead.budgetMinor ? Number(lead.budgetMinor) / 100 : null,
      currency: lead.currency,
      recentActivities: recentActivities.slice(0, 5).map((a) => `${a.type}: ${a.subject}`),
    });
  }
}
