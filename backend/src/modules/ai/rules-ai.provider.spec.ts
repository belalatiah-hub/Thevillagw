import { Lead } from '@prisma/client';
import { RulesAiProvider } from './rules-ai.provider';

function makeLead(overrides: Partial<Lead>): Lead {
  return {
    id: 'l1',
    companyId: 'c1',
    firstName: 'Test',
    lastName: 'Lead',
    score: 50,
    temperature: 'WARM',
    source: 'WEBSITE',
    status: 'NEW',
    currency: 'EGP',
    lastActivityAt: new Date(),
    budgetMinor: null,
    interestArea: null,
    // fields not read by the provider are cast away for the test
    ...overrides,
  } as unknown as Lead;
}

describe('RulesAiProvider', () => {
  const provider = new RulesAiProvider();

  it('recommends an immediate call for a hot lead', async () => {
    const res = await provider.summarizeLead({
      lead: makeLead({ score: 85, temperature: 'HOT', interestArea: 'New Cairo' }),
      recentActivities: [],
    });
    expect(res.suggestedChannel).toBe('CALL');
    expect(res.summary).toContain('hot lead');
    expect(res.provider).toBe('rules-v1');
  });

  it('recommends nurturing for a cold lead', async () => {
    const res = await provider.summarizeLead({
      lead: makeLead({ score: 25, temperature: 'COLD' }),
      recentActivities: [],
    });
    expect(res.suggestedChannel).toBe('EMAIL');
    expect(res.confidence).toBeLessThan(0.6);
  });

  it('raises confidence as more signal is present', async () => {
    const bare = await provider.summarizeLead({
      lead: makeLead({ score: 50 }),
      recentActivities: [],
    });
    const rich = await provider.summarizeLead({
      lead: makeLead({ score: 50, interestArea: 'Zayed', budgetMinor: 500_000_00n }),
      recentActivities: [{ type: 'CALL', subject: 'Intro call', createdAt: new Date() }],
    });
    expect(rich.confidence).toBeGreaterThan(bare.confidence);
  });
});
