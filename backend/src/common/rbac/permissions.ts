import { SystemRole } from '@prisma/client';

/**
 * The full permission catalogue. Permissions are plain "<resource>:<action>"
 * strings so they compose freely and new modules can add keys without a schema
 * change. Roles hold an array of these keys; a role that holds `*` is a
 * super-user. Every key here is assignable per-company, satisfying the
 * "every permission must be configurable from a visual dashboard" requirement.
 */
export const RESOURCES = [
  // Sales & inventory
  'lead',
  'customer',
  'developer',
  'project',
  'unit',
  'pipeline',
  'opportunity',
  'activity',
  // Finance
  'reservation',
  'contract',
  'payment',
  'commission',
  'finance',
  // Org / people
  'user',
  'role',
  'department',
  'position',
  'team',
  // Platform
  'report',
  'dashboard',
  'ai',
  'notification',
  'integration',
  'automation',
  'api',
  'audit',
  'company',
  'settings',
] as const;

export type Resource = (typeof RESOURCES)[number];

export const ACTIONS = [
  'read',
  'create',
  'update',
  'delete',
  'assign',
  'approve',
  'export',
  'import',
  'use',
] as const;
export type Action = (typeof ACTIONS)[number];

export const WILDCARD = '*';

/** Build a "resource:action" permission key. */
export const perm = (resource: Resource, action: Action): string => `${resource}:${action}`;

/**
 * Which actions are meaningful for each resource. Drives the visual permission
 * matrix (only sensible cells are shown) and validation. Anything not listed
 * here is simply never offered — no `dashboard:import`, etc.
 */
export const RESOURCE_ACTIONS: Record<Resource, Action[]> = {
  lead: ['read', 'create', 'update', 'delete', 'assign', 'export', 'import'],
  customer: ['read', 'create', 'update', 'delete', 'assign', 'export', 'import'],
  developer: ['read', 'create', 'update', 'delete', 'export', 'import'],
  project: ['read', 'create', 'update', 'delete', 'export', 'import'],
  unit: ['read', 'create', 'update', 'delete', 'export', 'import'],
  pipeline: ['read', 'create', 'update', 'delete'],
  opportunity: ['read', 'create', 'update', 'delete', 'assign', 'approve'],
  activity: ['read', 'create', 'update', 'delete'],
  reservation: ['read', 'create', 'update', 'delete', 'approve'],
  contract: ['read', 'create', 'update', 'delete', 'approve', 'export'],
  payment: ['read', 'create', 'update', 'delete', 'approve', 'export'],
  commission: ['read', 'create', 'update', 'delete', 'approve', 'export'],
  finance: ['read', 'approve', 'export'],
  user: ['read', 'create', 'update', 'delete'],
  role: ['read', 'create', 'update', 'delete'],
  department: ['read', 'create', 'update', 'delete'],
  position: ['read', 'create', 'update', 'delete'],
  team: ['read', 'create', 'update', 'delete'],
  report: ['read', 'export'],
  dashboard: ['read'],
  ai: ['read', 'use', 'update'],
  notification: ['read', 'create', 'update'],
  integration: ['read', 'create', 'update', 'delete'],
  automation: ['read', 'create', 'update', 'delete', 'approve'],
  api: ['read', 'create', 'delete'],
  audit: ['read', 'export'],
  company: ['read', 'update'],
  settings: ['read', 'update'],
};

/** Human-readable groupings for the visual dashboard. */
export const RESOURCE_GROUPS: { group: string; resources: Resource[] }[] = [
  {
    group: 'Sales & Inventory',
    resources: [
      'lead',
      'customer',
      'opportunity',
      'activity',
      'pipeline',
      'developer',
      'project',
      'unit',
    ],
  },
  { group: 'Finance', resources: ['reservation', 'contract', 'payment', 'commission', 'finance'] },
  { group: 'People & Org', resources: ['user', 'role', 'department', 'position', 'team'] },
  {
    group: 'Platform',
    resources: [
      'dashboard',
      'report',
      'ai',
      'notification',
      'automation',
      'integration',
      'api',
      'audit',
      'company',
      'settings',
    ],
  },
];

