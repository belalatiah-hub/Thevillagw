import { resolveScope } from './data-scope';

describe('resolveScope (data visibility)', () => {
  it('grants "all" to leadership and finance roles', () => {
    expect(resolveScope(['CEO'])).toBe('all');
    expect(resolveScope(['SALES_DIRECTOR'])).toBe('all');
    expect(resolveScope(['SALES_MANAGER'])).toBe('all');
    expect(resolveScope(['FINANCE'])).toBe('all');
    expect(resolveScope(['MARKETING_MANAGER'])).toBe('all');
  });

  it('grants "team" to supervisors and team leaders', () => {
    expect(resolveScope(['TEAM_LEADER'])).toBe('team');
    expect(resolveScope(['SUPERVISOR'])).toBe('team');
  });

  it('grants "own" to front-line agents', () => {
    expect(resolveScope(['SALES_AGENT'])).toBe('own');
    expect(resolveScope(['PROPERTY_CONSULTANT'])).toBe('own');
    expect(resolveScope(['INSIDE_SALES'])).toBe('own');
    expect(resolveScope(['CALL_CENTER'])).toBe('own');
  });

  it('takes the strongest scope across multiple roles', () => {
    expect(resolveScope(['SALES_AGENT', 'TEAM_LEADER'])).toBe('team');
    expect(resolveScope(['TEAM_LEADER', 'SALES_DIRECTOR'])).toBe('all');
  });

  it('wildcard permission always implies full visibility', () => {
    expect(resolveScope(['SALES_AGENT'], ['*'])).toBe('all');
  });

  it('defaults to "own" for unknown / empty roles (least privilege)', () => {
    expect(resolveScope([])).toBe('own');
    expect(resolveScope(['SOME_CUSTOM_ROLE'])).toBe('own');
  });
});
