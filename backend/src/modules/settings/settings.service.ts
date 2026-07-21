import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

/** Sensible defaults merged over whatever the tenant has saved. */
export const DEFAULT_SETTINGS = {
  security: { passwordMinLength: 8, require2FA: false, sessionTimeoutMins: 720 },
  sla: { firstResponseMins: 15, followUpMins: 120 },
  localization: { defaultLanguage: 'en', dateFormat: 'DD/MM/YYYY' },
  branding: { primaryColor: '#e0603a', accentColor: '#7c6fd6' },
  notifications: { emailDigest: true, pushEnabled: true },
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        baseCurrency: true,
        timezone: true,
        settings: true,
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return { ...company, settings: this.merge(company.settings) };
  }

  async update(companyId: string, dto: UpdateSettingsDto) {
    const current = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { settings: true },
    });
    if (!current) throw new NotFoundException('Company not found');

    // Deep-merge the provided settings object over the stored one.
    const mergedSettings = dto.settings
      ? this.deepMerge(this.merge(current.settings), dto.settings)
      : undefined;

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        baseCurrency: dto.baseCurrency,
        timezone: dto.timezone,
        settings: mergedSettings as Prisma.InputJsonValue | undefined,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        baseCurrency: true,
        timezone: true,
        settings: true,
      },
    });
    return { ...updated, settings: this.merge(updated.settings) };
  }

  private merge(stored: Prisma.JsonValue | null): typeof DEFAULT_SETTINGS {
    return this.deepMerge(
      DEFAULT_SETTINGS,
      (stored as Record<string, unknown>) ?? {},
    ) as typeof DEFAULT_SETTINGS;
  }

  private deepMerge<T extends Record<string, unknown>>(base: T, over: Record<string, unknown>): T {
    const out: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(over)) {
      if (v && typeof v === 'object' && !Array.isArray(v) && typeof out[k] === 'object') {
        out[k] = this.deepMerge(out[k] as Record<string, unknown>, v as Record<string, unknown>);
      } else if (v !== undefined) {
        out[k] = v;
      }
    }
    return out as T;
  }
}
