import { SystemRole } from '@prisma/client';
import { WILDCARD } from './permissions';

/**
 * Row-level visibility scope — "who can see whose numbers".
 *   • all  — the whole company (leadership, finance, marketing, ops, admins)
 *   • team — the user's own records + records owned by their team members
 *   • own  — only records the user personally owns (front-line agents)
 *
 * This implements the "رؤية الأرقام حسب الصلاحيات" requirement: the SAME
 * endpoint returns different totals depending on the caller's role, so a sales
 * agent sees only their pipeline while a manager sees the team's and a director
 * sees everything.
 */
export type DataScope = 'all' | 'team' | 'own';

/** Roles that may see every record in the company. */
const ALL_SCOPE: ReadonlySet<string> = new Set<SystemRole>([
  SystemRole.SUPER_ADMIN,
  SystemRole.CEO,
  SystemRole.GENERAL_MANAGER,
  SystemRole.SALES_DIRECTOR,
  SystemRole.SALES_MANAGER,
  SystemRole.SALES_ADMIN,
  SystemRole.MARKETING,
  SystemRole.MARKETING_MANAGER,
  SystemRole.MEDIA_BUYER,
  SystemRole.OPERATIONS,
  SystemRole.FINANCE,
  SystemRole.LEGAL,
  SystemRole.HR,
  SystemRole.DEVELOPER_REP,
  SystemRole.DEVELOPER_RELATIONS,
  SystemRole.GRAPHIC_DESIGNER,
]);

/** Roles that see their team's records (plus their own). */
const TEAM_SCOPE: ReadonlySet<string> = new Set<SystemRole>([
  SystemRole.SUPERVISOR,
  SystemRole.TEAM_LEADER,
]);

/**
 * Resolve the strongest scope granted by any of the user's roles.
 * Wildcard permission always implies full visibility. A user with no scoped
 * role defaults to `own` — the safe, least-privileged choice.
 */
export function resolveScope(roleKeys: string[], permissions: string[] = []): DataScope {
  if (permissions.includes(WILDCARD)) return 'all';
  if (roleKeys.some((k) => ALL_SCOPE.has(k))) return 'all';
  if (roleKeys.some((k) => TEAM_SCOPE.has(k))) return 'team';
  return 'own';
}
