import { SystemRole } from '@prisma/client';

/**
 * The full permission catalogue. Permissions are plain "<resource>:<action>"
 * strings so they compose freely and new modules can add keys without a schema
 * change. Roles hold an array of these keys; a role that holds `*` is a
 * super-user. Every key here is assignable per-company, satisfying the
 * "every permission must be configurable" requirement.
 */
export const RESOURCES = [
  'lead',
  'customer',
  'developer',
  'project',
  'unit',
  'pipeline',
  'opportunity',
  'activity',
  'user',
  'role',
  'report',
  'audit',
  'company',
  'settings',
  'integration',
] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = 'read' | 'create' | 'update' | 'delete' | 'assign' | 'export';

export const WILDCARD = '*';

/** Build a "resource:action" permission key. */
export const perm = (resource: Resource, action: Action): string => `${resource}:${action}`;

/** Every concrete permission key in the system (used for validation & seeding). */
export const ALL_PERMISSIONS: string[] = RESOURCES.flatMap((r) =>
  (['read', 'create', 'update', 'delete', 'assign', 'export'] as Action[]).map((a) => perm(r, a)),
);

const crud = (r: Resource): string[] => [
  perm(r, 'read'),
  perm(r, 'create'),
  perm(r, 'update'),
  perm(r, 'delete'),
];
const readOnly = (r: Resource): string[] => [perm(r, 'read')];

/**
 * Sensible default permission sets seeded for each system role. Companies can
 * edit these freely afterwards — they are a starting point, not a hard rule.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, string[]> = {
  SUPER_ADMIN: [WILDCARD],
  CEO: [WILDCARD],
  SALES_DIRECTOR: [
    ...crud('lead'),
    perm('lead', 'assign'),
    perm('lead', 'export'),
    ...crud('customer'),
    ...crud('opportunity'),
    ...crud('pipeline'),
    ...crud('activity'),
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('developer'),
    ...readOnly('user'),
    ...readOnly('report'),
    perm('report', 'export'),
  ],
  SALES_MANAGER: [
    ...crud('lead'),
    perm('lead', 'assign'),
    ...crud('customer'),
    ...crud('opportunity'),
    ...crud('activity'),
    ...readOnly('pipeline'),
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('report'),
  ],
  TEAM_LEADER: [
    ...crud('lead'),
    perm('lead', 'assign'),
    ...crud('customer'),
    ...crud('opportunity'),
    ...crud('activity'),
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('report'),
  ],
  PROPERTY_CONSULTANT: [
    perm('lead', 'read'),
    perm('lead', 'update'),
    perm('lead', 'create'),
    ...crud('customer'),
    perm('opportunity', 'read'),
    perm('opportunity', 'create'),
    perm('opportunity', 'update'),
    ...crud('activity'),
    ...readOnly('project'),
    ...readOnly('unit'),
  ],
  INSIDE_SALES: [
    perm('lead', 'read'),
    perm('lead', 'update'),
    perm('lead', 'create'),
    ...crud('activity'),
    ...readOnly('customer'),
    ...readOnly('project'),
    ...readOnly('unit'),
  ],
  CALL_CENTER: [
    perm('lead', 'read'),
    perm('lead', 'create'),
    perm('lead', 'update'),
    ...crud('activity'),
  ],
  MARKETING: [
    ...readOnly('lead'),
    perm('lead', 'export'),
    ...readOnly('report'),
    perm('report', 'export'),
    ...readOnly('project'),
  ],
  HR: [...readOnly('user'), ...readOnly('report')],
  FINANCE: [
    ...readOnly('opportunity'),
    ...readOnly('unit'),
    ...readOnly('report'),
    perm('report', 'export'),
  ],
  LEGAL: [...readOnly('customer'), ...readOnly('opportunity')],
  DEVELOPER_REP: [...readOnly('project'), ...readOnly('unit')],
  CUSTOMER: [],
};
