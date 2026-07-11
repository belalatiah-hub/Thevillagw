import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SystemRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { DEFAULT_ROLE_PERMISSIONS } from '../../common/rbac/permissions';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { LoginDto, RegisterDto, TokenPairDto } from './dto/auth.dto';

interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Registers a user. When no companyId is supplied we provision a fresh
   * company and make this first user its SUPER_ADMIN — the standard SaaS
   * self-serve onboarding path.
   */
  async register(dto: RegisterDto, meta: RequestMeta = {}): Promise<TokenPairDto> {
    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      let companyId = dto.companyId;
      let makeSuperAdmin = false;

      if (!companyId) {
        const name = dto.companyName?.trim() || `${dto.firstName}'s Company`;
        const company = await tx.company.create({
          data: { name, slug: await this.uniqueSlug(name) },
        });
        companyId = company.id;
        makeSuperAdmin = true;

        // Seed the default role set for the new tenant.
        await tx.role.createMany({
          data: Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([key, permissions]) => ({
            companyId: company.id,
            key: key as SystemRole,
            name: this.humanizeRole(key as SystemRole),
            isSystem: true,
            permissions,
          })),
        });
      }

      const exists = await tx.user.findUnique({
        where: { companyId_email: { companyId, email: dto.email.toLowerCase() } },
      });
      if (exists) {
        throw new ConflictException('A user with this email already exists in the company');
      }

      const created = await tx.user.create({
        data: {
          companyId,
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
      });

      if (makeSuperAdmin) {
        const superAdmin = await tx.role.findFirst({
          where: { companyId, key: SystemRole.SUPER_ADMIN },
        });
        if (superAdmin) {
          await tx.userRole.create({ data: { userId: created.id, roleId: superAdmin.id } });
        }
      }

      return created;
    });

    await this.audit(user.companyId, user.id, 'auth.register', meta);
    return this.issueTokens(user.id, user.companyId, user.email, meta);
  }

  async login(dto: LoginDto, meta: RequestMeta = {}): Promise<TokenPairDto> {
    const email = dto.email.toLowerCase();
    // We can't scope by company for a plain email/password login, so match the
    // first active account with this email that carries a password.
    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true, passwordHash: { not: null } },
    });

    // Constant-ish work whether or not the user exists, to blunt user-enumeration.
    const hash = user?.passwordHash ?? '$argon2id$v=19$m=65536,t=3,p=4$invalidsaltinvalid$invalid';
    const ok = await argon2.verify(hash, dto.password).catch(() => false);

    if (!user || !ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.audit(user.companyId, user.id, 'auth.login', meta);
    return this.issueTokens(user.id, user.companyId, user.email, meta);
  }

  /** Rotates the refresh token: the presented token is revoked and a new pair issued. */
  async refresh(refreshToken: string, meta: RequestMeta = {}): Promise<TokenPairDto> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    let matched = null;
    for (const t of tokens) {
      if (await argon2.verify(t.tokenHash, refreshToken).catch(() => false)) {
        matched = t;
        break;
      }
    }
    if (!matched) {
      throw new UnauthorizedException('Refresh token is expired or revoked');
    }

    await this.prisma.refreshToken.update({
      where: { id: matched.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(payload.sub, payload.companyId, payload.email, meta);
  }

  /** Revokes all refresh tokens for the user (logout everywhere). */
  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ── internals ──────────────────────────────────────────────────────────────

  private async issueTokens(
    userId: string,
    companyId: string,
    email: string,
    meta: RequestMeta,
  ): Promise<TokenPairDto> {
    const payload: JwtPayload = { sub: userId, companyId, email };

    const accessTtl = this.config.get<string>('jwt.accessTtl') ?? '15m';
    const refreshTtl = this.config.get<string>('jwt.refreshTtl') ?? '30d';

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: accessTtl,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: refreshTtl,
    });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: this.ttlToDate(refreshTtl),
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    return { accessToken, refreshToken, expiresIn: accessTtl };
  }

  private ttlToDate(ttl: string): Date {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    const now = Date.now();
    if (!match) {
      return new Date(now + 30 * 24 * 3600 * 1000);
    }
    const value = parseInt(match[1], 10);
    const unit = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]] ?? 86400;
    return new Date(now + value * unit * 1000);
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'company';
    let slug = base;
    let n = 1;
    while (await this.prisma.company.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }
    return slug;
  }

  private humanizeRole(key: SystemRole): string {
    return key
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  private async audit(
    companyId: string,
    actorId: string,
    action: string,
    meta: RequestMeta,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: { companyId, actorId, action, ip: meta.ip, userAgent: meta.userAgent },
    });
  }
}
