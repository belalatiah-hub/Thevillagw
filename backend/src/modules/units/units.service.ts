import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Unit } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnitDto, QueryUnitsDto, UpdateUnitDto } from './dto/unit.dto';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateUnitDto): Promise<Unit> {
    await this.assertProject(user, dto.projectId);
    return this.prisma.unit.create({
      data: {
        companyId: user.companyId,
        projectId: dto.projectId,
        code: dto.code,
        type: dto.type,
        status: dto.status,
        priceMinor: BigInt(dto.priceMinor),
        currency: dto.currency,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        builtUpArea: dto.builtUpArea,
        landArea: dto.landArea,
        floor: dto.floor,
        building: dto.building,
        phase: dto.phase,
        downPaymentPct: dto.downPaymentPct,
        installmentYears: dto.installmentYears,
        images: dto.images ?? [],
      },
    });
  }

  async findAll(user: AuthUser, query: QueryUnitsDto): Promise<PaginatedResult<Unit>> {
    const where: Prisma.UnitWhereInput = {
      companyId: user.companyId,
      projectId: query.projectId,
      status: query.status,
      type: query.type,
      bedrooms: query.minBedrooms != null ? { gte: query.minBedrooms } : undefined,
      priceMinor: query.maxPriceMinor != null ? { lte: BigInt(query.maxPriceMinor) } : undefined,
    };
    if (query.search) {
      where.OR = [
        { code: { contains: query.search.trim(), mode: 'insensitive' } },
        { building: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.unit.findMany({
        where,
        orderBy: { priceMinor: 'asc' },
        skip: query.skip,
        take: query.limit,
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.unit.count({ where }),
    ]);
    return new PaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(user: AuthUser, id: string): Promise<Unit> {
    const unit = await this.prisma.unit.findFirst({
      where: { id, companyId: user.companyId },
      include: { project: { include: { developer: { select: { id: true, name: true } } } } },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit;
  }

  async update(user: AuthUser, id: string, dto: UpdateUnitDto): Promise<Unit> {
    await this.ensureExists(user, id);
    if (dto.projectId) {
      await this.assertProject(user, dto.projectId);
    }
    return this.prisma.unit.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        code: dto.code,
        type: dto.type,
        status: dto.status,
        priceMinor: dto.priceMinor != null ? BigInt(dto.priceMinor) : undefined,
        currency: dto.currency,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        builtUpArea: dto.builtUpArea,
        landArea: dto.landArea,
        floor: dto.floor,
        building: dto.building,
        phase: dto.phase,
        downPaymentPct: dto.downPaymentPct,
        installmentYears: dto.installmentYears,
        images: dto.images,
      },
    });
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.ensureExists(user, id);
    await this.prisma.unit.delete({ where: { id } });
  }

  private async assertProject(user: AuthUser, projectId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId: user.companyId },
      select: { id: true },
    });
    if (!project) {
      throw new BadRequestException('projectId must reference a project in your company');
    }
  }

  private async ensureExists(user: AuthUser, id: string): Promise<void> {
    const found = await this.prisma.unit.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Unit not found');
    }
  }
}
