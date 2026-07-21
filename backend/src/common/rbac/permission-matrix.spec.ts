import { SystemRole } from '@prisma/client';
import { DEFAULT_ROLE_PERMISSIONS } from './permissions';
import { evaluateRole, ROLE_EXPECTATIONS, unknownExpectationKeys } from './permission-matrix';

describe('RBAC permission matrix', () => {
  it('references only real permission keys', () => {
    expect(unknownExpectationKeys()).toEqual([]);
  });

  it('has an expectation for every system role', () => {
    for (const role of Object.keys(DEFAULT_ROLE_PERMISSIONS) as SystemRole[]) {
      expect(ROLE_EXPECTATIONS[role]).toBeDefined();
    }
  });

  it('every default role set PASSES its own security expectations (no FAILED)', () => {
    const failures: string[] = [];
    for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      const result = evaluateRole(role, perms);
      if (result.status === 'FAILED') {
        const bad = result.checks.filter((c) => c.status === 'FAILED').map((c) => c.message);
        failures.push(`${role}: ${bad.join('; ')}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('detects privilege escalation (mustNot held)', () => {
    // A sales agent that somehow gained commission:approve must FAIL.
    const rogue = [...DEFAULT_ROLE_PERMISSIONS.SALES_AGENT, 'commission:approve'];
    const result = evaluateRole('SALES_AGENT', rogue);
    expect(result.status).toBe('FAILED');
    expect(result.checks.some((c) => c.kind === 'mustNot' && c.status === 'FAILED')).toBe(true);
  });

  it('detects a broken workflow (must missing)', () => {
    const crippled = DEFAULT_ROLE_PERMISSIONS.FINANCE.filter((p) => p !== 'commission:approve');
    const result = evaluateRole('FINANCE', crippled);
    expect(result.status).toBe('FAILED');
    expect(result.checks.some((c) => c.kind === 'must' && c.status === 'FAILED')).toBe(true);
  });

  it('wildcard roles satisfy every requirement', () => {
    expect(evaluateRole('CEO', ['*']).status).toBe('PASS');
    expect(evaluateRole('SUPER_ADMIN', ['*']).status).toBe('PASS');
  });
});
