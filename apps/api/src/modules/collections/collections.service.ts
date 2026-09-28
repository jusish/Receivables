import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import {
  CollectionActivityType,
  CollectionOutcome,
  FollowUpStatus,
} from '@prisma/client';
import { CreateCollectionActivityDto } from './dto/create-activity.dto';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    const activities = await this.prisma.collectionActivity.findMany({
      where: { businessId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        receivable: { select: { id: true, referenceNumber: true, outstandingBalance: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const followUpsDueToday = await this.prisma.followUpTask.count({
      where: {
        businessId,
        status: FollowUpStatus.PENDING,
        dueDate: { gte: startOfToday, lte: endOfToday },
      },
    });

    const overdueFollowUps = await this.prisma.followUpTask.count({
      where: {
        businessId,
        status: FollowUpStatus.PENDING,
        dueDate: { lt: startOfToday },
      },
    });

    const totalPromises = await this.prisma.collectionActivity.count({
      where: {
        businessId,
        outcome: CollectionOutcome.PROMISED_TO_PAY,
      },
    });

    const paymentsMade = await this.prisma.collectionActivity.count({
      where: {
        businessId,
        outcome: CollectionOutcome.PAYMENT_MADE,
      },
    });

    const promiseSuccessRate =
      totalPromises > 0 ? `${Math.round((paymentsMade / totalPromises) * 100)}%` : '0%';

    const pendingTasks = await this.prisma.followUpTask.findMany({
      where: {
        businessId,
        status: FollowUpStatus.PENDING,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        receivable: { select: { id: true, referenceNumber: true, outstandingBalance: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });

    return {
      activities: activities.map((act) => ({
        id: act.id,
        customerId: act.customerId,
        customer: act.customer.name,
        phone: act.customer.phone,
        receivableId: act.receivableId,
        receivableRef: act.receivable?.referenceNumber || '—',
        outstanding: act.receivable ? Number(act.receivable.outstandingBalance) : 0,
        type: act.type,
        outcome: act.outcome,
        notes: act.notes,
        promisedDate: act.promisedDate ? act.promisedDate.toISOString().split('T')[0] : null,
        promisedAmount: act.promisedAmount ? Number(act.promisedAmount) : null,
        actor: act.createdBy.fullName,
        date: act.createdAt.toISOString().split('T')[0],
        createdAt: act.createdAt,
      })),
      tasks: pendingTasks.map((t) => ({
        id: t.id,
        customerId: t.customerId,
        customer: t.customer.name,
        phone: t.customer.phone,
        receivableId: t.receivableId,
        receivableRef: t.receivable?.referenceNumber || '—',
        outstanding: t.receivable ? Number(t.receivable.outstandingBalance) : 0,
        dueDate: t.dueDate.toISOString().split('T')[0],
        isOverdue: new Date(t.dueDate) < startOfToday,
        isDueToday: new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) <= endOfToday,
        status: t.status,
      })),
      metrics: {
        dueToday: followUpsDueToday,
        overdueTasks: overdueFollowUps,
        successRate: promiseSuccessRate,
        totalActivities: activities.length,
      },
    };
  }

  async completeTask(businessId: string, taskId: string) {
    const task = await this.prisma.followUpTask.findFirst({
      where: { id: taskId, businessId },
    });

    if (!task) {
      throw new NotFoundException('Follow-up task not found');
    }

    return this.prisma.followUpTask.update({
      where: { id: taskId },
      data: { status: FollowUpStatus.COMPLETED },
    });
  }

  async create(businessId: string, userId: string, dto: CreateCollectionActivityDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, businessId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const promisedDate = dto.promisedDate ? new Date(dto.promisedDate) : null;

    const activity = await this.prisma.collectionActivity.create({
      data: {
        businessId,
        customerId: customer.id,
        receivableId: dto.receivableId || null,
        type: (dto.type as CollectionActivityType) || CollectionActivityType.PHONE_CALL,
        outcome: dto.outcome as CollectionOutcome,
        notes: dto.notes,
        promisedDate,
        promisedAmount: dto.promisedAmount ?? null,
        nextFollowUpDate: promisedDate,
        createdById: userId,
      },
      include: {
        customer: true,
        receivable: true,
        createdBy: true,
      },
    });

    if (promisedDate) {
      await this.prisma.followUpTask.create({
        data: {
          businessId,
          customerId: customer.id,
          receivableId: dto.receivableId || null,
          dueDate: promisedDate,
          status: FollowUpStatus.PENDING,
          assignedToId: userId,
        },
      });
    }

    await this.prisma.auditEvent.create({
      data: {
        businessId,
        actorUserId: userId,
        action: 'COLLECTION_ACTIVITY_LOGGED',
        entityType: 'CollectionActivity',
        entityId: activity.id,
        afterData: {
          customerName: customer.name,
          type: activity.type,
          outcome: activity.outcome,
          promisedDate: activity.promisedDate,
        },
        reason: 'Collection activity recorded',
      },
    });

    return activity;
  }
}
