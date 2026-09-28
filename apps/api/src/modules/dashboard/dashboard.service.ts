import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { ReceivableStatus, FollowUpStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(businessId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    // 1. Receivables in scope
    const receivables = await this.prisma.receivable.findMany({
      where: {
        businessId,
        status: { in: [ReceivableStatus.ACTIVE, ReceivableStatus.PARTIALLY_PAID] },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    let totalOutstanding = 0;
    let overdueBalance = 0;
    let dueIn7Days = 0;
    let dueIn7DaysCount = 0;

    // Aging brackets
    let bucketCurrent = 0;
    let countCurrent = 0;

    let bucket1_30 = 0;
    let count1_30 = 0;

    let bucket31_60 = 0;
    let count31_60 = 0;

    let bucket61_90 = 0;
    let count61_90 = 0;

    let bucket91Plus = 0;
    let count91Plus = 0;

    for (const r of receivables) {
      const bal = Number(r.outstandingBalance) || 0;
      totalOutstanding += bal;

      if (!r.dueDate || new Date(r.dueDate) >= now) {
        // Current (not due)
        bucketCurrent += bal;
        countCurrent += 1;

        if (r.dueDate && new Date(r.dueDate) <= inSevenDays) {
          dueIn7Days += bal;
          dueIn7DaysCount += 1;
        }
      } else {
        // Overdue
        overdueBalance += bal;
        const diffMs = now.getTime() - new Date(r.dueDate).getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (days <= 30) {
          bucket1_30 += bal;
          count1_30 += 1;
        } else if (days <= 60) {
          bucket31_60 += bal;
          count31_60 += 1;
        } else if (days <= 90) {
          bucket61_90 += bal;
          count61_90 += 1;
        } else {
          bucket91Plus += bal;
          count91Plus += 1;
        }
      }
    }

    // 2. Payments collected this month
    const payments = await this.prisma.payment.findMany({
      where: {
        businessId,
        paymentDate: { gte: startOfMonth },
      },
      select: { amount: true },
    });

    const collectedThisMonth = payments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0,
    );

    // 3. Follow-ups count
    const followUpsCount = await this.prisma.followUpTask.count({
      where: {
        businessId,
        status: FollowUpStatus.PENDING,
      },
    });

    // 4. Six-Month Cash Flow Trend (Invoiced vs Collected)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const historicalReceivables = await this.prisma.receivable.findMany({
      where: {
        businessId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { originalAmount: true, createdAt: true },
    });

    const historicalPayments = await this.prisma.payment.findMany({
      where: {
        businessId,
        paymentDate: { gte: sixMonthsAgo },
      },
      select: { amount: true, paymentDate: true, paymentMethod: true },
    });

    const cashFlowTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mYear = d.getFullYear();
      const mIdx = d.getMonth();
      const label = `${monthNames[mIdx]} ${mYear === now.getFullYear() ? '' : mYear}`.trim();

      const billed = historicalReceivables
        .filter((r) => {
          const rDate = new Date(r.createdAt);
          return rDate.getFullYear() === mYear && rDate.getMonth() === mIdx;
        })
        .reduce((sum, r) => sum + (Number(r.originalAmount) || 0), 0);

      const collected = historicalPayments
        .filter((p) => {
          const pDate = new Date(p.paymentDate);
          return pDate.getFullYear() === mYear && pDate.getMonth() === mIdx;
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      cashFlowTrend.push({
        month: label,
        billed,
        collected,
      });
    }

    // 5. Payment Methods Breakdown
    const methodMap: Record<string, { count: number; amount: number }> = {};
    for (const p of historicalPayments) {
      const method = p.paymentMethod || 'OTHER';
      if (!methodMap[method]) {
        methodMap[method] = { count: 0, amount: 0 };
      }
      methodMap[method].count += 1;
      methodMap[method].amount += Number(p.amount) || 0;
    }

    const totalMethodAmount = Object.values(methodMap).reduce((s, v) => s + v.amount, 0);
    const paymentMethods = Object.entries(methodMap).map(([method, data]) => ({
      method,
      label: method.replace('_', ' '),
      amount: data.amount,
      count: data.count,
      percentage: totalMethodAmount > 0 ? Math.round((data.amount / totalMethodAmount) * 100) : 0,
    }));

    // 6. Upcoming Due Invoices (Next 30 Days)
    const upcomingDue = receivables
      .filter((r) => r.dueDate && new Date(r.dueDate) >= now)
      .slice(0, 5)
      .map((r) => {
        const diffMs = new Date(r.dueDate!).getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return {
          id: r.id,
          invoiceNumber: r.referenceNumber,
          customerName: r.customer?.name || 'Customer',
          customerPhone: r.customer?.phone || '—',
          amount: Number(r.originalAmount) || 0,
          outstandingBalance: Number(r.outstandingBalance) || 0,
          dueDate: r.dueDate ? r.dueDate.toISOString().split('T')[0] : '',
          daysLeft,
        };
      });

    // 7. Top Customer Debtors
    const debtorMap: Record<
      string,
      {
        id: string;
        name: string;
        phone: string;
        invoicesCount: number;
        totalOutstanding: number;
      }
    > = {};

    for (const r of receivables) {
      const cId = r.customerId;
      if (!debtorMap[cId]) {
        debtorMap[cId] = {
          id: cId,
          name: r.customer?.name || 'Unknown',
          phone: r.customer?.phone || '—',
          invoicesCount: 0,
          totalOutstanding: 0,
        };
      }
      debtorMap[cId].invoicesCount += 1;
      debtorMap[cId].totalOutstanding += Number(r.outstandingBalance) || 0;
    }

    const topDebtors = Object.values(debtorMap)
      .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
      .slice(0, 5);

    // 8. Recent Activities (Collections & Follow-ups)
    const recentActivities = await this.prisma.collectionActivity.findMany({
      where: { businessId },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const formattedActivities = recentActivities.map((act) => ({
      id: act.id,
      customerName: act.customer?.name || 'Customer',
      type: act.type,
      outcome: act.outcome,
      notes: act.notes,
      promisedAmount: act.promisedAmount ? Number(act.promisedAmount) : null,
      createdAt: act.createdAt.toISOString(),
    }));

    return {
      totalOutstanding,
      activeReceivablesCount: receivables.length,
      overdueBalance,
      dueIn7Days,
      dueIn7DaysCount,
      collectedThisMonth,
      paymentsCountMonth: payments.length,
      followUpsDueCount: followUpsCount || 0,
      aging: {
        current: { amount: bucketCurrent, count: countCurrent },
        days1_30: { amount: bucket1_30, count: count1_30 },
        days31_60: { amount: bucket31_60, count: count31_60 },
        days61_90: { amount: bucket61_90, count: count61_90 },
        days91Plus: { amount: bucket91Plus, count: count91Plus },
      },
      cashFlowTrend,
      paymentMethods,
      upcomingDue,
      topDebtors,
      recentActivities: formattedActivities,
    };
  }
}
