import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { slugify } from '../../common/util/slug';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, QueryProjectsDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateProjectDto): Promise<Project> {
    await this.assertDeveloper(user, dto.developerId);
    return this.prisma.project.create({
      data: {
        companyId: user.companyId,
        developerId: dto.developerId,
        name: dto.name,
        slug: slugify(dto.name),
        area: dto.area,
        city: dto.city,
        status: dto.status,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        amenities: dto.amenities ?? [],
        coverUrl: dto.coverUrl,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
      },
    });
  }

  async findAll(user: AuthUser, query: QueryProjectsDto): Promise<PaginatedResult<Project>> {
    const where: Prisma.ProjectWhereInput = {
      companyId: user.companyId,
      developerId: query.developerId,
      status: query.status,
    };
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { area: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          developer: { select: { id: true, name: true } },
          _count: { select: { units: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);
    return new PaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(user: AuthUser, id: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        developer: { select: { id: true, name: true, logoUrl: true } },
        units: { orderBy: { priceMinor: 'asc' }, take: 100 },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(user: AuthUser, id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.ensureExists(user, id);
    if (dto.developerId) {
      await this.assertDeveloper(user, dto.developerId);
    }
    return this.prisma.project.update({
      where: { id },
      data: {
        developerId: dto.developerId,
        name: dto.name,
        slug: dto.name ? slugify(dto.name) : undefined,
        area: dto.area,
        city: dto.city,
        status: dto.status,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        amenities: dto.amenities,
        coverUrl: dto.coverUrl,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
      },
    });
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.ensureExists(user, id);
    await this.prisma.project.delete({ where: { id } });
  }

  private async assertDeveloper(user: AuthUser, developerId: string): Promise<void> {
    const dev = await this.prisma.developer.findFirst({
      where: { id: developerId, companyId: user.companyId },
      select: { id: true },
    });
    if (!dev) {
      throw new BadRequestException('developerId must reference a developer in your company');
    }
  }

  private async ensureExists(user: AuthUser, id: string): Promise<void> {
    const found = await this.prisma.project.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Project not found');
    }
  }
}
