import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Guards a route behind one or more permission keys (see rbac/permissions.ts).
 * The PermissionsGuard grants access if the user holds ALL listed keys (or the
 * `*` wildcard). Example: `@RequirePermissions('lead:create')`.
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
