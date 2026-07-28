import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SystemRole } from '@prisma/client';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ACTIONS,
  ALL_PERMISSIONS,
  RESOURCE_ACTIONS,
  RESOURCE_GROUPS,
  WILDCARD,
} from '../../common/rbac/permissions';
import { evaluateRole } from '../../common/rbac/permission-matrix';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

const VALID = new Set([...ALL_PERMISSIONS, WILDCARD]);

/** Humanize an enum/word: PROPERTY_CONSULTANT -> "Property Consultant". */
const humanize = (s: string): string =>
  s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /** The full permission catalogue for the visual dashboard — grouped, labelled. */
  catalog() {
    return {
      actions: ACTIONS.map((a) => ({ key: a, label: humanize(a) })),
      groups: RESOURCE_GROUPS.map((g) => ({
        group: g.group,
        resources: g.resources.map((r) => ({
          key: r,
          label: humanize(r),
          actions: RESOURCE_ACTIONS[r],
          permissions: RESOURCE_ACTIONS[r].map((a) => `${r}:${a}`),
        })),
      })),
      total: ALL_PERMISSIONS.length,
    };
  }

  /** All roles for the tenant with live member counts. */
  async list(companyId: string) {
    const roles = await this.prisma.role.findMany({
      where: { companyId },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { users: true } } },
    });
    return roles.map((r) => ({
      id: r.id,
      key: r.key,
      name: r.name,
      isSystem: r.isSystem,
      permissions: r.permissions,
      permissionCount: r.permissions.includes(WILDCARD)
        ? ALL_PERMISSIONS.length
        : r.permissions.length,
      memberCount: r._count.users,
    }));
  }

  /**
   * Automated Permission Test Report (Phase 4): evaluate every role's live
   * permission set against the security expectation matrix. Returns per-role
   * PASS / WARNING / FAILED plus a summary — the CRM never assumes permissions
   * work, it tests them.
   */
  async testReport(companyId: string) {
    const roles = await this.prisma.role.findMany({
      where: { companyId },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { users: true } } },
    });
    const results = roles.map((r) => {
      const evalRes = evaluateRole(
        r.key ?? r.name.toUpperCase().replace(/\s+/g, '_'),
        r.permissions,
      );
      return {
        ...evalRes,
        roleId: r.id,
        name: r.name,
        isSystem: r.isSystem,
        memberCount: r._count.users,
      };
    });
    const summary = {
      total: results.length,
      passed: results.filter((r) => r.status === 'PASS').length,
      warnings: results.filter((r) => r.status === 'WARNING').length,
      failed: results.filter((r) => r.status === 'FAILED').length,
    };
    return { summary, results };
  }

  async getOne(companyId: string, id: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    return { ...role, memberCount: role._count.users };
  }

  async create(companyId: string, dto: CreateRoleDto, actor?: AuthUser) {
    this.assertValidPermissions(dto.permissions);
    const exists = await this.prisma.role.findFirst({
      where: { companyId, name: dto.name },
      select: { id: true },
    });
    if (exists) throw new BadRequestException('A role with this name already exists');
    if (actor) this.assertMayGrant(actor, dto.permissions ?? []);
    return this.prisma.role.create({
      data: {
        companyId,
        name: dto.name,
        isSystem: false, // custom roles never carry a SystemRole key
        permissions: this.dedupe(dto.permissions ?? []),
      },
    });
  }


  /**
   * Privilege-escalation guard. A caller holding `role:update` could otherwise
   * mint a role carrying `*` (or any permission they lack) and assign it to
   * themselves, turning a mid-level permission into full tenant takeover.
   * Rule: you may only grant permissions you already hold.
   */
  private assertMayGrant(actor: AuthUser, permissions: string[]) {
    const held = actor?.permissions ?? [];
    if (held.includes(WILDCARD)) return; // super-admin may grant anything
    if (permissions.includes(WILDCARD)) {
      throw new ForbiddenException('You cannot grant the "*" (full access) permission');
    }
    const escalated = permissions.filter((p) => !held.includes(p));
    if (escalated.length) {
      throw new ForbiddenException(
        `You cannot grant permissions you do not hold: ${escalated.slice(0, 5).join(', ')}` +
          (escalated.length > 5 ? ` (+${escalated.length - 5} more)` : ''),
      );
    }
  }

  async update(companyId: string, id: string, dto: UpdateRoleDto, actor?: AuthUser) {
    const role = await this.prisma.role.findFirst({ where: { id, companyId } });
    if (!role) throw new NotFoundException('Role not found');

    if (dto.permissions) {
      this.assertValidPermissions(dto.permissions);
      if (actor) this.assertMayGrant(actor, dto.permissions);
      // Guardrail: never let the built-in super-admin lose the wildcard (lockout).
      if (role.key === SystemRole.SUPER_ADMIN && !dto.permissions.includes(WILDCARD)) {
        throw new ForbiddenException('SUPER_ADMIN must retain the "*" permission');
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: role.isSystem ? undefined : dto.name, // system role names are fixed; permissions still editable
        permissions: dto.permissions ? this.dedupe(dto.permissions) : undefined,
      },
    });
  }

  async remove(companyId: string, id: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new ForbiddenException('System roles cannot be deleted');
    if (role._count.users > 0)
      throw new BadRequestException('Reassign this role’s members before deleting it');
    await this.prisma.role.delete({ where: { id } });
  }

  private assertValidPermissions(permissions?: string[]): void {
    if (!permissions) return;
    const bad = permissions.filter((p) => !VALID.has(p));
    if (bad.length) throw new BadRequestException(`Unknown permission(s): ${bad.join(', ')}`);
  }

  private dedupe(permissions: string[]): string[] {
    return Array.from(new Set(permissions));
  }
}
