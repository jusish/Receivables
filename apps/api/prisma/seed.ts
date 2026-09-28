import { PrismaClient, UserRole, AdminRole, BusinessStatus, CustomerStatus, ReceivableStatus, ReceivableSourceType, AdjustmentType, PaymentMethod, PaymentStatus, CollectionActivityType, CollectionOutcome, FollowUpStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Receivables platform database...');

  // 1. Password hash
  const defaultPassword = await argon2.hash('Password123!');

  // 2. Platform Users
  const justin = await prisma.user.upsert({
    where: { phone: '+250788123456' },
    update: {},
    create: {
      phone: '+250788123456',
      passwordHash: defaultPassword,
      fullName: 'Justin Ishimwe',
      adminRole: AdminRole.SUPER_ADMIN,
    },
  });

  const alice = await prisma.user.upsert({
    where: { phone: '+250788654321' },
    update: {},
    create: {
      phone: '+250788654321',
      passwordHash: defaultPassword,
      fullName: 'Alice Uwase',
    },
  });

  const david = await prisma.user.upsert({
    where: { phone: '+250788777888' },
    update: {},
    create: {
      phone: '+250788777888',
      passwordHash: defaultPassword,
      fullName: 'David Mugabe',
    },
  });

  console.log('Created users: Justin (Owner), Alice (Accountant), David (Manager)');

  // 3. Businesses
  const businessKtc = await prisma.business.upsert({
    where: { code: 'BIZ-KTC' },
    update: {},
    create: {
      code: 'BIZ-KTC',
      name: 'Kigali Trading Co.',
      currency: 'RWF',
      timezone: 'Africa/Kigali',
      locale: 'en-RW',
      status: BusinessStatus.ACTIVE,
    },
  });

  const businessInz = await prisma.business.upsert({
    where: { code: 'BIZ-INZ' },
    update: {},
    create: {
      code: 'BIZ-INZ',
      name: 'Inzovu Supplies Ltd',
      currency: 'RWF',
      timezone: 'Africa/Kigali',
      locale: 'en-RW',
      status: BusinessStatus.ACTIVE,
    },
  });

  // Memberships
  await prisma.businessMembership.upsert({
    where: { businessId_userId: { businessId: businessKtc.id, userId: justin.id } },
    update: {},
    create: { businessId: businessKtc.id, userId: justin.id, role: UserRole.BUSINESS_OWNER },
  });

  await prisma.businessMembership.upsert({
    where: { businessId_userId: { businessId: businessKtc.id, userId: alice.id } },
    update: {},
    create: { businessId: businessKtc.id, userId: alice.id, role: UserRole.ACCOUNTANT },
  });

  await prisma.businessMembership.upsert({
    where: { businessId_userId: { businessId: businessKtc.id, userId: david.id } },
    update: {},
    create: { businessId: businessKtc.id, userId: david.id, role: UserRole.MANAGER },
  });

  // 4. Payment Terms
  const net30 = await prisma.paymentTerm.upsert({
    where: { businessId_code: { businessId: businessKtc.id, code: 'NET_30' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      name: 'Net 30 Days',
      code: 'NET_30',
      days: 30,
      description: 'Payment due within 30 calendar days from activation',
      isDefault: true,
    },
  });

  await prisma.paymentTerm.upsert({
    where: { businessId_code: { businessId: businessKtc.id, code: 'NET_15' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      name: 'Net 15 Days',
      code: 'NET_15',
      days: 15,
      description: 'Payment due within 15 calendar days from activation',
      isDefault: false,
    },
  });

  // 5. Customers
  const customerJohn = await prisma.customer.upsert({
    where: { businessId_customerCode: { businessId: businessKtc.id, customerCode: 'CUS-000128' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerCode: 'CUS-000128',
      name: 'John Doe Ltd',
      phone: '+250788111222',
      address: 'Kigali, Nyarugenge Commercial District',
      creditLimit: 2000000,
      status: CustomerStatus.ACTIVE,
    },
  });

  const customerKigali = await prisma.customer.upsert({
    where: { businessId_customerCode: { businessId: businessKtc.id, customerCode: 'CUS-000129' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerCode: 'CUS-000129',
      name: 'Kigali Supermarket Ltd',
      phone: '+250788333444',
      address: 'Kigali, Gasabo KG 9 Ave',
      creditLimit: 5000000,
      status: CustomerStatus.ACTIVE,
    },
  });

  const customerInzovu = await prisma.customer.upsert({
    where: { businessId_customerCode: { businessId: businessKtc.id, customerCode: 'CUS-000130' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerCode: 'CUS-000130',
      name: 'Inzovu Hardware Supplies',
      phone: '+250788555666',
      address: 'Kigali, Kicukiro Industrial Park',
      creditLimit: 1000000,
      status: CustomerStatus.ACTIVE,
    },
  });

  const customerNyarugenge = await prisma.customer.upsert({
    where: { businessId_customerCode: { businessId: businessKtc.id, customerCode: 'CUS-000131' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerCode: 'CUS-000131',
      name: 'Nyarugenge Wholesalers',
      phone: '+250788999000',
      address: 'Kigali, Nyarugenge Market Lane 3',
      creditLimit: 3500000,
      status: CustomerStatus.ACTIVE,
    },
  });

  console.log('Created business customers: John Doe Ltd, Kigali Supermarket, Inzovu Hardware, Nyarugenge Wholesalers');

  // 6. Receivables across all lifecycle states
  // REC-000184: Active, partially paid, OVERDUE by 12 days
  const dueDateOverdue = new Date();
  dueDateOverdue.setDate(dueDateOverdue.getDate() - 12);
  const activatedDate = new Date();
  activatedDate.setDate(activatedDate.getDate() - 42);

  const rec184 = await prisma.receivable.upsert({
    where: { businessId_referenceNumber: { businessId: businessKtc.id, referenceNumber: 'REC-000184' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerId: customerJohn.id,
      referenceNumber: 'REC-000184',
      status: ReceivableStatus.ACTIVE,
      currency: 'RWF',
      originalAmount: 750000,
      adjustedAmount: 0,
      paidAmount: 350000,
      outstandingBalance: 400000,
      activatedAt: activatedDate,
      dueDate: dueDateOverdue,
      sourceType: ReceivableSourceType.DELIVERY,
      sourceReference: 'DEL-2026-089',
      paymentTermsSnapshot: {
        code: 'NET_30',
        name: 'Net 30 Days',
        days: 30,
      },
      customerSnapshot: {
        name: 'John Doe',
        phone: '+250788111222',
        customerCode: 'CUS-000128',
        snapshotAt: activatedDate.toISOString(),
      },
      createdById: justin.id,
      items: {
        create: [
          {
            description: 'Portland Cement Grade 42.5 (50kg bags)',
            quantity: 15,
            unitPrice: 50000,
            totalAmount: 750000,
          },
        ],
      },
    },
  });

  // REC-000185: Fully PAID receivable
  const rec185 = await prisma.receivable.upsert({
    where: { businessId_referenceNumber: { businessId: businessKtc.id, referenceNumber: 'REC-000185' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerId: customerKigali.id,
      referenceNumber: 'REC-000185',
      status: ReceivableStatus.PAID,
      currency: 'RWF',
      originalAmount: 1200000,
      adjustedAmount: 0,
      paidAmount: 1200000,
      outstandingBalance: 0,
      activatedAt: new Date(Date.now() - 25 * 86400000),
      dueDate: new Date(Date.now() - 10 * 86400000),
      sourceType: ReceivableSourceType.INVOICE,
      sourceReference: 'INV-KTC-0044',
      paymentTermsSnapshot: { code: 'NET_15', name: 'Net 15 Days', days: 15 },
      customerSnapshot: { name: 'Kigali Supermarket Ltd', phone: '+250788333444' },
      createdById: david.id,
    },
  });

  // REC-000186: PENDING_ACTIVATION (Draft order before delivery)
  await prisma.receivable.upsert({
    where: { businessId_referenceNumber: { businessId: businessKtc.id, referenceNumber: 'REC-000186' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerId: customerInzovu.id,
      referenceNumber: 'REC-000186',
      status: ReceivableStatus.PENDING_ACTIVATION,
      currency: 'RWF',
      originalAmount: 500000,
      adjustedAmount: 0,
      paidAmount: 0,
      outstandingBalance: 500000,
      sourceType: ReceivableSourceType.SALES_ORDER,
      sourceReference: 'SO-9921',
      createdById: justin.id,
    },
  });

  // REC-000187: PARTIALLY_PAID with CREDIT adjustment
  const rec187 = await prisma.receivable.upsert({
    where: { businessId_referenceNumber: { businessId: businessKtc.id, referenceNumber: 'REC-000187' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerId: customerNyarugenge.id,
      referenceNumber: 'REC-000187',
      status: ReceivableStatus.PARTIALLY_PAID,
      currency: 'RWF',
      originalAmount: 2100000,
      adjustedAmount: -100000,
      paidAmount: 1000000,
      outstandingBalance: 1000000,
      activatedAt: new Date(Date.now() - 10 * 86400000),
      dueDate: new Date(Date.now() + 20 * 86400000),
      sourceType: ReceivableSourceType.DELIVERY,
      sourceReference: 'DEL-2026-104',
      createdById: alice.id,
    },
  });

  // REC-000188: CANCELLED receivable (preserved with reason)
  await prisma.receivable.upsert({
    where: { businessId_referenceNumber: { businessId: businessKtc.id, referenceNumber: 'REC-000188' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerId: customerJohn.id,
      referenceNumber: 'REC-000188',
      status: ReceivableStatus.CANCELLED,
      currency: 'RWF',
      originalAmount: 300000,
      adjustedAmount: 0,
      paidAmount: 0,
      outstandingBalance: 0,
      cancellationReason: 'Client cancelled order prior to warehouse dispatch',
      cancelledAt: new Date(),
      cancelledById: justin.id,
      createdById: justin.id,
    },
  });

  console.log('Created receivables in diverse lifecycle states: REC-000184, REC-000185, REC-000186, REC-000187, REC-000188');

  // 7. Adjustments
  await prisma.receivableAdjustment.create({
    data: {
      businessId: businessKtc.id,
      receivableId: rec187.id,
      type: AdjustmentType.CREDIT,
      amount: 100000,
      reason: '2 damaged packages returned upon physical delivery',
      createdById: alice.id,
      approvedById: justin.id,
    },
  });

  // 8. Payments & Allocations
  const pay101 = await prisma.payment.upsert({
    where: { businessId_referenceNumber: { businessId: businessKtc.id, referenceNumber: 'PAY-000101' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerId: customerJohn.id,
      referenceNumber: 'PAY-000101',
      amount: 350000,
      unallocatedAmount: 0,
      currency: 'RWF',
      paymentDate: new Date(Date.now() - 7 * 86400000),
      paymentMethod: PaymentMethod.MOBILE_MONEY,
      reference: 'MOMO-987123-RWF',
      status: PaymentStatus.COMPLETED,
      createdById: alice.id,
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      businessId: businessKtc.id,
      paymentId: pay101.id,
      receivableId: rec184.id,
      amount: 350000,
      createdById: alice.id,
    },
  });

  const pay102 = await prisma.payment.upsert({
    where: { businessId_referenceNumber: { businessId: businessKtc.id, referenceNumber: 'PAY-000102' } },
    update: {},
    create: {
      businessId: businessKtc.id,
      customerId: customerKigali.id,
      referenceNumber: 'PAY-000102',
      amount: 1200000,
      unallocatedAmount: 0,
      currency: 'RWF',
      paymentDate: new Date(Date.now() - 10 * 86400000),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      reference: 'BK-TRF-00192',
      status: PaymentStatus.COMPLETED,
      createdById: alice.id,
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      businessId: businessKtc.id,
      paymentId: pay102.id,
      receivableId: rec185.id,
      amount: 1200000,
      createdById: alice.id,
    },
  });

  // 9. Collection Activities
  const promisedPaymentDate = new Date();
  promisedPaymentDate.setDate(promisedPaymentDate.getDate() + 5);

  await prisma.collectionActivity.create({
    data: {
      businessId: businessKtc.id,
      customerId: customerJohn.id,
      receivableId: rec184.id,
      type: CollectionActivityType.PHONE_CALL,
      outcome: CollectionOutcome.PROMISED_TO_PAY,
      notes: 'Spoke with John. Confirmed bank transfer will be sent on Friday.',
      promisedDate: promisedPaymentDate,
      promisedAmount: 400000,
      nextFollowUpDate: promisedPaymentDate,
      createdById: alice.id,
    },
  });

  await prisma.followUpTask.create({
    data: {
      businessId: businessKtc.id,
      customerId: customerJohn.id,
      receivableId: rec184.id,
      dueDate: promisedPaymentDate,
      status: FollowUpStatus.PENDING,
      assignedToId: alice.id,
    },
  });

  // 10. Audit Trail
  await prisma.auditEvent.createMany({
    data: [
      {
        businessId: businessKtc.id,
        actorUserId: justin.id,
        actorRole: 'BUSINESS_OWNER',
        action: 'BUSINESS_CREATED',
        entityType: 'Business',
        entityId: businessKtc.id,
        afterData: { name: 'Kigali Trading Co.', code: 'BIZ-KTC' },
        reason: 'Initial business setup',
        requestId: 'req_init_001',
      },
      {
        businessId: businessKtc.id,
        actorUserId: justin.id,
        actorRole: 'BUSINESS_OWNER',
        action: 'RECEIVABLE_ACTIVATED',
        entityType: 'Receivable',
        entityId: rec184.id,
        afterData: { referenceNumber: 'REC-000184', originalAmount: 750000 },
        reason: 'Goods delivery receipt DEL-2026-089 acknowledged',
        requestId: 'req_rec_001',
      },
      {
        businessId: businessKtc.id,
        actorUserId: alice.id,
        actorRole: 'ACCOUNTANT',
        action: 'PAYMENT_ALLOCATED',
        entityType: 'PaymentAllocation',
        entityId: pay101.id,
        afterData: { amount: 350000, receivableRef: 'REC-000184' },
        reason: 'Mobile Money receipt confirmed',
        requestId: 'req_pay_001',
      },
      {
        businessId: businessKtc.id,
        actorUserId: alice.id,
        actorRole: 'ACCOUNTANT',
        action: 'RECEIVABLE_ADJUSTED',
        entityType: 'ReceivableAdjustment',
        entityId: rec187.id,
        afterData: { type: 'CREDIT', amount: 100000 },
        reason: '2 damaged packages returned during delivery',
        requestId: 'req_adj_001',
      },
    ],
  });

  // 11. API Request Logs for Admin
  await prisma.apiRequestLog.createMany({
    data: [
      {
        requestId: 'req_88291a2b',
        httpMethod: 'POST',
        route: '/api/v1/payments',
        businessId: businessKtc.id,
        userId: alice.id,
        ipAddress: '197.243.12.8',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        statusCode: 201,
        latencyMs: 182,
        requestSize: 1400,
        responseSize: 850,
      },
      {
        requestId: 'req_33104c9e',
        httpMethod: 'POST',
        route: '/api/v1/receivables',
        businessId: businessKtc.id,
        userId: justin.id,
        ipAddress: '197.243.12.8',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        statusCode: 201,
        latencyMs: 240,
        requestSize: 2100,
        responseSize: 1200,
      },
      {
        requestId: 'req_9921f001',
        httpMethod: 'GET',
        route: '/api/v1/reports/ar-aging',
        businessId: businessInz.id,
        userId: david.id,
        ipAddress: '105.178.44.19',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        statusCode: 200,
        latencyMs: 310,
        requestSize: 200,
        responseSize: 4500,
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
