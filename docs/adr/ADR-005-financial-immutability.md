# ADR 005: Financial Immutability and Transaction History

## Status

Accepted

## Context

Financial records require an audit trail. Changing master data (such as a customer's company name) must never silently mutate past invoices, receivables, or statements.

## Decision

1. Never perform in-place mutations on active financial records (e.g. `UPDATE receivable SET amount = ...`).
2. Require explicit transaction records for modifications (`ReceivableAdjustment`, `PaymentAllocation`, `PaymentReversal`).
3. Store immutable snapshots (`customerSnapshot`, `paymentTermsSnapshot`) at transaction time.
