import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * The authenticated principal attached to the request by JwtStrategy.
 * Carries the tenant (companyId) and the flattened permission set so guards and
 * services never re-query on the hot path.
 */
export interface AuthUser {
  id: string;
  companyId: string;
  email: string;
  roles: string[];
  /** System-role keys (e.g. SALES_AGENT) — used for data-visibility scoping. */
  roleKeys: string[];
  permissions: string[];
}

/** Injects the current AuthUser (or a single property of it) into a handler. */
export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;
    return data ? user?.[data] : user;
  },
);
