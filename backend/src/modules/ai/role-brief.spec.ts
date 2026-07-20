import { BriefStats, buildRoleBrief } from './role-brief';

const base: BriefStats = {
  totalLeads: 120,
  newToday: 6,
  hot: 3,
  pipelineOpenMinor: 6_000_000_00n, // EGP 6.0M
  weightedForecastMinor: 2_800_000_00n,
  wonThisMonthMinor: 900_000_00n,
  openCount: 7,
  currency: 'EGP',
  topSource: { source: 'Facebook', count: 42 },
  topOwner: { name: 'Fatma Sayed', leads: 30 },
  commissionPendingMinor: 184_000_00n,
  commissionPaidMinor: 380_000_00n,
};

describe('buildRoleBrief', () => {
  it('gives an agent a call-first recommendation when there are hot leads', () => {
    const b = buildRoleBrief('AGENT', base);
    expect(b.role).toBe('AGENT');
    expect(b.headline).toContain('3 hot lead');
    expect(b.recommendations.join(' ')).toMatch(/call/i);
  });

  it('surfaces team forecast for a manager', () => {
    const b = buildRoleBrief('MANAGER', base);
    expect(b.headline).toMatch(/EGP 6\.00M/);
    expect(b.headline).toMatch(/EGP 2\.80M/);
    expect(b.insights.join(' ')).toContain('Fatma Sayed');
  });

  it('leads with pending commission for finance', () => {
    const b = buildRoleBrief('FINANCE', base);
    expect(b.headline).toMatch(/EGP 900K|EGP 0\.90M|900K/);
    expect(b.insights.join(' ')).toMatch(/Pending commission/i);
  });

  it('names the top source for marketing', () => {
    const b = buildRoleBrief('MARKETING', base);
    expect(b.headline).toContain('Facebook');
  });

  it('gives the CEO a revenue + forecast headline', () => {
    const b = buildRoleBrief('CEO', base);
    expect(b.headline).toMatch(/won this month/i);
    expect(b.recommendations.length).toBeGreaterThan(0);
  });

  it('handles an empty pipeline without crashing', () => {
    const empty: BriefStats = {
      ...base,
      hot: 0,
      newToday: 0,
      topSource: null,
      topOwner: null,
      commissionPendingMinor: 0n,
    };
    expect(() => buildRoleBrief('MANAGER', empty)).not.toThrow();
    expect(buildRoleBrief('MARKETING', empty).headline).toMatch(/balanced/i);
  });
});
