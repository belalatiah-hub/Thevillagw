import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { normalizePhone } from '../../common/util/phone';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, QueryCustomersDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private toData(dto: CreateCustomerDto | UpdateCustomerDto) {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      email: dto.email?.toLowerCase(),
      altPhone: dto.altPhone,
      nationality: dto.nationality,
      nationalId: dto.nationalId,
      passportNo: dto.passportNo,
      preferredArea: dto.preferredArea,
      budgetMinMinor: dto.budgetMinMinor != null ? BigInt(dto.budgetMinMinor) : undefined,
      budgetMaxMinor: dto.budgetMaxMinor != null ? BigInt(dto.budgetMaxMinor) : undefined,
      currency: dto.currency,
      bedroomsWanted: dto.bedroomsWanted,
      investmentGoal: dto.investmentGoal,
      timeline: dto.timeline,
      paymentMethod: dto.paymentMethod,
      ownerId: dto.ownerId,
      tags: dto.tags,
    };
  }

  create(user: AuthUser, dto: CreateCustomerDto): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        companyId: user.companyId,
        ...this.toData(dto),
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });
  }

  async findAll(user: AuthUser, query: QueryCustomersDto): Promise<PaginatedResult<Customer>> {
    const where: Prisma.CustomerWhereInput = {
      companyId: user.companyId,
      ownerId: query.ownerId,
    };
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: normalizePhone(term) ?? term } },
      ];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.customer.count({ where }),
    ]);
    return new PaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(user: AuthUser, id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        activities: { orderBy: { createdAt: 'desc' }, take: 50 },
        opportunities: true,
      },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(user: AuthUser, id: string, dto: UpdateCustomerDto): Promise<Customer> {
    await this.ensureExists(user, id);
    return this.prisma.customer.update({ where: { id }, data: this.toData(dto) });
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.ensureExists(user, id);
    await this.prisma.customer.delete({ where: { id } });
  }

  private async ensureExists(user: AuthUser, id: string): Promise<void> {
    const found = await this.prisma.customer.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Customer not found');
    }
  }
}
