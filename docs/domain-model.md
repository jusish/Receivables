# Receivables Platform - Domain Model

## Core Financial Principle

1. **Terminology**: Use **Receivable** / **Accounts Receivable (A/R)** throughout the platform. Do not use "Debt".
2. **Immutability of Financial History**: Financial amounts and historical transaction context are never silently mutated.
   - Adjustments must be recorded as explicit transactions (`CREDIT` or `DEBIT`).
   - Customer and payment terms data at transaction time are captured in immutable snapshots (`customerSnapshot`, `paymentTermsSnapshot`).
   - A cancelled receivable is never deleted from the database; it transitions to `CANCELLED` with a mandatory reason and audit entry.
   - A payment cannot be deleted; errors are handled via `REVERSED` status and offsetting entries.

## Core Financial Calculation

```text
outstanding_balance = original_amount + debit_adjustments - credit_adjustments - allocated_payments
```

## Receivable Lifecycle

```text
DRAFT
  │
  ▼
PENDING_ACTIVATION
  │
  ▼ (Activation Event: delivery, invoice, manual)
ACTIVE
  │
  ├── (Partial Payment) ──► PARTIALLY_PAID
  │                              │
  │                              ▼
  └── (Full Payment) ──────────► PAID
```

_Note: Overdue is a derived condition (`outstanding_balance > 0 AND now() > due_date`)._
