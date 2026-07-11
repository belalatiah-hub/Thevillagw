import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Commission,
  Contract,
  ContractStatus,
  InstallmentStatus,
  Reservation,
  ReservationStatus,
} from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCommissionDto,
  CreateContractDto,
  CreateReservationDto,
  QueryContractsDto,
  RecordPaymentDto,
} from './dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Reservations ───────────────────────────────────────────────────────

  /** Hold a unit for a customer. Marks the unit RESERVED atomically. */
  async createReservation(user: AuthUser, dto: CreateReservationDto): Promise<Reservation> {
    const unit = await this.prisma.unit.findFirst({
      where: { id: dto.unitId, companyId: user.companyId },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    if (unit.status !== 'AVAILABLE') {
      throw new BadRequestException(`Unit is ${unit.status}, cannot reserve`);
    }
    await this.assertCustomer(user, dto.customerId);

    return this.prisma.$transaction(async (tx) => {
      await tx.unit.update({ where: { id: dto.unitId }, data: { status: 'RESERVED' } });
      return tx.reservation.create({
        data: {
          companyId: user.companyId,
          unitId: dto.unitId,
          customerId: dto.customerId,
          opportunityId: dto.opportunityId,
          depositMinor: BigInt(dto.depositMinor),
          currency: dto.currency ?? unit.currency,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
          notes: dto.notes,
        },
      });
    });
  }

  // ── Contracts ──────────────────────────────────────────────────────────

  /**
   * Create a sales contract and generate its installment schedule. Marks the
   * unit SOLD and converts a linked reservation. The remaining balance
   * (total − down payment) is split evenly across `installmentCount` months.
   */
  async createContract(user: AuthUser, dto: CreateContractDto): Promise<Contract> {
    if (dto.downPaymentMinor > dto.totalPriceMinor) {
      throw new BadRequestException('Down payment cannot exceed the total price');
    }
    const unit = await this.prisma.unit.findFirst({
      where: { id: dto.unitId, companyId: user.companyId },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    if (unit.status === 'SOLD') throw new BadRequestException('Unit is already sold');
    await this.assertCustomer(user, dto.customerId);

    const reference = await this.nextReference(user.companyId);
    const balance = BigInt(dto.totalPriceMinor) - BigInt(dto.downPaymentMinor);
    const schedule = this.buildSchedule(
      balance,
      dto.installmentCount,
      dto.firstDueDate ? new Date(dto.firstDueDate) : new Date(),
    );

    return this.prisma.$transaction(async (tx) => {
      await tx.unit.update({ where: { id: dto.unitId }, data: { status: 'SOLD' } });
      if (dto.reservationId) {
        await tx.reservation.updateMany({
          where: { id: dto.reservationId, companyId: user.companyId },
          data: { status: ReservationStatus.CONVERTED },
        });
      }
      return tx.contract.create({
        data: {
          companyId: user.companyId,
          reference,
          unitId: dto.unitId,
          customerId: dto.customerId,
          opportunityId: dto.opportunityId,
          reservationId: dto.reservationId,
          status: ContractStatus.SIGNED,
          signedAt: new Date(),
          totalPriceMinor: BigInt(dto.totalPriceMinor),
          downPaymentMinor: BigInt(dto.downPaymentMinor),
          currency: dto.currency ?? unit.currency,
          installmentCount: dto.installmentCount,
          installments: { create: schedule },
        },
        include: { installments: { orderBy: { seq: 'asc' } } },
      });
    });
  }

  listContracts(user: AuthUser, query: QueryContractsDto): Promise<PaginatedResult<Contract>> {
    const where = { companyId: user.companyId };
    return this.prisma
      .$transaction([
        this.prisma.contract.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: query.skip,
          take: query.limit,
          include: {
            unit: { select: { code: true } },
            customer: { select: { firstName: true, lastName: true } },
          },
        }),
        this.prisma.contract.count({ where }),
      ])
      .then(([data, total]) => new PaginatedResult(data, total, query.page, query.limit));
  }

  async getContract(user: AuthUser, id: string): Promise<Contract> {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        installments: { orderBy: { seq: 'asc' } },
        payments: { orderBy: { receivedAt: 'desc' } },
        commissions: true,
        unit: { select: { code: true } },
        customer: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  // ── Payments ───────────────────────────────────────────────────────────

  /** Record a payment, optionally against a specific installment. */
  async recordPayment(user: AuthUser, contractId: string, dto: RecordPaymentDto) {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, companyId: user.companyId },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    const amount = BigInt(dto.amountMinor);

    return this.prisma.$transaction(async (tx) => {
      if (dto.installmentId) {
        const inst = await tx.installment.findFirst({
          where: { id: dto.installmentId, contractId },
        });
        if (!inst) throw new BadRequestException('Installment not found on this contract');
        const paid = inst.paidMinor + amount;
        await tx.installment.update({
          where: { id: inst.id },
          data: {
            paidMinor: paid,
            status: paid >= inst.amountMinor ? InstallmentStatus.PAID : inst.status,
          },
        });
      }
      const payment = await tx.payment.create({
        data: {
          companyId: user.companyId,
          contractId,
          installmentId: dto.installmentId,
          amountMinor: amount,
          currency: contract.currency,
          method: dto.method ?? 'BANK_TRANSFER',
          reference: dto.reference,
        },
      });

      // Mark the contract COMPLETED once everything owed is collected.
      const agg = await tx.payment.aggregate({
        where: { contractId },
        _sum: { amountMinor: true },
      });
      const collected = (agg._sum.amountMinor ?? 0n) + contract.downPaymentMinor;
      if (collected >= contract.totalPriceMinor) {
        await tx.contract.update({ where: { id: contractId }, data: { status: 'COMPLETED' } });
      }
      return payment;
    });
  }

  // ── Commission ─────────────────────────────────────────────────────────

  /** Book a commission for a team member as a percentage of the contract value. */
  async createCommission(
    user: AuthUser,
    contractId: string,
    dto: CreateCommissionDto,
  ): Promise<Commission> {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, companyId: user.companyId },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    const beneficiary = await this.prisma.user.findFirst({
      where: { id: dto.userId, companyId: user.companyId },
      select: { id: true },
    });
    if (!beneficiary) throw new BadRequestException('User must belong to your company');

    const amount = (contract.totalPriceMinor * BigInt(Math.round(dto.ratePct * 100))) / 10000n;
    return this.prisma.commission.create({
      data: {
        companyId: user.companyId,
        contractId,
        userId: dto.userId,
        ratePct: dto.ratePct,
        amountMinor: amount,
        currency: contract.currency,
      },
    });
  }

  // ── helpers ────────────────────────────────────────────────────────────

  private buildSchedule(balance: bigint, count: number, firstDue: Date) {
    if (count <= 0) return [];
    const base = balance / BigInt(count);
    const remainder = balance - base * BigInt(count); // put the rounding pennies on the last row
    const rows: { seq: number; dueDate: Date; amountMinor: bigint }[] = [];
    for (let i = 0; i < count; i++) {
      const due = new Date(firstDue);
      due.setMonth(due.getMonth() + i);
      rows.push({
        seq: i + 1,
        dueDate: due,
        amountMinor: i === count - 1 ? base + remainder : base,
      });
    }
    return rows;
  }

  private async nextReference(companyId: string): Promise<string> {
    const count = await this.prisma.contract.count({ where: { companyId } });
    const year = new Date().getFullYear();
    return `TVI-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async assertCustomer(user: AuthUser, customerId: string): Promise<void> {
    const c = await this.prisma.customer.findFirst({
      where: { id: customerId, companyId: user.companyId },
      select: { id: true },
    });
    if (!c) throw new BadRequestException('Customer must belong to your company');
  }
}
