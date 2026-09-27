// ==============================================================================
// Domain Roles & Permissions
// ==============================================================================

export enum UserRole {
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  MANAGER = 'MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  READ_ONLY_ADMIN = 'READ_ONLY_ADMIN',
}

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  SUSPENDED = 'SUSPENDED',
}

// ==============================================================================
// Customers
// ==============================================================================

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface CustomerSnapshot {
  name: string;
  phone: string;
  customerCode?: string;
  address?: string;
  snapshotAt: string;
}

// ==============================================================================
// Receivables & Financial States
// ==============================================================================

export enum ReceivableStatus {
  DRAFT = 'DRAFT',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  ACTIVE = 'ACTIVE',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  WRITTEN_OFF = 'WRITTEN_OFF',
}

export enum ReceivableSourceType {
  MANUAL = 'MANUAL',
  DELIVERY = 'DELIVERY',
  INVOICE = 'INVOICE',
  SALES_ORDER = 'SALES_ORDER',
  IMPORT = 'IMPORT',
  API = 'API',
  INTEGRATION = 'INTEGRATION',
  OTHER = 'OTHER',
}

export interface PaymentTermsSnapshot {
  code: string;
  name: string;
  days: number;
  description?: string;
}

export enum AdjustmentType {
  CREDIT = 'CREDIT', // Decreases what customer owes
  DEBIT = 'DEBIT', // Increases what customer owes
}

// ==============================================================================
// Payments & Credits
// ==============================================================================

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CHEQUE = 'CHEQUE',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  COMPLETED = 'COMPLETED',
  REVERSED = 'REVERSED',
}

// ==============================================================================
// Collections & Follow-ups
// ==============================================================================

export enum CollectionActivityType {
  PHONE_CALL = 'PHONE_CALL',
  IN_PERSON = 'IN_PERSON',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
  OTHER = 'OTHER',
}

export enum CollectionOutcome {
  NO_ANSWER = 'NO_ANSWER',
  PROMISED_TO_PAY = 'PROMISED_TO_PAY',
  PAYMENT_MADE = 'PAYMENT_MADE',
  DISPUTED = 'DISPUTED',
  WRONG_NUMBER = 'WRONG_NUMBER',
  CUSTOMER_UNAVAILABLE = 'CUSTOMER_UNAVAILABLE',
  REFUSED = 'REFUSED',
  FOLLOW_UP_LATER = 'FOLLOW_UP_LATER',
  OTHER = 'OTHER',
}

export enum FollowUpStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ==============================================================================
// Audit & System Logging
// ==============================================================================

export enum AuditAction {
  USER_INVITED = 'USER_INVITED',
  USER_JOINED = 'USER_JOINED',
  BUSINESS_CREATED = 'BUSINESS_CREATED',
  BUSINESS_UPDATED = 'BUSINESS_UPDATED',
  CUSTOMER_CREATED = 'CUSTOMER_CREATED',
  CUSTOMER_UPDATED = 'CUSTOMER_UPDATED',
  RECEIVABLE_CREATED = 'RECEIVABLE_CREATED',
  RECEIVABLE_ACTIVATED = 'RECEIVABLE_ACTIVATED',
  RECEIVABLE_ADJUSTED = 'RECEIVABLE_ADJUSTED',
  RECEIVABLE_CANCELLED = 'RECEIVABLE_CANCELLED',
  RECEIVABLE_WRITTEN_OFF = 'RECEIVABLE_WRITTEN_OFF',
  PAYMENT_RECORDED = 'PAYMENT_RECORDED',
  PAYMENT_ALLOCATED = 'PAYMENT_ALLOCATED',
  PAYMENT_REVERSED = 'PAYMENT_REVERSED',
  COLLECTION_ACTIVITY_LOGGED = 'COLLECTION_ACTIVITY_LOGGED',
  FOLLOW_UP_CREATED = 'FOLLOW_UP_CREATED',
  EXPORT_GENERATED = 'EXPORT_GENERATED',
}

// ==============================================================================
// Common API Contracts
// ==============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  requestId?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

// ==============================================================================
// Aging & Reporting Models
// ==============================================================================

export interface AgingBucket {
  range: 'current' | '1-30' | '31-60' | '61-90' | '91+';
  label: string;
  amount: number;
  count: number;
}

export interface ARAgingSummary {
  businessId: string;
  asOfDate: string;
  currency: string;
  totalReceivables: number;
  totalOutstanding: number;
  totalOverdue: number;
  buckets: AgingBucket[];
}
