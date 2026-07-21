import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LookupType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLookupDto, UpdateLookupDto } from './dto/lookup.dto';

/** Default seed values per lookup type (mirrors the settings a tenant expects). */
export const DEFAULT_LOOKUPS: Record<
  LookupType,
  { name: string; color?: string; meta?: object }[]
> = {
  CHANNEL: [
    { name: 'Website' },
    { name: 'Facebook' },
    { name: 'Instagram' },
    { name: 'TikTok' },
    { name: 'Google' },
    { name: 'Referral' },
    { name: 'Property Finder' },
    { name: 'Walk-in' },
  ],
  COMM_WAY: [
    { name: 'Call' },
    { name: 'WhatsApp' },
    { name: 'Email' },
    { name: 'SMS' },
    { name: 'Meeting' },
    { name: 'Site visit' },
  ],
  CANCEL_REASON: [
    { name: 'Not interested' },
    { name: 'Wrong number' },
    { name: 'Low budget' },
    { name: 'Bought elsewhere' },
    { name: 'Duplicate' },
    { name: 'No answer' },
    { name: 'Switched off' },
  ],
  LEAD_STAGE: [
    { name: 'New Lead', color: '#4d84c0', meta: { kind: 'OPEN' } },
    { name: 'Potential', color: '#7c6fd6', meta: { kind: 'OPEN' } },
    { name: 'Hot Case', color: '#e0603a', meta: { kind: 'OPEN' } },
    { name: 'Meeting Done', color: '#e0a12e', meta: { kind: 'OPEN' } },
    { name: 'Closed Deal', color: '#22b06b', meta: { kind: 'WON' } },
    { name: 'Non Potential', color: '#8b8ba6', meta: { kind: 'LOST' } },
    { name: 'Low Budget', color: '#8b8ba6', meta: { kind: 'LOST' } },
    { name: 'No Answer', color: '#8b8ba6', meta: { kind: 'OPEN' } },
  ],
  NEXT_ACTION: [
    { name: 'Call' },
    { name: 'WhatsApp follow-up' },
    { name: 'Send offer' },
    { name: 'Book meeting' },
    { name: 'Site visit' },
    { name: 'Send payment plan' },
  ],
};

@Injectable()
export class LookupsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string, type?: LookupType) {
    return this.prisma.lookup.findMany({
      where: { companyId, ...(type ? { type } : {}) },
      orderBy: [{ type: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    });
  }

  async create(companyId: string, dto: CreateLookupDto) {
    const exists = await this.prisma.lookup.findFirst({
      where: { companyId, type: dto.type, name: dto.name },
      select: { id: true },
    });
    if (exists) throw new BadRequestException(`"${dto.name}" already exists for ${dto.type}`);
    return this.prisma.lookup.create({
      data: {
        companyId,
        type: dto.type,
        name: dto.name,
        order: dto.order ?? 0,
        color: dto.color,
        active: dto.active ?? true,
        meta: (dto.meta ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async update(companyId: string, id: string, dto: UpdateLookupDto) {
    await this.ensure(companyId, id);
    return this.prisma.lookup.update({
      where: { id },
      data: {
        name: dto.name,
        order: dto.order,
        color: dto.color,
        active: dto.active,
        meta: dto.meta ? (dto.meta as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async remove(companyId: string, id: string) {
    await this.ensure(companyId, id);
    await this.prisma.lookup.delete({ where: { id } });
  }

  /** Idempotently seed the default lookup sets for a company. */
  async seedDefaults(companyId: string) {
    let created = 0;
    for (const [type, items] of Object.entries(DEFAULT_LOOKUPS)) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const exists = await this.prisma.lookup.findFirst({
          where: { companyId, type: type as LookupType, name: item.name },
          select: { id: true },
        });
        if (!exists) {
          await this.prisma.lookup.create({
            data: {
              companyId,
              type: type as LookupType,
              name: item.name,
              order: i,
              color: item.color,
              meta: (item.meta ?? undefined) as Prisma.InputJsonValue | undefined,
            },
          });
          created++;
        }
      }
    }
    return { created };
  }

  private async ensure(companyId: string, id: string): Promise<void> {
    const found = await this.prisma.lookup.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Lookup not found');
  }
}
