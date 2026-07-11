import { LeadSource } from '@prisma/client';
import { LeadScoringService } from './lead-scoring.service';

describe('LeadScoringService', () => {
  const service = new LeadScoringService();

  it('scores a fully-qualified portal lead as HOT', () => {
    const result = service.score({
      source: LeadSource.PROPERTY_FINDER,
      phone: '+201016000201',
      email: 'buyer@example.com',
      interestArea: 'New Cairo',
      projectId: 'proj_1',
      budgetMinor: 900_000_000n,
      message: 'I am ready to reserve a 3-bedroom unit this month.',
    });
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.temperature).toBe('HOT');
  });

  it('scores a bare social lead as COLD', () => {
    const result = service.score({ source: LeadSource.TIKTOK, phone: null, email: null });
    expect(result.score).toBeLessThan(40);
    expect(result.temperature).toBe('COLD');
  });

  it('never exceeds 100 or drops below 0', () => {
    const max = service.score({
      source: LeadSource.REFERRAL,
      phone: '1',
      email: 'a@b.com',
      interestArea: 'x',
      projectId: 'p',
      budgetMinor: 1n,
      message: 'a long enough message to earn the bonus points here',
    });
    expect(max.score).toBeLessThanOrEqual(100);

    const min = service.score({ source: LeadSource.OTHER });
    expect(min.score).toBeGreaterThanOrEqual(0);
  });

  it('is deterministic for identical input', () => {
    const input = { source: LeadSource.WEBSITE, phone: '+201000000000', email: 'a@b.com' };
    expect(service.score(input)).toEqual(service.score(input));
  });
});