/** Every concrete, meaningful permission key in the system (validation & catalog). */
export const ALL_PERMISSIONS: string[] = RESOURCES.flatMap((r) =>
  RESOURCE_ACTIONS[r].map((a) => perm(r, a)),
);

// ── default-set builders ─────────────────────────────────────────────────────
const all = (r: Resource): string[] => RESOURCE_ACTIONS[r].map((a) => perm(r, a));
const crud = (r: Resource): string[] =>
  (['read', 'create', 'update', 'delete'] as Action[])
    .filter((a) => RESOURCE_ACTIONS[r].includes(a))
    .map((a) => perm(r, a));
const readOnly = (r: Resource): string[] => [perm(r, 'read')];
const pick = (r: Resource, ...actions: Action[]): string[] =>
  actions.filter((a) => RESOURCE_ACTIONS[r].includes(a)).map((a) => perm(r, a));

// Common bundles reused across roles.
const SALES_CORE = [
  ...crud('lead'),
  perm('lead', 'assign'),
  ...crud('customer'),
  ...crud('opportunity'),
  ...crud('activity'),
  ...readOnly('pipeline'),
  ...readOnly('project'),
  ...readOnly('unit'),
  ...readOnly('developer'),
  ...readOnly('dashboard'),
  ...pick('ai', 'read', 'use'),
  ...readOnly('notification'),
];
const SALES_LEADERSHIP = [
  ...SALES_CORE,
  perm('lead', 'export'),
  perm('lead', 'import'),
  ...crud('pipeline'),
  ...pick('opportunity', 'approve'),
  ...readOnly('user'),
  ...readOnly('team'),
  ...readOnly('report'),
  perm('report', 'export'),
  ...readOnly('commission'),
];

