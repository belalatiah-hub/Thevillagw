import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../decorators/current-user.decorator';
import { DataScope, resolveScope } from '../rbac/data-scope';

/**
 * Resolves a caller's data-visibility scope into concrete owner-id filters.
 * Used by leads, opportunities and reports so the same query returns
 * role-appropriate totals (own / team / all).
 */
@Injectable()
export class ScopeService {
  constructor(private readonly prisma: PrismaService) {}

  scopeOf(user: AuthUser): DataScope {
    return resolveScope(user.roleKeys ?? [], user.permissions ?? []);
  }

  /**
   * The set of owner ids the user may see, or `null` for unrestricted (all).
   * `team` resolves to the user plus every member of any team they lead or
   * belong to.
   */
  async visibleOwnerIds(user: AuthUser): Promise<string[] | null> {
    const scope = this.scopeOf(user);
    if (scope === 'all') return null;
    if (scope === 'own') return [user.id];

    const teams = await this.prisma.team.findMany({
      where: {
        companyId: user.companyId,
        OR: [{ leaderId: user.id }, { members: { some: { id: user.id } } }],
      },
      include: { members: { select: { id: true } } },
    });
    const ids = new Set<string>([user.id]);
    for (const team of teams) for (const m of team.members) ids.add(m.id);
    return [...ids];
  }

  /** A `where` fragment (AND-combined by the caller) restricting by owner. */
  async ownerWhere(user: AuthUser): Promise<Prisma.LeadWhereInput> {
    const ids = await this.visibleOwnerIds(user);
    return ids ? { ownerId: { in: ids } } : {};
  }
}
