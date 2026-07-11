import { Injectable, NotFoundException } from '@nestjs/common';
import { Developer, Prisma } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { slugify } from '../../common/util/slug';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeveloperDto, QueryDevelopersDto, UpdateDeveloperDto } from './dto/developer.dto';

@Injectable()
export class DevelopersService {
  constructor(private readonly prisma: PrismaService) {}

  create(user: AuthUser, dto: CreateDeveloperDto): Promise<Developer> {
    return this.prisma.developer.create({
      data: {
        companyId: user.companyId,
        name: dto.name,
        slug: slugify(dto.name),
        about: dto.about,
        website: dto.website,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async findAll(user: AuthUser, query: QueryDevelopersDto): Promise<PaginatedResult<Developer>> {
    const where: Prisma.DeveloperWhereInput = { companyId: user.companyId };
    if (query.search) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.developer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
        include: { _count: { select: { projects: true } } },
      }),
      this.prisma.developer.count({ where }),
    ]);
    return new PaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(user: AuthUser, id: string): Promise<Developer> {
    const developer = await this.prisma.developer.findFirst({
      where: { id, companyId: user.companyId },
      include: { projects: { select: { id: true, name: true, status: true } } },
    });
    if (!developer) {
      throw new NotFoundException('Developer not found');
    }
    return developer;
  }

  async update(user: AuthUser, id: string, dto: UpdateDeveloperDto): Promise<Developer> {
    await this.ensureExists(user, id);
    return this.prisma.developer.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.name ? slugify(dto.name) : undefined,
        about: dto.about,
        website: dto.website,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.ensureExists(user, id);
    await this.prisma.developer.delete({ where: { id } });
  }

  private async ensureExists(user: AuthUser, id: string): Promise<void> {
    const found = await this.prisma.developer.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Developer not found');
    }
  }
}
