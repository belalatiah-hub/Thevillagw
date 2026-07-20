import { LeadFacts, matchesConditions } from './automation.types';

const lead: LeadFacts = {
  source: 'WEBSITE',
  temperature: 'HOT',
  score: 82,
  interestArea: 'New Cairo',
};

describe('matchesConditions', () => {
  it('matches when no conditions are set', () => {
    expect(matchesConditions(null, lead)).toBe(true);
    expect(matchesConditions({}, lead)).toBe(true);
  });

  it('matches on source inclusion', () => {
    expect(matchesConditions({ source: ['WEBSITE', 'FACEBOOK'] }, lead)).toBe(true);
    expect(matchesConditions({ source: ['TIKTOK'] }, lead)).toBe(false);
  });

  it('matches on temperature', () => {
    expect(matchesConditions({ temperature: ['HOT'] }, lead)).toBe(true);
    expect(matchesConditions({ temperature: ['COLD'] }, lead)).toBe(false);
  });

  it('matches on minScore threshold', () => {
    expect(matchesConditions({ minScore: 70 }, lead)).toBe(true);
    expect(matchesConditions({ minScore: 90 }, lead)).toBe(false);
  });

  it('matches area by case-insensitive substring', () => {
    expect(matchesConditions({ area: ['cairo'] }, lead)).toBe(true);
    expect(matchesConditions({ area: ['zayed'] }, lead)).toBe(false);
  });

  it('requires ALL specified conditions', () => {
    expect(matchesConditions({ source: ['WEBSITE'], minScore: 90 }, lead)).toBe(false);
    expect(
      matchesConditions({ source: ['WEBSITE'], minScore: 70, temperature: ['HOT'] }, lead),
    ).toBe(true);
  });
});
