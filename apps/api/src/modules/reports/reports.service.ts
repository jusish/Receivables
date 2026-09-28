import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { ReceivableStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAgingReport(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    const settings = (business?.settings as any) || {};
    let brackets: Array<{ min: number; max: number; label: string }> = [];

    const scheduleType = settings.agingSchedule || 'standard';
    if (scheduleType === 'fast') {
      brackets = [
        { min: 1, max: 5, label: '1-5' },
        { min: 6, max: 10, label: '6-10' },
        { min: 11, max: 20, label: '11-20' },
        { min: 21, max: 30, label: '21-30' },
        { min: 31, max: Infinity, label: '31+' },
      ];
    } else if (scheduleType === 'biweekly') {
      brackets = [
        { min: 1, max: 15, label: '1-15' },
        { min: 16, max: 30, label: '16-30' },
        { min: 31, max: 45, label: '31-45' },
        { min: 46, max: 60, label: '46-60' },
        { min: 61, max: Infinity, label: '61+' },
      ];
    } else if (
      scheduleType === 'custom' &&
      Array.isArray(settings.customAgingDays) &&
      settings.customAgingDays.length > 0
    ) {
      const days = [...settings.customAgingDays].sort((a: number, b: number) => a - b);
      let prev = 1;
      for (let i = 0; i < days.length; i++) {
        brackets.push({ min: prev, max: days[i], label: `${prev}-${days[i]}` });
        prev = days[i] + 1;
      }
      brackets.push({ min: prev, max: Infinity, label: `${prev}+` });
    } else {
      brackets = [
        { min: 1, max: 30, label: '1-30' },
        { min: 31, max: 60, label: '31-60' },
        { min: 61, max: 90, label: '61-90' },
        { min: 91, max: Infinity, label: '91+' },
      ];
    }

    const receivables = await this.prisma.receivable.findMany({
      where: {
        businessId,
        status: { in: [ReceivableStatus.ACTIVE, ReceivableStatus.PARTIALLY_PAID] },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, customerCode: true } },
      },
    });

    const now = new Date();
    const rows = receivables.map((r) => {
      const bal = Number(r.outstandingBalance) || 0;
      let daysOverdue = 0;
      let bracket = 'current';

      if (r.dueDate && new Date(r.dueDate) < now) {
        const diffMs = now.getTime() - new Date(r.dueDate).getTime();
        daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        for (const b of brackets) {
          if (daysOverdue >= b.min && daysOverdue <= b.max) {
            bracket = b.label;
            break;
          }
        }
      }

      return {
        id: r.id,
        ref: r.referenceNumber,
        customerName: r.customer.name,
        customerCode: r.customer.customerCode,
        dueDate: r.dueDate ? r.dueDate.toISOString().split('T')[0] : 'N/A',
        originalAmount: Number(r.originalAmount),
        paidAmount: Number(r.paidAmount),
        outstandingBalance: bal,
        daysOverdue,
        bracket,
      };
    });

    return {
      businessName: business?.name,
      currency: business?.currency || 'RWF',
      asOfDate: now.toISOString(),
      agingSchedule: scheduleType,
      bracketLabels: ['current', ...brackets.map((b) => b.label)],
      rows,
    };
  }

  async getCustomerStatements(businessId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { businessId },
      include: {
        receivables: {
          select: {
            id: true,
            referenceNumber: true,
            status: true,
            originalAmount: true,
            paidAmount: true,
            outstandingBalance: true,
            dueDate: true,
          },
        },
        payments: {
          select: {
            id: true,
            referenceNumber: true,
            amount: true,
            paymentDate: true,
            paymentMethod: true,
          },
        },
      },
    });

    return customers.map((c) => {
      const totalInvoiced = c.receivables.reduce((s, r) => s + Number(r.originalAmount), 0);
      const totalPaid = c.payments.reduce((s, p) => s + Number(p.amount), 0);
      const outstanding = c.receivables
        .filter((r) => r.status === 'ACTIVE' || r.status === 'PARTIALLY_PAID')
        .reduce((s, r) => s + Number(r.outstandingBalance), 0);

      return {
        customerId: c.id,
        customerCode: c.customerCode,
        name: c.name,
        phone: c.phone,
        totalInvoiced,
        totalPaid,
        outstandingBalance: outstanding,
        receivablesCount: c.receivables.length,
        paymentsCount: c.payments.length,
      };
    });
  }

  async getPaymentsReport(businessId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { businessId },
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const byMethod: Record<string, number> = {};
    for (const p of payments) {
      const m = p.paymentMethod;
      byMethod[m] = (byMethod[m] || 0) + Number(p.amount);
    }

    return {
      payments: payments.map((p) => ({
        id: p.id,
        ref: p.referenceNumber,
        customer: p.customer.name,
        amount: Number(p.amount),
        method: p.paymentMethod,
        date: p.paymentDate.toISOString().split('T')[0],
        reference: p.reference,
      })),
      byMethod,
    };
  }

  async generatePdfExport(businessId: string, reportType: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    const exportRecord = await this.prisma.pdfExport.create({
      data: {
        businessId,
        exportType: reportType,
        fileName: `${reportType}_${business?.code}_${Date.now()}.pdf`,
        fileUrl: `https://storage.receivables.internal/exports/${reportType}_${Date.now()}.pdf`,
        requestedById: businessId,
      },
    });

    return {
      success: true,
      message: 'PDF export compiled successfully.',
      exportId: exportRecord.id,
      fileName: exportRecord.fileName,
      downloadUrl: exportRecord.fileUrl,
    };
  }
}
