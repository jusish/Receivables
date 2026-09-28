import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { PaymentMethod, PaymentStatus, ReceivableStatus } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string, search?: string) {
    const where: any = { businessId };

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { referenceNumber: { contains: q, mode: 'insensitive' } },
        { reference: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
        allocations: {
          include: {
            receivable: {
              select: { id: true, referenceNumber: true },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return payments.map((p) => ({
      id: p.id,
      ref: p.referenceNumber,
      referenceNumber: p.referenceNumber,
      customerId: p.customerId,
      customer: p.customer.name,
      customerPhone: p.customer.phone,
      amount: Number(p.amount),
      unallocated: Number(p.unallocatedAmount),
      unallocatedAmount: Number(p.unallocatedAmount),
      date: p.paymentDate.toISOString().split('T')[0],
      paymentDate: p.paymentDate.toISOString(),
      method: p.paymentMethod,
      paymentMethod: p.paymentMethod,
      reference: p.reference || '—',
      notes: p.notes,
      status: p.status,
      allocations: p.allocations.map((a) => ({
        id: a.id,
        receivableId: a.receivableId,
        receivableRef: a.receivable.referenceNumber,
        amount: Number(a.amount),
      })),
      createdAt: p.createdAt,
    }));
  }

  async findById(businessId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, businessId },
      include: {
        customer: true,
        createdBy: { select: { fullName: true } },
        allocations: {
          include: {
            receivable: true,
            createdBy: { select: { fullName: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      ...payment,
      ref: payment.referenceNumber,
      amount: Number(payment.amount),
      unallocatedAmount: Number(payment.unallocatedAmount),
      date: payment.paymentDate.toISOString().split('T')[0],
      allocations: payment.allocations.map((a) => ({
        ...a,
        amount: Number(a.amount),
        receivable: {
          ...a.receivable,
          originalAmount: Number(a.receivable.originalAmount),
          paidAmount: Number(a.receivable.paidAmount),
          outstandingBalance: Number(a.receivable.outstandingBalance),
        },
      })),
    };
  }

  async create(businessId: string, userId: string, dto: CreatePaymentDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, businessId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const count = await this.prisma.payment.count({ where: { businessId } });
    const ref = `PAY-${String(count + 103).padStart(6, '0')}`;

    const paymentAmount = Number(dto.amount);
    let totalAllocated = 0;

    // Determine allocations
    const plannedAllocations: Array<{ receivableId: string; amount: number }> = [];

    if (dto.allocations && dto.allocations.length > 0) {
      for (const al of dto.allocations) {
        plannedAllocations.push({
          receivableId: al.receivableId,
          amount: Number(al.amount),
        });
        totalAllocated += Number(al.amount);
      }
    } else if (dto.targetReceivableId) {
      const rec = await this.prisma.receivable.findFirst({
        where: { id: dto.targetReceivableId, businessId },
      });
      if (rec) {
        const allocAmount = Math.min(paymentAmount, Number(rec.outstandingBalance));
        if (allocAmount > 0) {
          plannedAllocations.push({
            receivableId: rec.id,
            amount: allocAmount,
          });
          totalAllocated += allocAmount;
        }
      }
    }

    if (totalAllocated > paymentAmount) {
      throw new BadRequestException('Total allocated amount exceeds payment amount.');
    }

    const unallocatedAmount = paymentAmount - totalAllocated;

    // Execute in Prisma transaction for financial integrity
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          businessId,
          customerId: customer.id,
          referenceNumber: ref,
          amount: paymentAmount,
          unallocatedAmount,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          paymentMethod: (dto.paymentMethod as PaymentMethod) || PaymentMethod.CASH,
          reference: dto.reference?.trim() || null,
          notes: dto.notes?.trim() || null,
          status: PaymentStatus.COMPLETED,
          createdById: userId,
          customerSnapshot: {
            name: customer.name,
            phone: customer.phone,
            customerCode: customer.customerCode,
          },
        },
      });

      for (const alloc of plannedAllocations) {
        const rec = await tx.receivable.findUnique({
          where: { id: alloc.receivableId },
        });

        if (!rec) continue;

        await tx.paymentAllocation.create({
          data: {
            businessId,
            paymentId: payment.id,
            receivableId: rec.id,
            amount: alloc.amount,
            createdById: userId,
          },
        });

        const newPaidAmount = Number(rec.paidAmount) + alloc.amount;
        const newOutstanding = Number(rec.outstandingBalance) - alloc.amount;
        const newStatus =
          newOutstanding <= 0.0001
            ? ReceivableStatus.PAID
            : ReceivableStatus.PARTIALLY_PAID;

        await tx.receivable.update({
          where: { id: rec.id },
          data: {
            paidAmount: newPaidAmount,
            outstandingBalance: Math.max(0, newOutstanding),
            status: newStatus,
          },
        });

        await tx.auditEvent.create({
          data: {
            businessId,
            actorUserId: userId,
            action: 'PAYMENT_ALLOCATED',
            entityType: 'PaymentAllocation',
            entityId: payment.id,
            afterData: {
              paymentRef: payment.referenceNumber,
              receivableRef: rec.referenceNumber,
              allocatedAmount: alloc.amount,
              newOutstanding,
            },
            reason: 'Payment allocated to receivable',
          },
        });
      }

      await tx.auditEvent.create({
        data: {
          businessId,
          actorUserId: userId,
          action: 'PAYMENT_RECORDED',
          entityType: 'Payment',
          entityId: payment.id,
          afterData: {
            referenceNumber: payment.referenceNumber,
            amount: paymentAmount,
            customerName: customer.name,
            method: payment.paymentMethod,
          },
          reason: 'Payment recorded via portal',
        },
      });

      return payment;
    });
  }
}
