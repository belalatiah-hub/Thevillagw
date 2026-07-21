import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDepartmentDto,
  CreatePositionDto,
  CreateTeamDto,
  UpdateDepartmentDto,
  UpdatePositionDto,
  UpdateTeamDto,
} from './dto/org.dto';

/**
 * Organizational structure: departments → positions & teams → people. Kept
 * deliberately light (SetNull on delete) so removing a department never orphans
 * a user — they simply lose that attribute.
 */
@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Departments ────────────────────────────────────────────────────────────
  listDepartments(companyId: string) {
    return this.prisma.department.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { users: true, positions: true, teams: true } } },
    });
  }

  async createDepartment(companyId: string, dto: CreateDepartmentDto) {
    await this.assertUniqueName('department', companyId, dto.name);
    return this.prisma.department.create({
      data: { companyId, name: dto.name, description: dto.description },
    });
  }

  async updateDepartment(companyId: string, id: string, dto: UpdateDepartmentDto) {
    await this.ensure('department', companyId, id);
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async removeDepartment(companyId: string, id: string) {
    await this.ensure('department', companyId, id);
    await this.prisma.department.delete({ where: { id } });
  }

  // ── Positions ──────────────────────────────────────────────────────────────
  listPositions(companyId: string) {
    return this.prisma.position.findMany({
      where: { companyId },
      orderBy: [{ level: 'desc' }, { title: 'asc' }],
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { users: true } },
      },
    });
  }

  async createPosition(companyId: string, dto: CreatePositionDto) {
    await this.assertUniqueName('position', companyId, dto.title, 'title');
    if (dto.departmentId) await this.ensure('department', companyId, dto.departmentId);
    return this.prisma.position.create({
      data: { companyId, title: dto.title, level: dto.level ?? 0, departmentId: dto.departmentId },
    });
  }

  async updatePosition(companyId: string, id: string, dto: UpdatePositionDto) {
    await this.ensure('position', companyId, id);
    if (dto.departmentId) await this.ensure('department', companyId, dto.departmentId);
    return this.prisma.position.update({ where: { id }, data: dto });
  }

  async removePosition(companyId: string, id: string) {
    await this.ensure('position', companyId, id);
    await this.prisma.position.delete({ where: { id } });
  }

  // ── Teams ──────────────────────────────────────────────────────────────────
  listTeams(companyId: string) {
    return this.prisma.team.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      include: {
        department: { select: { id: true, name: true } },
        leader: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { members: true } },
      },
    });
  }

  async createTeam(companyId: string, dto: CreateTeamDto) {
    await this.assertUniqueName('team', companyId, dto.name);
    if (dto.departmentId) await this.ensure('department', companyId, dto.departmentId);
    if (dto.leaderId) await this.ensureUser(companyId, dto.leaderId);
    return this.prisma.team.create({
      data: { companyId, name: dto.name, departmentId: dto.departmentId, leaderId: dto.leaderId },
    });
  }

  async updateTeam(companyId: string, id: string, dto: UpdateTeamDto) {
    await this.ensure('team', companyId, id);
    if (dto.departmentId) await this.ensure('department', companyId, dto.departmentId);
    if (dto.leaderId) await this.ensureUser(companyId, dto.leaderId);
    return this.prisma.team.update({ where: { id }, data: dto });
  }

  async removeTeam(companyId: string, id: string) {
    await this.ensure('team', companyId, id);
    await this.prisma.team.delete({ where: { id } });
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  private async assertUniqueName(
    model: 'department' | 'position' | 'team',
    companyId: string,
    value: string,
    field: 'name' | 'title' = 'name',
  ): Promise<void> {
    const exists = await this.finder(model).findFirst({
      where: { companyId, [field]: value },
      select: { id: true },
    });
    if (exists) throw new BadRequestException(`A ${model} named "${value}" already exists`);
  }

  private async ensure(
    model: 'department' | 'position' | 'team',
    companyId: string,
    id: string,
  ): Promise<void> {
    const found = await this.finder(model).findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException(`${model} not found`);
  }

  /** Narrowly-typed delegate accessor shared by the guard helpers. */
  private finder(model: 'department' | 'position' | 'team'): {
    findFirst(args: {
      where: Record<string, unknown>;
      select: { id: true };
    }): Promise<{ id: string } | null>;
  } {
    return this.prisma[model];
  }

  private async ensureUser(companyId: string, id: string): Promise<void> {
    const found = await this.prisma.user.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!found) throw new BadRequestException('Leader is not a member of your company');
  }
}
