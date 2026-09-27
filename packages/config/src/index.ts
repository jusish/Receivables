export const APP_CONFIG = {
  name: 'Receivables',
  description: 'Customer Accounts Receivable and Collections Management System',
  version: '0.1.0',
} as const;

export const DEFAULT_BUSINESS_SETTINGS = {
  currency: 'RWF',
  timezone: 'Africa/Kigali',
  locale: 'en-RW',
  invoicePrefix: 'REC-',
  paymentPrefix: 'PAY-',
  customerPrefix: 'CUS-',
  adjustmentPrefix: 'ADJ-',
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const AGING_BUCKETS = [
  { range: 'current', label: 'Current (Not Due)', minDays: -999999, maxDays: 0 },
  { range: '1-30', label: '1 - 30 Days Overdue', minDays: 1, maxDays: 30 },
  { range: '31-60', label: '31 - 60 Days Overdue', minDays: 31, maxDays: 60 },
  { range: '61-90', label: '61 - 90 Days Overdue', minDays: 61, maxDays: 90 },
  { range: '91+', label: '91+ Days Overdue', minDays: 91, maxDays: 999999 },
] as const;

export const SUPPORTED_CURRENCIES = [
  { code: 'RWF', symbol: 'RWF', decimals: 0, name: 'Rwandan Franc' },
  { code: 'USD', symbol: '$', decimals: 2, name: 'US Dollar' },
  { code: 'KES', symbol: 'KSh', decimals: 2, name: 'Kenyan Shilling' },
  { code: 'UGX', symbol: 'USh', decimals: 0, name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', decimals: 0, name: 'Tanzanian Shilling' },
] as const;
