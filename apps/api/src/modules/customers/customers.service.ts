import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { normalizePhoneNumber } from '@receivables/shared';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string, search?: string) {
    const where: any = { businessId };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { customerCode: { contains: q, mode: 'insensitive' } },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      include: {
        receivables: {
          select: {
            id: true,
            status: true,
            outstandingBalance: true,
            dueDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    return customers.map((c) => {
      let outstanding = 0;
      let overdue = 0;

      for (const rec of c.receivables) {
        if (rec.status === 'ACTIVE' || rec.status === 'PARTIALLY_PAID') {
          const bal = Number(rec.outstandingBalance) || 0;
          outstanding += bal;
          if (rec.dueDate && new Date(rec.dueDate) < now) {
            overdue += bal;
          }
        }
      }

      return {
        id: c.id,
        customerCode: c.customerCode,
        name: c.name,
        phone: c.phone,
        address: c.address,
        notes: c.notes,
        creditLimit: c.creditLimit ? Number(c.creditLimit) : 0,
        status: c.status,
        outstanding,
        overdue,
        receivablesCount: c.receivables.length,
        createdAt: c.createdAt,
      };
    });
  }

  async findById(businessId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, businessId },
      include: {
        contacts: true,
        receivables: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            items: true,
            allocations: {
              include: { payment: true },
            },
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 20,
        },
        collectionActivities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const now = new Date();
    let outstanding = 0;
    let overdue = 0;

    for (const rec of customer.receivables) {
      if (rec.status === 'ACTIVE' || rec.status === 'PARTIALLY_PAID') {
        const bal = Number(rec.outstandingBalance) || 0;
        outstanding += bal;
        if (rec.dueDate && new Date(rec.dueDate) < now) {
          overdue += bal;
        }
      }
    }

    return {
      ...customer,
      outstanding,
      overdue,
      creditLimit: customer.creditLimit ? Number(customer.creditLimit) : 0,
      receivables: customer.receivables.map((r) => ({
        ...r,
        originalAmount: Number(r.originalAmount),
        paidAmount: Number(r.paidAmount),
        adjustedAmount: Number(r.adjustedAmount),
        outstandingBalance: Number(r.outstandingBalance),
      })),
      payments: customer.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
        unallocatedAmount: Number(p.unallocatedAmount),
      })),
    };
  }

  async create(businessId: string, userId: string, dto: CreateCustomerDto) {
    const phone = normalizePhoneNumber(dto.phone);

    let customerCode = dto.customerCode?.trim();
    if (!customerCode) {
      const count = await this.prisma.customer.count({ where: { businessId } });
      customerCode = `CUS-${String(count + 128).padStart(6, '0')}`;
    }

    const existing = await this.prisma.customer.findUnique({
      where: {
        businessId_customerCode: {
          businessId,
          customerCode,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Customer code ${customerCode} already exists for this business.`);
    }

    const customer = await this.prisma.customer.create({
      data: {
        businessId,
        customerCode,
        name: dto.name.trim(),
        phone,
        address: dto.address?.trim() || null,
        notes: dto.notes?.trim() || null,
        creditLimit: dto.creditLimit ?? 0,
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        businessId,
        actorUserId: userId,
        action: 'CUSTOMER_CREATED',
        entityType: 'Customer',
        entityId: customer.id,
        afterData: { customerCode: customer.customerCode, name: customer.name },
        reason: 'Customer added via portal',
      },
    });

    return customer;
  }

  async update(
    businessId: string,
    customerId: string,
    userId: string,
    dto: Partial<CreateCustomerDto> & { status?: 'ACTIVE' | 'INACTIVE' },
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.phone !== undefined) updateData.phone = normalizePhoneNumber(dto.phone);
    if (dto.address !== undefined) updateData.address = dto.address.trim();
    if (dto.notes !== undefined) updateData.notes = dto.notes.trim();
    if (dto.creditLimit !== undefined) updateData.creditLimit = dto.creditLimit;
    if (dto.status !== undefined) updateData.status = dto.status;

    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: updateData,
    });

    await this.prisma.auditEvent.create({
      data: {
        businessId,
        actorUserId: userId,
        action:
          dto.status !== undefined && dto.status !== customer.status
            ? dto.status === 'INACTIVE'
              ? 'CUSTOMER_DISABLED'
              : 'CUSTOMER_ENABLED'
            : 'CUSTOMER_UPDATED',
        entityType: 'Customer',
        entityId: customer.id,
        beforeData: {
          name: customer.name,
          phone: customer.phone,
          status: customer.status,
          creditLimit: customer.creditLimit ? Number(customer.creditLimit) : 0,
        },
        afterData: {
          name: updated.name,
          phone: updated.phone,
          status: updated.status,
          creditLimit: updated.creditLimit ? Number(updated.creditLimit) : 0,
        },
        reason: 'Customer details updated via portal',
      },
    });

    return updated;
  }
}
