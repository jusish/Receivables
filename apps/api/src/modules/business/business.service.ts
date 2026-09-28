import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/database/prisma.service';
import { UserRole } from '@prisma/client';
import { normalizePhoneNumber } from '@receivables/shared';
import * as argon2 from 'argon2';

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getProfile(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, fullName: true, phone: true, isActive: true } },
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return {
      id: business.id,
      name: business.name,
      code: business.code,
      currency: business.currency,
      timezone: business.timezone,
      locale: business.locale,
      status: business.status,
      settings: business.settings || {
        collectionsEnabled: true,
        agingSchedule: 'standard',
        customAgingDays: [30, 60, 90],
      },
      members: business.memberships.map((m) => ({
        id: m.id,
        userId: m.userId,
        fullName: m.user.fullName,
        phone: m.user.phone,
        role: m.role,
        status: m.status,
      })),
    };
  }

  async updateProfile(
    businessId: string,
    data: {
      name?: string;
      timezone?: string;
      settings?: {
        collectionsEnabled?: boolean;
        agingSchedule?: string;
        customAgingDays?: number[];
      };
    },
  ) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.timezone) updateData.timezone = data.timezone.trim();
    if (data.settings !== undefined) {
      const current = await this.prisma.business.findUnique({
        where: { id: businessId },
        select: { settings: true },
      });
      const existingSettings = (current?.settings as any) || {};
      updateData.settings = { ...existingSettings, ...data.settings };
    }

    return this.prisma.business.update({
      where: { id: businessId },
      data: updateData,
    });
  }

  async createBusinessForUser(
    userId: string,
    dto: {
      name: string;
      code?: string;
      currency?: string;
      timezone?: string;
      agingSchedule?: string;
    },
  ) {
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

    let code = dto.code?.trim().toUpperCase();
    if (!code) {
      const slug = dto.name
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

    const initialSettings = {
      collectionsEnabled: true,
      agingSchedule: dto.agingSchedule || 'standard',
      customAgingDays: [30, 60, 90],
    };

    const result = await this.prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: dto.name.trim(),
          code,
          currency: dto.currency || 'RWF',
          timezone: dto.timezone || 'Africa/Kigali',
          status: 'ACTIVE',
          settings: initialSettings,
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
          actorRole: 'BUSINESS_OWNER',
          action: 'BUSINESS_CREATED',
          entityType: 'Business',
          entityId: business.id,
          reason: `Business created by user: ${user.fullName} (${user.phone})`,
          afterData: { name: business.name, code: business.code },
        },
      });

      return { business, membership };
    });

    const allMemberships = await this.prisma.businessMembership.findMany({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { business: true },
    });

    const payload = {
      sub: user.id,
      phone: user.phone,
      fullName: user.fullName,
      adminRole: user.adminRole,
      businessId: result.business.id,
      role: 'BUSINESS_OWNER',
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
        id: result.business.id,
        name: result.business.name,
        code: result.business.code,
        currency: result.business.currency,
        timezone: result.business.timezone,
        settings: result.business.settings,
      },
      businesses: allMemberships.map((m) => ({
        id: m.business.id,
        name: m.business.name,
        code: m.business.code,
        currency: m.business.currency,
        role: m.role,
      })),
      role: 'BUSINESS_OWNER',
      portal: 'web',
    };
  }

  async inviteMember(
    businessId: string,
    actorUserId: string,
    dto: { phone: string; role: string; fullName?: string },
  ) {
    const phone = normalizePhoneNumber(dto.phone);

    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      const defaultPassword = await argon2.hash('Password123!');
      user = await this.prisma.user.create({
        data: {
          phone,
          fullName: dto.fullName?.trim() || 'Invited Staff Member',
          passwordHash: defaultPassword,
        },
      });
    }

    const existingMembership = await this.prisma.businessMembership.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('This user is already a member of this business.');
    }

    const membership = await this.prisma.businessMembership.create({
      data: {
        businessId,
        userId: user.id,
        role: (dto.role as UserRole) || UserRole.ACCOUNTANT,
      },
      include: { user: true },
    });

    await this.prisma.auditEvent.create({
      data: {
        businessId,
        actorUserId,
        action: 'USER_INVITED',
        entityType: 'BusinessMembership',
        entityId: membership.id,
        afterData: { phone, role: membership.role },
        reason: 'User invited via business settings',
      },
    });

    return {
      id: membership.id,
      userId: user.id,
      fullName: user.fullName,
      phone: user.phone,
      role: membership.role,
      status: membership.status,
    };
  }

  async getAuditTrail(businessId: string, search?: string) {
    const where: any = { businessId };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { action: { contains: q, mode: 'insensitive' } },
        { entityType: { contains: q, mode: 'insensitive' } },
        { reason: { contains: q, mode: 'insensitive' } },
      ];
    }

    const events = await this.prisma.auditEvent.findMany({
      where,
      include: {
        actor: { select: { fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return events.map((e) => ({
      id: e.id,
      action: e.action,
      entityType: e.entityType,
      entityId: e.entityId,
      actor: e.actor ? `${e.actor.fullName} (${e.actorRole || 'Staff'})` : 'System',
      actorPhone: e.actor?.phone,
      reason: e.reason || '—',
      createdAt: e.createdAt.toISOString(),
      beforeData: e.beforeData,
      afterData: e.afterData,
      ipAddress: e.ipAddress,
      requestId: e.requestId,
    }));
  }
}

