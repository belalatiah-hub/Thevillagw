import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, QueryUsersDto, UpdateUserDto } from './dto/user.dto';

// Never return password/token hashes to clients.
const SAFE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  branchId: true,
  departmentId: true,
  positionId: true,
  teamId: true,
  managerId: true,
  lastLoginAt: true,
  createdAt: true,
  twoFactorEnabled: true,
  roles: { include: { role: { select: { id: true, name: true, key: true } } } },
  department: { select: { id: true, name: true } },
  position: { select: { id: true, title: true } },
  team: { select: { id: true, name: true } },
  manager: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  me(user: AuthUser) {
    return this.prisma.user.findUnique({ where: { id: user.id }, select: SAFE_SELECT });
  }

  async create(user: AuthUser, dto: CreateUserDto) {
    await this.assertRoles(user, dto.roleIds);
    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.user.create({
      data: {
        companyId: user.companyId,
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        branchId: dto.branchId,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        teamId: dto.teamId,
        managerId: dto.managerId,
        roles: dto.roleIds?.length
          ? { create: dto.roleIds.map((roleId) => ({ roleId })) }
          : undefined,
      },
      select: SAFE_SELECT,
    });
  }

  async findAll(user: AuthUser, query: QueryUsersDto) {
    const where: Prisma.UserWhereInput = { companyId: user.companyId };
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: SAFE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return new PaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(user: AuthUser, id: string) {
    const found = await this.prisma.user.findFirst({
      where: { id, companyId: user.companyId },
      select: SAFE_SELECT,
    });
    if (!found) {
      throw new NotFoundException('User not found');
    }
    return found;
  }

  async update(user: AuthUser, id: string, dto: UpdateUserDto) {
    await this.ensureExists(user, id);
    await this.assertRoles(user, dto.roleIds);

    return this.prisma.$transaction(async (tx) => {
      if (dto.roleIds) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
        });
      }
      return tx.user.update({
        where: { id },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          isActive: dto.isActive,
          branchId: dto.branchId,
          departmentId: dto.departmentId,
          positionId: dto.positionId,
          teamId: dto.teamId,
          managerId: dto.managerId,
        },
        select: SAFE_SELECT,
      });
    });
  }

  /** Active + historical device sessions for a user (from refresh tokens). */
  async sessions(user: AuthUser, id: string) {
    await this.ensureExists(user, id);
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        expiresAt: true,
        revokedAt: true,
      },
    });
    const now = Date.now();
    return tokens.map((t) => ({
      id: t.id,
      userAgent: t.userAgent,
      ip: t.ip,
      createdAt: t.createdAt,
      expiresAt: t.expiresAt,
      active: !t.revokedAt && t.expiresAt.getTime() > now,
      revokedAt: t.revokedAt,
    }));
  }

  /** Revoke a single device session. */
  async revokeSession(user: AuthUser, id: string, sessionId: string) {
    await this.ensureExists(user, id);
    const result = await this.prisma.refreshToken.updateMany({
      where: { id: sessionId, userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) throw new NotFoundException('Active session not found');
    return { revoked: result.count };
  }

  /** Login history — successful and failed auth events from the audit trail. */
  async loginHistory(user: AuthUser, id: string) {
    await this.ensureExists(user, id);
    return this.prisma.auditLog.findMany({
      where: {
        companyId: user.companyId,
        actorId: id,
        action: { in: ['auth.login', 'auth.login.failed', 'auth.logout'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, action: true, ip: true, userAgent: true, createdAt: true },
    });
  }

  /** Full activity timeline for a user (every audited action they performed). */
  async activity(user: AuthUser, id: string) {
    await this.ensureExists(user, id);
    return this.prisma.auditLog.findMany({
      where: { companyId: user.companyId, actorId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        metadata: true,
      },
    });
  }

  async deactivate(user: AuthUser, id: string): Promise<void> {
    await this.ensureExists(user, id);
    if (id === user.id) {
      throw new BadRequestException('You cannot deactivate your own account');
    }
    // Soft-disable + revoke sessions rather than hard-delete, to preserve history.
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id }, data: { isActive: false } }),
      this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private async assertRoles(user: AuthUser, roleIds?: string[]): Promise<void> {
    if (!roleIds?.length) {
      return;
    }
    const count = await this.prisma.role.count({
      where: { id: { in: roleIds }, companyId: user.companyId },
    });
    if (count !== new Set(roleIds).size) {
      throw new BadRequestException('One or more roles do not belong to your company');
    }
  }

  private async ensureExists(user: AuthUser, id: string): Promise<void> {
    const found = await this.prisma.user.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('User not found');
    }
  }
}
