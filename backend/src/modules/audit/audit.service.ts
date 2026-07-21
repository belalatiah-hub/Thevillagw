import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryAuditDto } from './dto/audit.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  private where(companyId: string, q: QueryAuditDto): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = { companyId };
    if (q.actorId) where.actorId = q.actorId;
    if (q.action) where.action = { contains: q.action, mode: 'insensitive' };
    if (q.entityType) where.entityType = q.entityType;
    if (q.entityId) where.entityId = q.entityId;
    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) where.createdAt.gte = new Date(q.from);
      if (q.to) where.createdAt.lte = new Date(q.to);
    }
    return where;
  }

  async list(companyId: string, q: QueryAuditDto) {
    const where = this.where(companyId, q);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: q.skip,
        take: q.limit,
        include: { actor: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return new PaginatedResult(data, total, q.page, q.limit);
  }

  /** Export the matching audit trail as CSV (capped for safety). */
  async exportCsv(companyId: string, q: QueryAuditDto): Promise<string> {
    const rows = await this.prisma.auditLog.findMany({
      where: this.where(companyId, q),
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: { actor: { select: { firstName: true, lastName: true, email: true } } },
    });
    const header = ['timestamp', 'actor', 'email', 'action', 'entityType', 'entityId', 'ip'];
    const esc = (v: unknown): string => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = rows.map((r) =>
      [
        r.createdAt.toISOString(),
        r.actor ? `${r.actor.firstName} ${r.actor.lastName}` : '',
        r.actor?.email ?? '',
        r.action,
        r.entityType ?? '',
        r.entityId ?? '',
        r.ip ?? '',
      ]
        .map(esc)
        .join(','),
    );
    return [header.join(','), ...lines].join('\n');
  }
}
