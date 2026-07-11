import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // user id
  companyId: string;
  email: string;
}

/**
 * Validates the access token and rebuilds the AuthUser principal (roles +
 * flattened permissions) on each request. We re-read roles from the DB so a
 * permission change takes effect on the next request without waiting for token
 * expiry.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is inactive or no longer exists');
    }

    const roles = user.roles.map((ur) => ur.role);
    const permissions = [...new Set(roles.flatMap((r) => r.permissions))];

    return {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      roles: roles.map((r) => r.name),
      permissions,
    };
  }
}
