import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import {
  ReceivableStatus,
  ReceivableSourceType,
  AdjustmentType,
} from '@prisma/client';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { AdjustReceivableDto } from './dto/adjust-receivable.dto';
import { CancelReceivableDto } from './dto/cancel-receivable.dto';

@Injectable()
export class ReceivablesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    businessId: string,
    filters?: {
      status?: string;
      search?: string;
      customerId?: string;
    },
  ) {
    const where: any = { businessId };

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    const now = new Date();

    if (filters?.status && filters.status !== 'ALL') {
      if (filters.status === 'OVERDUE') {
        where.status = { in: [ReceivableStatus.ACTIVE, ReceivableStatus.PARTIALLY_PAID] };
        where.dueDate = { lt: now };
      } else if (filters.status === 'ACTIVE') {
        where.status = { in: [ReceivableStatus.ACTIVE, ReceivableStatus.PARTIALLY_PAID] };
      } else if (filters.status === 'PENDING') {
        where.status = {
          in: [ReceivableStatus.PENDING_ACTIVATION, ReceivableStatus.DRAFT],
        };
      } else {
        where.status = filters.status;
      }
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { referenceNumber: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { customer: { phone: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const receivables = await this.prisma.receivable.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, customerCode: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return receivables.map((r) => {
      const isOverdue =
        (r.status === ReceivableStatus.ACTIVE || r.status === ReceivableStatus.PARTIALLY_PAID) &&
        r.dueDate !== null &&
        new Date(r.dueDate) < now;

      let overdueDays = 0;
      if (isOverdue && r.dueDate) {
        const diffMs = now.getTime() - new Date(r.dueDate).getTime();
        overdueDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }

      return {
        id: r.id,
        ref: r.referenceNumber,
        referenceNumber: r.referenceNumber,
        customerId: r.customerId,
        customer: r.customer.name,
        customerPhone: r.customer.phone,
        customerCode: r.customer.customerCode,
        currency: r.currency,
        originalAmount: Number(r.originalAmount),
        adjustedAmount: Number(r.adjustedAmount),
        paidAmount: Number(r.paidAmount),
        outstanding: Number(r.outstandingBalance),
        outstandingBalance: Number(r.outstandingBalance),
        dueDate: r.dueDate ? r.dueDate.toISOString().split('T')[0] : null,
        activatedAt: r.activatedAt ? r.activatedAt.toISOString() : null,
        sourceType: r.sourceType,
        sourceReference: r.sourceReference,
        status: r.status,
        isOverdue,
        overdueDays,
        createdAt: r.createdAt,
      };
    });
  }

  async findById(businessId: string, id: string) {
    const receivable = await this.prisma.receivable.findFirst({
      where: { id, businessId },
      include: {
        customer: true,
        items: true,
        adjustments: {
          include: { createdBy: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        allocations: {
          include: {
            payment: true,
            createdBy: { select: { fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        collectionActivities: {
          include: { createdBy: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: { select: { fullName: true, phone: true } },
      },
    });

    if (!receivable) {
      throw new NotFoundException('Receivable not found');
    }

    const now = new Date();
    const isOverdue =
      (receivable.status === ReceivableStatus.ACTIVE ||
        receivable.status === ReceivableStatus.PARTIALLY_PAID) &&
      receivable.dueDate !== null &&
      new Date(receivable.dueDate) < now;

    let overdueDays = 0;
    if (isOverdue && receivable.dueDate) {
      const diffMs = now.getTime() - new Date(receivable.dueDate).getTime();
      overdueDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    return {
      ...receivable,
      ref: receivable.referenceNumber,
      originalAmount: Number(receivable.originalAmount),
      adjustedAmount: Number(receivable.adjustedAmount),
      paidAmount: Number(receivable.paidAmount),
      outstandingBalance: Number(receivable.outstandingBalance),
      outstanding: Number(receivable.outstandingBalance),
      dueDate: receivable.dueDate ? receivable.dueDate.toISOString().split('T')[0] : null,
      isOverdue,
      overdueDays,
      items: receivable.items.map((it) => ({
        ...it,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        totalAmount: Number(it.totalAmount),
      })),
      allocations: receivable.allocations.map((al) => ({
        ...al,
        amount: Number(al.amount),
        payment: {
          ...al.payment,
          amount: Number(al.payment.amount),
        },
      })),
      adjustments: receivable.adjustments.map((ad) => ({
        ...ad,
        amount: Number(ad.amount),
      })),
    };
  }

  async create(businessId: string, userId: string, dto: CreateReceivableDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, businessId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let ref = dto.referenceNumber?.trim();
    if (!ref) {
      const count = await this.prisma.receivable.count({ where: { businessId } });
      ref = `REC-${String(count + 189).padStart(6, '0')}`;
    }

    const existing = await this.prisma.receivable.findUnique({
      where: {
        businessId_referenceNumber: {
          businessId,
          referenceNumber: ref,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Receivable reference ${ref} already exists for this business.`);
    }

    const status = (dto.status as ReceivableStatus) || ReceivableStatus.ACTIVE;
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 30 * 86400000);
    const originalAmount = dto.originalAmount;
    const outstandingBalance = originalAmount;

    const receivable = await this.prisma.receivable.create({
      data: {
        businessId,
        customerId: customer.id,
        referenceNumber: ref,
        status,
        originalAmount,
        outstandingBalance,
        dueDate,
        activatedAt: status === ReceivableStatus.ACTIVE ? new Date() : null,
        sourceType: (dto.sourceType as ReceivableSourceType) || ReceivableSourceType.MANUAL,
        sourceReference: dto.sourceReference?.trim() || null,
        createdById: userId,
        customerSnapshot: {
          name: customer.name,
          phone: customer.phone,
          customerCode: customer.customerCode,
        },
        items: dto.items && dto.items.length > 0
          ? {
              create: dto.items.map((it) => ({
                description: it.description,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                totalAmount: it.totalAmount ?? it.quantity * it.unitPrice,
              })),
            }
          : {
              create: [
                {
                  description: 'Accounts Receivable Item',
                  quantity: 1,
                  unitPrice: originalAmount,
                  totalAmount: originalAmount,
                },
              ],
            },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        businessId,
        actorUserId: userId,
        action: 'RECEIVABLE_CREATED',
        entityType: 'Receivable',
        entityId: receivable.id,
        afterData: {
          referenceNumber: receivable.referenceNumber,
          originalAmount: Number(receivable.originalAmount),
          customerName: customer.name,
        },
        reason: 'Receivable created via portal',
      },
    });

    return receivable;
  }

  async activate(businessId: string, userId: string, id: string) {
    const receivable = await this.prisma.receivable.findFirst({
      where: { id, businessId },
    });

    if (!receivable) {
      throw new NotFoundException('Receivable not found');
    }

    if (
      receivable.status !== ReceivableStatus.DRAFT &&
      receivable.status !== ReceivableStatus.PENDING_ACTIVATION
    ) {
      throw new BadRequestException(
        `Cannot activate receivable in ${receivable.status} status. Only DRAFT or PENDING_ACTIVATION can be activated.`,
      );
    }

    const updated = await this.prisma.receivable.update({
      where: { id },
      data: {
        status: ReceivableStatus.ACTIVE,
        activatedAt: new Date(),
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        businessId,
        actorUserId: userId,
        action: 'RECEIVABLE_ACTIVATED',
        entityType: 'Receivable',
        entityId: updated.id,
        afterData: { status: 'ACTIVE', activatedAt: updated.activatedAt },
        reason: 'Order fulfilled / delivery acknowledged',
      },
    });

    return updated;
  }

  async adjust(businessId: string, userId: string, id: string, dto: AdjustReceivableDto) {
    const receivable = await this.prisma.receivable.findFirst({
      where: { id, businessId },
    });

    if (!receivable) {
      throw new NotFoundException('Receivable not found');
    }

    if (
      receivable.status === ReceivableStatus.CANCELLED ||
      receivable.status === ReceivableStatus.WRITTEN_OFF
    ) {
      throw new BadRequestException(`Cannot adjust a ${receivable.status} receivable.`);
    }

    const adjAmount = dto.type === 'CREDIT' ? -Math.abs(dto.amount) : Math.abs(dto.amount);
    const newAdjustedTotal = Number(receivable.adjustedAmount) + adjAmount;
    const newOutstanding =
      Number(receivable.originalAmount) + newAdjustedTotal - Number(receivable.paidAmount);

    if (newOutstanding < 0) {
      throw new BadRequestException('Adjustment cannot reduce outstanding balance below zero.');
    }

    const adjustment = await this.prisma.receivableAdjustment.create({
      data: {
        businessId,
        receivableId: id,
        type: dto.type as AdjustmentType,
        amount: Math.abs(dto.amount),
        reason: dto.reason,
        createdById: userId,
      },
    });

    let newStatus = receivable.status;
    if (newOutstanding === 0 && Number(receivable.paidAmount) > 0) {
      newStatus = ReceivableStatus.PAID;
    }

    const updated = await this.prisma.receivable.update({
      where: { id },
      data: {
        adjustedAmount: newAdjustedTotal,
        outstandingBalance: newOutstanding,
        status: newStatus,
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        businessId,
        actorUserId: userId,
        action: 'RECEIVABLE_ADJUSTED',
        entityType: 'Receivable',
        entityId: id,
        afterData: {
          type: dto.type,
          amount: dto.amount,
          newOutstanding,
          reason: dto.reason,
        },
        reason: dto.reason,
      },
    });

    return { adjustment, receivable: updated };
  }

  async cancel(businessId: string, userId: string, id: string, dto: CancelReceivableDto) {
    const receivable = await this.prisma.receivable.findFirst({
      where: { id, businessId },
    });

    if (!receivable) {
      throw new NotFoundException('Receivable not found');
    }

    if (Number(receivable.paidAmount) > 0) {
      throw new BadRequestException(
        'Cannot cancel receivable with recorded payments. Reverse payments before cancelling.',
      );
    }

    if (receivable.status === ReceivableStatus.CANCELLED) {
      throw new BadRequestException('Receivable is already cancelled.');
    }

    const updated = await this.prisma.receivable.update({
      where: { id },
      data: {
        status: ReceivableStatus.CANCELLED,
        outstandingBalance: 0,
        cancellationReason: dto.reason,
        cancelledAt: new Date(),
        cancelledById: userId,
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        businessId,
        actorUserId: userId,
        action: 'RECEIVABLE_CANCELLED',
        entityType: 'Receivable',
        entityId: id,
        afterData: { status: 'CANCELLED', reason: dto.reason },
        reason: dto.reason,
      },
    });

    return updated;
  }
}
