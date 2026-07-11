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
  lastLoginAt: true,
  createdAt: true,
  roles: { include: { role: { select: { id: true, name: true, key: true } } } },
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
        },
        select: SAFE_SELECT,
      });
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
