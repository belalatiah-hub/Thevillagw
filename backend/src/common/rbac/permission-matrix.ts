import { ALL_PERMISSIONS, WILDCARD } from './permissions';

/**
 * Expected-capability matrix — the source of truth for the automated Permission
 * Test Report (Phase 4). For each role we assert:
 *   • must    — capabilities the role NEEDS; missing ⇒ FAILED (broken workflow)
 *   • mustNot — privilege the role must NOT hold; present ⇒ FAILED (escalation)
 *   • should  — nice-to-have; missing ⇒ WARNING
 *
 * This is intentionally security-focused: it encodes separation-of-duties
 * (sales can't approve their own commission, marketing can't delete leads, HR
 * can't touch finance, etc.) rather than re-listing every default permission.
 */
export interface RoleExpectation {
  must?: string[];
  mustNot?: string[];
  should?: string[];
}

export const ROLE_EXPECTATIONS: Record<string, RoleExpectation> = {
  SUPER_ADMIN: { must: [WILDCARD] },
  CEO: { must: [WILDCARD] },
  GENERAL_MANAGER: {
    must: ['user:read', 'report:read', 'finance:read', 'commission:approve'],
    should: ['team:create', 'department:create'],
    mustNot: ['settings:update'],
  },
  SALES_DIRECTOR: {
    must: ['lead:read', 'lead:assign', 'lead:export', 'report:read', 'team:create'],
    mustNot: ['commission:approve', 'user:delete', 'settings:update'],
    should: ['opportunity:approve'],
  },
  SALES_MANAGER: {
    must: ['lead:read', 'lead:create', 'lead:assign', 'opportunity:approve', 'report:read'],
    mustNot: ['commission:approve', 'user:create', 'role:update', 'finance:approve'],
    should: ['lead:export'],
  },
  SUPERVISOR: {
    must: ['lead:read', 'lead:update', 'lead:assign', 'activity:create'],
    mustNot: ['commission:approve', 'user:create', 'role:update'],
  },
  TEAM_LEADER: {
    must: ['lead:read', 'lead:assign', 'activity:create'],
    mustNot: ['commission:approve', 'user:create', 'role:update', 'finance:approve'],
  },
  SENIOR_SALES: {
    must: ['lead:read', 'lead:create', 'lead:assign', 'customer:create', 'activity:create'],
    mustNot: ['lead:delete', 'user:create', 'role:read', 'commission:approve'],
  },
  SALES_AGENT: {
    must: ['lead:read', 'lead:create', 'lead:update', 'customer:read', 'activity:create', 'ai:use'],
    mustNot: [
      'lead:delete',
      'user:create',
      'role:read',
      'finance:approve',
      'commission:approve',
      'settings:update',
    ],
  },
  SALES_ADMIN: {
    must: ['lead:read', 'lead:import', 'lead:export', 'activity:create'],
    mustNot: ['commission:approve', 'role:update', 'settings:update'],
  },
  PROPERTY_CONSULTANT: {
    must: ['lead:read', 'lead:create', 'customer:create', 'activity:create'],
    mustNot: ['lead:delete', 'user:create', 'commission:approve'],
  },
  INSIDE_SALES: {
    must: ['lead:read', 'lead:create', 'activity:create'],
    mustNot: ['lead:delete', 'user:create', 'commission:approve', 'finance:approve'],
  },
  CALL_CENTER: {
    must: ['lead:read', 'lead:create', 'activity:create'],
    mustNot: ['lead:delete', 'lead:export', 'user:create', 'finance:approve'],
  },
  MARKETING: {
    must: ['lead:read', 'lead:export', 'report:read', 'project:read'],
    mustNot: ['lead:delete', 'user:create', 'finance:approve', 'commission:approve'],
    should: ['lead:import'],
  },
  MARKETING_MANAGER: {
    must: ['lead:read', 'lead:export', 'report:read', 'report:export', 'integration:read'],
    mustNot: ['lead:delete', 'user:create', 'finance:approve', 'commission:approve'],
    should: ['automation:create'],
  },
  MEDIA_BUYER: {
    must: ['lead:read', 'report:read', 'integration:read'],
    mustNot: ['lead:delete', 'user:create', 'finance:approve', 'commission:approve'],
  },
  GRAPHIC_DESIGNER: {
    must: ['project:read', 'ai:use'],
    mustNot: ['lead:read', 'user:create', 'finance:approve', 'commission:approve'],
  },
  CUSTOMER_SERVICE: {
    must: ['lead:read', 'customer:read', 'activity:create'],
    mustNot: ['lead:delete', 'lead:export', 'user:create', 'finance:approve'],
  },
  FINANCE: {
    must: ['finance:read', 'payment:read', 'commission:approve', 'report:read'],
    mustNot: ['lead:delete', 'role:update', 'user:create', 'settings:update'],
    should: ['contract:approve', 'payment:export'],
  },
  HR: {
    must: ['user:read', 'user:create', 'department:read', 'team:create'],
    mustNot: ['lead:read', 'finance:approve', 'commission:approve', 'settings:update'],
    should: ['audit:read'],
  },
  OPERATIONS: {
    must: ['project:create', 'unit:create', 'report:read'],
    mustNot: ['user:create', 'role:update', 'commission:approve', 'settings:update'],
    should: ['integration:read'],
  },
  LEGAL: {
    must: ['contract:read', 'contract:approve', 'customer:read'],
    mustNot: ['lead:create', 'user:create', 'commission:approve', 'settings:update'],
    should: ['audit:read'],
  },
  DEVELOPER_REP: {
    must: ['project:read', 'unit:read'],
    mustNot: ['lead:read', 'user:create', 'finance:approve'],
  },
  DEVELOPER_RELATIONS: {
    must: ['developer:create', 'project:create', 'unit:create'],
    mustNot: ['lead:delete', 'user:create', 'finance:approve', 'commission:approve'],
  },
  CUSTOMER: {
    mustNot: ['lead:read', 'user:read', 'finance:read', 'report:read', 'settings:update'],
  },
};

