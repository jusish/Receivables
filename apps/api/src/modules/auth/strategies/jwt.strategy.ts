import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../common/database/prisma.service';

export interface JwtPayload {
  sub: string;
  phone: string;
  adminRole?: string;
  businessId?: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'super_secret_jwt_key_replace_in_production_min_32_characters',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { business: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is invalid or deactivated');
    }

    return {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      adminRole: user.adminRole,
      memberships: user.memberships,
      businessId: payload.businessId || user.memberships[0]?.businessId,
      role: payload.role || user.memberships[0]?.role,
    };
  }
}
