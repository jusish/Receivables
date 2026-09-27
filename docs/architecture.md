# Receivables Platform - System Architecture

## Overview

Receivables is a multi-tenant customer accounts-receivable and collections management system. It provides businesses with accurate tracking of who owes them money, transaction justification, payment terms, collections follow-ups, payment allocations, and historical integrity.

## High-Level Topology

```
                      +-------------------+
                      |   Business Web    |
                      |      (Vite)       |
                      +---------+---------+
                                |
                          HTTPS / JSON
                                |
                      +---------v---------+
                      |    NestJS API     |
                      | (Modular Monolith)|
                      +----+---------+----+
                           |         |
             +-------------+         +-------------+
             |                                     |
       +-----v-----+                         +-----v-----+
       |PostgreSQL |                         |   Redis   |
       | (Prisma)  |                         |  (BullMQ) |
       +-----------+                         +-----------+
             |
       +-----v-----+
       |   MinIO   |
       | (S3 Docs) |
       +-----------+
```

## Modular Monolith Structure

The backend is built as a modular monolith in NestJS. This design preserves database transaction boundaries (ACID) across receivables, payments, allocations, adjustments, and audits while maintaining strict domain separation:

- **Auth**: Phone-based authentication with Argon2id and JWT sessions.
- **Tenancy**: Business isolation and membership role-based access control.
- **Customers**: Business-scoped customer records, credit limits, and historical snapshots.
- **Receivables**: Drafts, activation rules, due-date calculation, and adjustments.
- **Payments**: Payment recording, partial allocations, overpayment credits, and reversals.
- **Collections**: Activity logging, promised payment tracking, and follow-up scheduling.
- **Reporting & PDF**: Centralized document generation and A/R aging calculation.
- **Audit & Observability**: Immutable business audit logs, structured Pino request logs, and health probes.
