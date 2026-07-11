import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Lead, LeadSource, LeadStatus, Prisma } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { normalizePhone } from '../../common/util/phone';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AssignLeadDto,
  CaptureLeadDto,
  CreateLeadDto,
  QueryLeadsDto,
  UpdateLeadDto,
} from './dto/lead.dto';
import { LeadScoringService } from './lead-scoring.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: LeadScoringService,
  ) {}

  /**
   * Public capture from the marketing site. Resolves the company by slug,
   * de-duplicates against a recent lead with the same normalised phone, scores
   * the lead, and records an audit entry. Idempotent-ish: a duplicate within the
   * window updates the existing lead's message/activity instead of piling up rows.
   */
  async capture(dto: CaptureLeadDto): Promise<{ id: string; duplicate: boolean }> {
    const company = await this.prisma.company.findUnique({
      where: { slug: dto.companySlug },
      select: { id: true, isActive: true, baseCurrency: true },
    });
    if (!company || !company.isActive) {
      throw new NotFoundException('Unknown company');
    }

    const phoneNormalized = normalizePhone(dto.phone);
    const duplicate = phoneNormalized
      ? await this.prisma.lead.findFirst({
          where: {
            companyId: company.id,
            phoneNormalized,
            createdAt: { gt: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
          },
          orderBy: { createdAt: 'desc' },
        })
      : null;

    const budgetMinor = dto.budgetMinor != null ? BigInt(dto.budgetMinor) : null;
    const { score, temperature } = this.scoring.score({
      source: dto.source ?? LeadSource.WEBSITE,
      email: dto.email,
      phone: dto.phone,
      interestArea: dto.interestArea,
      budgetMinor,
      message: dto.message,
      projectId: dto.projectId,
    });

    if (duplicate) {
      // Keep the strongest score we've seen for this person, and derive the
      // temperature from that final score so the two never disagree.
      const mergedScore = Math.max(score, duplicate.score);
      const mergedTemperature = this.scoring.temperatureFor(mergedScore);
      await this.prisma.$transaction([
        this.prisma.lead.update({
          where: { id: duplicate.id },
          data: {
            message: dto.message ?? duplicate.message,
            score: mergedScore,
            temperature: mergedTemperature,
            lastActivityAt: new Date(),
          },
        }),
        this.prisma.activity.create({
          data: {
            companyId: company.id,
            type: 'NOTE',
            status: 'DONE',
            subject: 'Repeat web enquiry',
            body: dto.message ?? 'Customer submitted the enquiry form again.',
            leadId: duplicate.id,
            completedAt: new Date(),
          },
        }),
      ]);
      return { id: duplicate.id, duplicate: true };
    }

    const lead = await this.prisma.lead.create({
      data: {
        companyId: company.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        phoneNormalized,
        source: dto.source ?? LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        temperature,
        score,
        interestArea: dto.interestArea,
        budgetMinor,
        currency: dto.currency ?? company.baseCurrency,
        message: dto.message,
        projectId: dto.projectId,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        landingUrl: dto.landingUrl,
        referrerUrl: dto.referrerUrl,
        lastActivityAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'lead.capture',
        entityType: 'Lead',
        entityId: lead.id,
        metadata: { source: lead.source, score },
      },
    });

    this.logger.log(`Captured lead ${lead.id} (${lead.source}, score ${score})`);
    return { id: lead.id, duplicate: false };
  }

  /**
   * Accepts the marketing site's native lead payload
   * (`{ name, phone, source, page, locale, ts, site }`) and maps it onto the
   * capture pipeline, so the site's `LEAD_ENDPOINT` can point straight here
   * with no front-end changes. The site's free-text `source` (e.g. "popup") is
   * normalised to the WEBSITE channel and preserved in the lead message.
   */
  async captureFromSite(
    companySlug: string,
    payload: Record<string, unknown>,
  ): Promise<{ id: string; duplicate: boolean }> {
    const name = String(payload.name ?? '').trim();
    const phone = String(payload.phone ?? '').trim();
    if (name.length < 2 || phone.replace(/\D/g, '').length < 7) {
      throw new BadRequestException('name and a valid phone are required');
    }
    const [firstName, ...rest] = name.split(/\s+/);
    const channel = String(payload.source ?? 'website');
    const page = payload.page ? String(payload.page) : undefined;

    return this.capture({
      companySlug,
      firstName,
      lastName: rest.join(' ') || undefined,
      phone,
      source: LeadSource.WEBSITE,
      message: `Web enquiry via "${channel}"${page ? ` on ${page}` : ''}`,
      landingUrl: page,
      utmSource: payload.utmSource ? String(payload.utmSource) : undefined,
      utmMedium: payload.utmMedium ? String(payload.utmMedium) : undefined,
      utmCampaign: payload.utmCampaign ? String(payload.utmCampaign) : undefined,
    });
  }

  async create(user: AuthUser, dto: CreateLeadDto): Promise<Lead> {
    const budgetMinor = dto.budgetMinor != null ? BigInt(dto.budgetMinor) : null;
    const { score, temperature } = this.scoring.score({ ...dto, budgetMinor });

    return this.prisma.lead.create({
      data: {
        companyId: user.companyId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        phoneNormalized: normalizePhone(dto.phone),
        source: dto.source ?? LeadSource.MANUAL,
        temperature,
        score,
        interestArea: dto.interestArea,
        budgetMinor,
        currency: dto.currency,
        message: dto.message,
        projectId: dto.projectId,
        ownerId: dto.ownerId,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        lastActivityAt: new Date(),
      },
    });
  }

  async findAll(user: AuthUser, query: QueryLeadsDto): Promise<PaginatedResult<Lead>> {
    const where: Prisma.LeadWhereInput = {
      companyId: user.companyId,
      status: query.status,
      source: query.source,
      temperature: query.temperature,
      ownerId: query.ownerId,
    };

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term } },
        { phoneNormalized: { contains: normalizePhone(term) ?? term } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return new PaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(user: AuthUser, id: string): Promise<Lead> {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return lead;
  }

  async update(user: AuthUser, id: string, dto: UpdateLeadDto): Promise<Lead> {
    await this.ensureExists(user, id);

    if (dto.status === LeadStatus.LOST && !dto.lostReason) {
      throw new BadRequestException('lostReason is required when marking a lead LOST');
    }

    const budgetMinor = dto.budgetMinor != null ? BigInt(dto.budgetMinor) : undefined;

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        phoneNormalized: dto.phone ? normalizePhone(dto.phone) : undefined,
        status: dto.status,
        source: dto.source,
        temperature: dto.temperature,
        interestArea: dto.interestArea,
        budgetMinor,
        currency: dto.currency,
        message: dto.message,
        projectId: dto.projectId,
        lostReason: dto.lostReason,
        wonReason: dto.wonReason,
        lastActivityAt: new Date(),
      },
    });

    if (dto.status) {
      await this.prisma.activity.create({
        data: {
          companyId: user.companyId,
          ownerId: user.id,
          type: 'STATUS_CHANGE',
          status: 'DONE',
          subject: `Status → ${dto.status}`,
          leadId: id,
          completedAt: new Date(),
        },
      });
    }
    return updated;
  }

  async assign(user: AuthUser, id: string, dto: AssignLeadDto): Promise<Lead> {
    await this.ensureExists(user, id);
    const owner = await this.prisma.user.findFirst({
      where: { id: dto.ownerId, companyId: user.companyId },
      select: { id: true },
    });
    if (!owner) {
      throw new BadRequestException('Owner must be a user in the same company');
    }
    return this.prisma.lead.update({ where: { id }, data: { ownerId: dto.ownerId } });
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.ensureExists(user, id);
    await this.prisma.lead.delete({ where: { id } });
  }

  private async ensureExists(user: AuthUser, id: string): Promise<void> {
    const found = await this.prisma.lead.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Lead not found');
    }
  }
}