export type CheckStatus = 'PASS' | 'WARNING' | 'FAILED';

export interface PermissionCheck {
  kind: 'must' | 'mustNot' | 'should';
  permission: string;
  status: CheckStatus;
  message: string;
}

export interface RoleTestResult {
  role: string;
  status: CheckStatus;
  passed: number;
  warnings: number;
  failed: number;
  checks: PermissionCheck[];
}

/** True if the granted set satisfies a required permission (wildcard = all). */
function holds(granted: Set<string>, permission: string): boolean {
  if (granted.has(WILDCARD)) return permission !== WILDCARD ? true : true;
  return granted.has(permission);
}

/**
 * Evaluate one role's granted permission set against its expectation. Pure and
 * deterministic — the same inputs always yield the same report.
 */
export function evaluateRole(roleKey: string, grantedList: string[]): RoleTestResult {
  const granted = new Set(grantedList);
  const expectation = ROLE_EXPECTATIONS[roleKey] ?? {};
  const checks: PermissionCheck[] = [];

  for (const p of expectation.must ?? []) {
    const ok = p === WILDCARD ? granted.has(WILDCARD) : holds(granted, p);
    checks.push({
      kind: 'must',
      permission: p,
      status: ok ? 'PASS' : 'FAILED',
      message: ok ? `has required "${p}"` : `MISSING required "${p}" — workflow broken`,
    });
  }
  for (const p of expectation.mustNot ?? []) {
    const has = holds(granted, p);
    checks.push({
      kind: 'mustNot',
      permission: p,
      status: has ? 'FAILED' : 'PASS',
      message: has
        ? `PRIVILEGE ESCALATION: holds "${p}" it should never have`
        : `correctly denied "${p}"`,
    });
  }
  for (const p of expectation.should ?? []) {
    const ok = holds(granted, p);
    checks.push({
      kind: 'should',
      permission: p,
      status: ok ? 'PASS' : 'WARNING',
      message: ok ? `has recommended "${p}"` : `missing recommended "${p}"`,
    });
  }

  const failed = checks.filter((c) => c.status === 'FAILED').length;
  const warnings = checks.filter((c) => c.status === 'WARNING').length;
  const passed = checks.filter((c) => c.status === 'PASS').length;
  const status: CheckStatus = failed > 0 ? 'FAILED' : warnings > 0 ? 'WARNING' : 'PASS';
  return { role: roleKey, status, passed, warnings, failed, checks };
}

/** Sanity guard used by tests: every referenced permission key must be real. */
export function unknownExpectationKeys(): string[] {
  const valid = new Set([...ALL_PERMISSIONS, WILDCARD]);
  const bad = new Set<string>();
  for (const exp of Object.values(ROLE_EXPECTATIONS)) {
    for (const p of [...(exp.must ?? []), ...(exp.mustNot ?? []), ...(exp.should ?? [])]) {
      if (!valid.has(p)) bad.add(p);
    }
  }
  return [...bad];
}