/**
 * Sensible default permission sets seeded for each system role. Companies edit
 * these freely afterwards from the visual dashboard — a starting point, not a
 * hard rule. Every SystemRole MUST have an entry (enforced by the type).
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, string[]> = {
  SUPER_ADMIN: [WILDCARD],
  CEO: [WILDCARD],
  GENERAL_MANAGER: [
    ...SALES_LEADERSHIP,
    ...all('finance'),
    ...readOnly('contract'),
    ...readOnly('payment'),
    perm('commission', 'approve'),
    ...crud('user'),
    ...crud('team'),
    ...crud('department'),
    ...crud('position'),
    ...readOnly('role'),
    ...all('report'),
    ...pick('ai', 'read', 'use', 'update'),
    ...readOnly('audit'),
    ...readOnly('integration'),
    ...readOnly('automation'),
    ...readOnly('settings'),
    ...readOnly('company'),
  ],
  SALES_DIRECTOR: [
    ...SALES_LEADERSHIP,
    perm('customer', 'export'),
    ...crud('team'),
    ...readOnly('department'),
    ...readOnly('contract'),
    ...all('report'),
    ...readOnly('automation'),
    perm('automation', 'update'),
  ],
  SALES_MANAGER: [
    ...SALES_CORE,
    perm('lead', 'export'),
    perm('lead', 'import'),
    ...pick('opportunity', 'approve'),
    ...readOnly('team'),
    ...readOnly('user'),
    ...readOnly('report'),
    perm('report', 'export'),
    ...readOnly('commission'),
  ],
  SUPERVISOR: [...SALES_CORE, perm('lead', 'export'), ...readOnly('team'), ...readOnly('report')],
  TEAM_LEADER: [...SALES_CORE, perm('lead', 'export'), ...readOnly('team'), ...readOnly('report')],
  SENIOR_SALES: [
    ...pick('lead', 'read', 'create', 'update', 'assign'),
    ...crud('customer'),
    ...pick('opportunity', 'read', 'create', 'update'),
    ...crud('activity'),
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('dashboard'),
    ...pick('ai', 'read', 'use'),
  ],
  SALES_AGENT: [
    ...pick('lead', 'read', 'create', 'update'),
    ...crud('customer'),
    ...pick('opportunity', 'read', 'create', 'update'),
    ...crud('activity'),
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('dashboard'),
    ...pick('ai', 'read', 'use'),
    ...readOnly('notification'),
  ],
  SALES_ADMIN: [
    ...pick('lead', 'read', 'create', 'update', 'assign', 'import', 'export'),
    ...crud('customer'),
    ...readOnly('opportunity'),
    ...crud('activity'),
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('report'),
    ...readOnly('user'),
    ...readOnly('dashboard'),
  ],
  MARKETING: [
    ...readOnly('lead'),
    perm('lead', 'export'),
    perm('lead', 'import'),
    ...readOnly('report'),
    perm('report', 'export'),
    ...readOnly('project'),
    ...readOnly('dashboard'),
    ...pick('ai', 'read', 'use'),
    ...readOnly('integration'),
  ],
  MARKETING_MANAGER: [
    ...readOnly('lead'),
    perm('lead', 'export'),
    perm('lead', 'import'),
    perm('lead', 'assign'),
    ...all('report'),
    ...readOnly('project'),
    ...readOnly('dashboard'),
    ...pick('ai', 'read', 'use', 'update'),
    ...crud('integration'),
    ...crud('automation'),
    ...readOnly('commission'),
  ],
  MEDIA_BUYER: [
    ...readOnly('lead'),
    perm('lead', 'export'),
    ...readOnly('report'),
    perm('report', 'export'),
    ...readOnly('dashboard'),
    ...pick('integration', 'read', 'update'),
    ...pick('ai', 'read', 'use'),
  ],
  GRAPHIC_DESIGNER: [
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('dashboard'),
    ...pick('ai', 'read', 'use'),
  ],
  CUSTOMER_SERVICE: [
    ...pick('lead', 'read', 'update'),
    ...readOnly('customer'),
    ...crud('activity'),
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('notification'),
    ...pick('ai', 'read', 'use'),
  ],
  CALL_CENTER: [
    ...pick('lead', 'read', 'create', 'update'),
    ...crud('activity'),
    ...readOnly('dashboard'),
    ...pick('ai', 'read', 'use'),
  ],
  INSIDE_SALES: [
    ...pick('lead', 'read', 'create', 'update'),
    ...crud('activity'),
    ...readOnly('customer'),
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('dashboard'),
    ...pick('ai', 'read', 'use'),
  ],
  PROPERTY_CONSULTANT: [
    ...pick('lead', 'read', 'create', 'update'),
    ...crud('customer'),
    ...pick('opportunity', 'read', 'create', 'update'),
    ...crud('activity'),
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('dashboard'),
    ...pick('ai', 'read', 'use'),
  ],
  FINANCE: [
    ...all('finance'),
    ...readOnly('reservation'),
    ...pick('contract', 'read', 'approve', 'export'),
    ...pick('payment', 'read', 'create', 'update', 'approve', 'export'),
    ...pick('commission', 'read', 'approve', 'export'),
    ...readOnly('opportunity'),
    ...readOnly('unit'),
    ...all('report'),
    ...readOnly('dashboard'),
    ...pick('ai', 'read', 'use'),
  ],
  HR: [
    ...crud('user'),
    ...crud('department'),
    ...crud('position'),
    ...crud('team'),
    ...readOnly('role'),
    ...readOnly('report'),
    ...readOnly('dashboard'),
    ...readOnly('audit'),
  ],
  OPERATIONS: [
    ...readOnly('lead'),
    ...readOnly('customer'),
    ...crud('project'),
    ...crud('unit'),
    ...crud('developer'),
    ...readOnly('reservation'),
    ...readOnly('contract'),
    ...all('report'),
    ...readOnly('dashboard'),
    ...crud('integration'),
    ...readOnly('automation'),
    ...readOnly('audit'),
  ],
  LEGAL: [
    ...readOnly('customer'),
    ...readOnly('opportunity'),
    ...pick('contract', 'read', 'approve', 'export'),
    ...readOnly('reservation'),
    ...readOnly('audit'),
    ...readOnly('dashboard'),
  ],
  DEVELOPER_REP: [
    ...readOnly('project'),
    ...readOnly('unit'),
    ...readOnly('developer'),
    ...readOnly('dashboard'),
  ],
  DEVELOPER_RELATIONS: [
    ...crud('developer'),
    ...crud('project'),
    ...crud('unit'),
    ...readOnly('report'),
    ...readOnly('dashboard'),
  ],
  CUSTOMER: [],
};
