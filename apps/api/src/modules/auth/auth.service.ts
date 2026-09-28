import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { normalizePhoneNumber } from '@receivables/shared';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Fallback in-memory store for OTPs if Redis is unavailable
  private readonly otpMemoryStore = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto) {
    const normalizedPhone = normalizePhoneNumber(loginDto.phone);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: normalizedPhone }, { phone: loginDto.phone }],
      },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { business: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User account has been deactivated. Please contact support.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    if (loginDto.portalType === 'admin') {
      if (!user.adminRole) {
        throw new ForbiddenException(
          'Access denied: You do not possess administrative permissions for the Admin Console.',
        );
      }

      const payload = {
        sub: user.id,
        phone: user.phone,
        fullName: user.fullName,
        adminRole: user.adminRole,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          phone: user.phone,
          fullName: user.fullName,
          adminRole: user.adminRole,
        },
        portal: 'admin',
      };
    }

    // Business portal login
    let targetMembership = loginDto.lastBusinessId
      ? user.memberships.find((m) => m.businessId === loginDto.lastBusinessId)
      : null;

    if (!targetMembership) {
      targetMembership = user.memberships[0];
    }

    if (!targetMembership && !user.adminRole) {
      throw new ForbiddenException('No active business membership found for this user account.');
    }

    const business = targetMembership?.business || null;
    const role = targetMembership?.role || null;

    const payload = {
      sub: user.id,
      phone: user.phone,
      fullName: user.fullName,
      adminRole: user.adminRole,
      businessId: business?.id,
      role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        adminRole: user.adminRole,
      },
      business: business
        ? {
            id: business.id,
            name: business.name,
            code: business.code,
            currency: business.currency,
            timezone: business.timezone,
          }
        : null,
      businesses: user.memberships.map((m) => ({
        id: m.business.id,
        name: m.business.name,
        code: m.business.code,
        currency: m.business.currency,
        role: m.role,
      })),
      role,
      portal: 'web',
    };
  }

  async signup(dto: {
    fullName: string;
    phone: string;
    password: string;
    businessName: string;
    businessCode?: string;
    currency?: string;
    timezone?: string;
  }) {
    const normalizedPhone = normalizePhoneNumber(dto.phone);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: normalizedPhone }, { phone: dto.phone }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'An account with this phone number already exists. Please log in or reset your password.',
      );
    }

    let code = dto.businessCode?.trim().toUpperCase();
    if (!code) {
      const slug = dto.businessName
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 4)
        .toUpperCase();
      const rand = Math.floor(100 + Math.random() * 900);
      code = `BIZ-${slug || 'CORP'}-${rand}`;
    }

    const existingBiz = await this.prisma.business.findUnique({
      where: { code },
    });

    if (existingBiz) {
      code = `${code}-${Math.floor(10 + Math.random() * 90)}`;
    }

    const passwordHash = await argon2.hash(dto.password);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: dto.fullName.trim(),
          phone: normalizedPhone,
          passwordHash,
          isActive: true,
        },
      });

      const business = await tx.business.create({
        data: {
          name: dto.businessName.trim(),
          code,
          currency: dto.currency || 'RWF',
          timezone: dto.timezone || 'Africa/Kigali',
          status: 'ACTIVE',
        },
      });

      const membership = await tx.businessMembership.create({
        data: {
          businessId: business.id,
          userId: user.id,
          role: 'BUSINESS_OWNER',
          status: 'ACTIVE',
        },
      });

      await tx.auditEvent.create({
        data: {
          businessId: business.id,
          actorUserId: user.id,
          action: 'BUSINESS_CREATED',
          entityType: 'Business',
          entityId: business.id,
          reason: 'Self-serve registration by business owner',
          afterData: { name: business.name, code: business.code },
        },
      });

      return { user, business, membership };
    });

    const payload = {
      sub: result.user.id,
      phone: result.user.phone,
      fullName: result.user.fullName,
      businessId: result.business.id,
      role: result.membership.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: result.user.id,
        phone: result.user.phone,
        fullName: result.user.fullName,
        adminRole: null,
      },
      business: {
        id: result.business.id,
        name: result.business.name,
        code: result.business.code,
        currency: result.business.currency,
        timezone: result.business.timezone,
      },
      businesses: [
        {
          id: result.business.id,
          name: result.business.name,
          code: result.business.code,
          currency: result.business.currency,
          role: result.membership.role,
        },
      ],
      role: result.membership.role,
      portal: 'web',
    };
  }

  async switchBusiness(userId: string, targetBusinessId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { business: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const membership = user.memberships.find((m) => m.businessId === targetBusinessId);
    if (!membership && !user.adminRole) {
      throw new ForbiddenException('You do not have access to this business.');
    }

    const business =
      membership?.business ||
      (await this.prisma.business.findUnique({ where: { id: targetBusinessId } }));
    if (!business) {
      throw new NotFoundException('Target business not found');
    }

    const role = membership?.role || 'BUSINESS_OWNER';

    const payload = {
      sub: user.id,
      phone: user.phone,
      fullName: user.fullName,
      adminRole: user.adminRole,
      businessId: business.id,
      role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        adminRole: user.adminRole,
      },
      business: {
        id: business.id,
        name: business.name,
        code: business.code,
        currency: business.currency,
        timezone: business.timezone,
      },
      businesses: user.memberships.map((m) => ({
        id: m.business.id,
        name: m.business.name,
        code: m.business.code,
        currency: m.business.currency,
        role: m.role,
      })),
      role,
      portal: 'web',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const normalizedPhone = normalizePhoneNumber(dto.phone);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: normalizedPhone }, { phone: dto.phone }],
      },
    });

    if (!user) {
      throw new NotFoundException('No registered account found with this phone number.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisClient = this.redisService.getClient();

    try {
      if (redisClient && redisClient.status === 'ready') {
        await redisClient.set(`otp:${normalizedPhone}`, otp, 'EX', 600);
      } else {
        this.otpMemoryStore.set(normalizedPhone, {
          otp,
          expiresAt: Date.now() + 600 * 1000,
        });
      }
    } catch {
      this.otpMemoryStore.set(normalizedPhone, {
        otp,
        expiresAt: Date.now() + 600 * 1000,
      });
    }

    this.logger.log(`Password reset OTP for ${normalizedPhone}: ${otp}`);

    // Return OTP directly in response for local/testing convenience as requested
    return {
      success: true,
      message: 'OTP has been generated for password reset. (Displayed below for testing)',
      phone: normalizedPhone,
      otp,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const normalizedPhone = normalizePhoneNumber(dto.phone);

    let storedOtp: string | null = null;
    const redisClient = this.redisService.getClient();

    try {
      if (redisClient && redisClient.status === 'ready') {
        storedOtp = await redisClient.get(`otp:${normalizedPhone}`);
      }
    } catch {
      // ignore
    }

    if (!storedOtp) {
      const memoryItem = this.otpMemoryStore.get(normalizedPhone);
      if (memoryItem && memoryItem.expiresAt > Date.now()) {
        storedOtp = memoryItem.otp;
      }
    }

    if (!storedOtp || storedOtp.trim() !== dto.otp.trim()) {
      throw new BadRequestException('Invalid or expired OTP. Please request a new one.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: normalizedPhone }, { phone: dto.phone }],
      },
    });

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Cleanup OTP
    try {
      if (redisClient && redisClient.status === 'ready') {
        await redisClient.del(`otp:${normalizedPhone}`);
      }
    } catch {
      // ignore
    }
    this.otpMemoryStore.delete(normalizedPhone);

    return {
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    };
  }

  async getMe(userId: string, currentBusinessId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { business: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let activeMembership = currentBusinessId
      ? user.memberships.find((m) => m.businessId === currentBusinessId)
      : null;

    if (!activeMembership && user.memberships.length > 0) {
      activeMembership = user.memberships[0];
    }

    return {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      adminRole: user.adminRole,
      memberships: user.memberships.map((m) => ({
        businessId: m.businessId,
        businessName: m.business.name,
        businessCode: m.business.code,
        role: m.role,
        currency: m.business.currency,
      })),
      activeBusiness: activeMembership?.business || null,
      activeRole: activeMembership?.role || null,
    };
  }
}
