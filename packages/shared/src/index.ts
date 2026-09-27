import { Decimal } from 'decimal.js';

// ==============================================================================
// Safe Financial Decimal Operations (Zero Floating-Point Error)
// ==============================================================================

export function toDecimal(value: string | number | Decimal): Decimal {
  return new Decimal(value);
}

export function addMoney(a: string | number | Decimal, b: string | number | Decimal): Decimal {
  return new Decimal(a).plus(new Decimal(b));
}

export function subtractMoney(a: string | number | Decimal, b: string | number | Decimal): Decimal {
  return new Decimal(a).minus(new Decimal(b));
}

export function multiplyMoney(
  a: string | number | Decimal,
  factor: string | number | Decimal,
): Decimal {
  return new Decimal(a).times(new Decimal(factor));
}

export function compareMoney(a: string | number | Decimal, b: string | number | Decimal): number {
  return new Decimal(a).comparedTo(new Decimal(b));
}

export function isZeroMoney(val: string | number | Decimal): boolean {
  return new Decimal(val).isZero();
}

export function isPositiveMoney(val: string | number | Decimal): boolean {
  return new Decimal(val).isPositive() && !new Decimal(val).isZero();
}

/**
 * Formats a monetary amount into a readable string with thousands separators.
 * e.g., 500000 -> "500,000 RWF"
 */
export function formatMoney(
  amount: string | number | Decimal,
  currency = 'RWF',
  decimals = 0,
): string {
  const dec = new Decimal(amount || 0);
  const formattedNumber = dec.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${formattedNumber} ${currency}`;
}

// ==============================================================================
// Date & Time Helpers
// ==============================================================================

export function calculateDueDate(activationDate: Date | string, days: number): Date {
  const date = new Date(activationDate);
  date.setDate(date.getDate() + days);
  return date;
}

export function getDaysOverdue(dueDate: Date | string, asOfDate: Date = new Date()): number {
  const due = new Date(dueDate);
  const asOf = new Date(asOfDate);
  const diffTime = asOf.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// ==============================================================================
// Reference Number Formatter
// ==============================================================================

export function generateReference(prefix: string, sequenceNumber: number, padLength = 6): string {
  const padded = String(sequenceNumber).padStart(padLength, '0');
  return `${prefix}${padded}`;
}

// ==============================================================================
// Phone Number Utilities (E.164 Clean / Format)
// ==============================================================================

export function normalizePhoneNumber(phone: string): string {
  // Remove non-digit characters except leading +
  const cleaned = phone.trim().replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('07') && cleaned.length === 10) {
    // Standard Rwandan local prefix 07... -> +2507...
    return `+250${cleaned.substring(1)}`;
  }
  if (!cleaned.startsWith('+') && cleaned.startsWith('250')) {
    return `+${cleaned}`;
  }
  return cleaned;
}
