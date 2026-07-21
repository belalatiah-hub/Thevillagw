import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../decorators/current-user.decorator';

const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
const VERB: Record<string, string> = {
  POST: 'create',
  PATCH: 'update',
  PUT: 'update',
  DELETE: 'delete',
};

/**
 * Platform-wide audit trail. Records every successful mutating request
 * (POST/PATCH/PUT/DELETE) as an AuditLog entry — actor, derived action,
 * affected entity, IP and user-agent — so every module is audited without each
 * one wiring its own logging. Fire-and-forget: a logging failure never affects
 * the response. Auth routes are skipped (AuthService logs those with richer
 * context); public/unauthenticated requests are skipped (no actor/tenant).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;
    const user = req.user as AuthUser | undefined;

    const shouldAudit =
      MUTATING.has(method) &&
      !!user?.companyId &&
      !String(req.route?.path ?? req.url).includes('/auth/');

    return next.handle().pipe(
      tap((body: unknown) => {
        if (!shouldAudit) return;
        const { resource, entityType } = this.describe(req);
        const action = `${resource}.${VERB[method] ?? method.toLowerCase()}`;
        const entityId = (req.params?.id as string) ?? this.idFromBody(body) ?? undefined;
        // Fire-and-forget — do not await, never throw into the response path.
        this.prisma.auditLog
          .create({
            data: {
              companyId: user!.companyId,
              actorId: user!.id,
              action,
              entityType,
              entityId,
              ip: this.ip(req),
              userAgent: req.headers?.['user-agent'],
              metadata: { method, path: req.route?.path ?? req.url },
            },
          })
          .catch(() => undefined);
      }),
    );
  }

  /** First meaningful path segment → resource/entity (strips the api prefix). */
  private describe(req: { route?: { path?: string }; url: string }): {
    resource: string;
    entityType: string;
  } {
    const path = req.route?.path ?? req.url;
    const seg = path
      .split('?')[0]
      .split('/')
      .filter((s: string) => s && s !== 'api' && !s.startsWith(':'));
    const resource = (seg[0] ?? 'unknown').replace(/s$/, ''); // leads -> lead
    return { resource, entityType: resource };
  }

  /** Pull the created entity's id from the handler's response body, if present. */
  private idFromBody(body: unknown): string | undefined {
    if (body && typeof body === 'object' && 'id' in body) {
      const id = (body as { id?: unknown }).id;
      return typeof id === 'string' ? id : undefined;
    }
    return undefined;
  }

  private ip(req: { ip?: string; headers?: Record<string, unknown> }): string | undefined {
    const fwd = req.headers?.['x-forwarded-for'];
    if (typeof fwd === 'string') return fwd.split(',')[0].trim();
    return req.ip;
  }
}
