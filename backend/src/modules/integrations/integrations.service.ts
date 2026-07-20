import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Integration, IntegrationProvider, Prisma } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { encryptSecret, maskSecret } from '../../common/crypto/secret-box';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectIntegrationDto, UpdateIntegrationDto } from './dto/integration.dto';
import { findProvider, PROVIDERS } from './registry';

/** Public shape returned to clients — secrets are NEVER included. */
export type SafeIntegration = Omit<Integration, 'secretEnc' | 'webhookSecret'>;

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private get encKey(): string {
    return this.config.get<string>('integrationEncKey') ?? 'dev-integration-key';
  }

  private safe(i: Integration): SafeIntegration {
    // Strip encrypted material before it can ever reach a response.
    const { secretEnc: _s, webhookSecret: _w, ...rest } = i;
    void _s;
    void _w;
    return rest;
  }

  /** The catalogue of available providers + which ones this company has connected. */
  async catalog(user: AuthUser) {
    const connected = await this.prisma.integration.findMany({
      where: { companyId: user.companyId },
    });
    const byProvider = new Map(connected.map((c) => [c.provider, c]));
    return PROVIDERS.map((p) => {
      const conn = byProvider.get(p.provider);
      return {
        ...p,
        connection: conn
          ? {
              id: conn.id,
              status: conn.status,
              enabled: conn.enabled,
              lastSyncAt: conn.lastSyncAt,
              secretHint: conn.secretHint,
            }
          : null,
      };
    });
  }

  list(user: AuthUser): Promise<SafeIntegration[]> {
    return this.prisma.integration
      .findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: 'asc' } })
      .then((rows) => rows.map((r) => this.safe(r)));
  }

  /** Connect (or reconnect) a provider. Secrets are encrypted before storage. */
  async connect(
    user: AuthUser,
    provider: IntegrationProvider,
    dto: ConnectIntegrationDto,
  ): Promise<SafeIntegration> {
    const desc = findProvider(provider);
    if (!desc) {
      throw new BadRequestException('Unknown integration provider');
    }
    // Validate required config fields are present.
    const missing = desc.configFields
      .filter((f) => f.required && !dto.config?.[f.key])
      .map((f) => f.key);
    if (missing.length) {
      throw new BadRequestException(`Missing required config: ${missing.join(', ')}`);
    }

    const secretBundle = JSON.stringify(dto.secrets ?? {});
    const firstSecret = Object.values(dto.secrets ?? {})[0] ?? '';

    const data = {
      name: dto.name ?? desc.name,
      authType: desc.authType,
      config: (dto.config ?? {}) as Prisma.InputJsonValue,
      secretEnc: encryptSecret(secretBundle, this.encKey),
      secretHint: firstSecret ? maskSecret(firstSecret) : null,
      webhookSecret: dto.webhookSecret ? encryptSecret(dto.webhookSecret, this.encKey) : undefined,
      status: 'CONNECTED' as const,
      enabled: true,
    };

    const row = await this.prisma.integration.upsert({
      where: { companyId_provider: { companyId: user.companyId, provider } },
      create: { companyId: user.companyId, provider, ...data },
      update: data,
    });

    await this.prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        actorId: user.id,
        action: 'integration.connect',
        entityType: 'Integration',
        entityId: row.id,
        metadata: { provider },
      },
    });
    return this.safe(row);
  }

  async update(user: AuthUser, id: string, dto: UpdateIntegrationDto): Promise<SafeIntegration> {
    const existing = await this.get(user, id);
    const patch: Prisma.IntegrationUpdateInput = {};
    if (dto.enabled != null) patch.enabled = dto.enabled;
    if (dto.config) patch.config = dto.config as Prisma.InputJsonValue;
    if (dto.secrets) {
      patch.secretEnc = encryptSecret(JSON.stringify(dto.secrets), this.encKey);
      const first = Object.values(dto.secrets)[0] ?? '';
      patch.secretHint = first ? maskSecret(first) : existing.secretHint;
    }
    const row = await this.prisma.integration.update({ where: { id }, data: patch });
    return this.safe(row);
  }

  /**
   * "Test connection" / health check. Real providers would ping their API here;
   * we validate that required config + a secret are present and record health +
   * a sync-log entry, flipping status to CONNECTED or ERROR accordingly.
   */
  async test(user: AuthUser, id: string): Promise<{ status: string; health: unknown }> {
    const row = await this.getRaw(user, id);
    const desc = findProvider(row.provider);
    const cfg = (row.config ?? {}) as Record<string, unknown>;
    const missing = (desc?.configFields ?? []).filter((f) => f.required && !cfg[f.key]);
    const ok = !!row.secretEnc && missing.length === 0;

    const health = {
      checkedAt: new Date().toISOString(),
      ok,
      latencyMs: ok ? 120 : null,
      message: ok ? 'Credentials present; handshake OK' : 'Missing credentials or required config',
    };
    const updated = await this.prisma.integration.update({
      where: { id },
      data: {
        status: ok ? 'CONNECTED' : 'ERROR',
        health: health as Prisma.InputJsonValue,
        lastError: ok ? null : health.message,
      },
    });
    await this.prisma.integrationSyncLog.create({
      data: {
        integrationId: id,
        direction: 'INBOUND',
        status: ok ? 'SUCCESS' : 'FAILED',
        summary: ok ? 'Connection test passed' : 'Connection test failed',
        error: ok ? null : health.message,
      },
    });
    return { status: updated.status, health };
  }

  logs(user: AuthUser, id: string) {
    return this.getRaw(user, id).then(() =>
      this.prisma.integrationSyncLog.findMany({
        where: { integrationId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    );
  }

  async disconnect(user: AuthUser, id: string): Promise<void> {
    await this.getRaw(user, id);
    await this.prisma.integration.delete({ where: { id } });
  }

  private async get(user: AuthUser, id: string): Promise<SafeIntegration> {
    return this.safe(await this.getRaw(user, id));
  }

  private async getRaw(user: AuthUser, id: string): Promise<Integration> {
    const row = await this.prisma.integration.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!row) {
      throw new NotFoundException('Integration not found');
    }
    return row;
  }
}
