# Receivables

A multi-tenant customer accounts-receivable (A/R) and collections management platform built for businesses that sell on credit.

## Overview

The system helps businesses know:

- **Who owes them money**: Complete customer balance and overdue visibility.
- **Why they owe it**: Full receivable provenance and activation triggers (deliveries, orders, invoices).
- **When they should pay**: Payment terms, due dates, and automated A/R aging buckets.
- **What they have paid**: Partial payment allocations and customer credit reconciliation.
- **What actions happened**: Complete collection logs, follow-up scheduling, and promise tracking.
- **Immutable financial integrity**: Preserves historical transaction snapshots and strict multi-tenant isolation.

## Architecture

This project is organized as a Turborepo monorepo managed with `pnpm`:

```text
receivables/
├── apps/
│   ├── api/       # NestJS modular monolith API with Prisma & PostgreSQL
│   ├── web/       # Business user web application (React, Vite, Tailwind, shadcn/ui)
│   └── admin/     # System administration portal (React, Vite, Tailwind, shadcn/ui)
├── packages/
│   ├── ui/        # Shared shadcn/ui design system primitives
│   ├── types/     # Shared safe TypeScript domain types & API contracts
│   ├── config/    # Shared constants, currency rules, and aging configurations
│   ├── shared/    # Financial precision utilities & decimal calculations
│   ├── tsconfig/  # Shared TypeScript configuration presets
│   └── eslint-config/ # Shared linting rules
├── infra/
│   └── docker/    # Production and local container assets
├── docs/          # Architecture documentation and ADRs
└── .github/
    └── workflows/ # CI & GHCR automated deployment workflows
```

## Technology Stack

- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL 16, Redis 7, BullMQ, Argon2id, Pino Structured Logging, Swagger/OpenAPI.
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, TanStack Table, React Hook Form, Zod, Sonner.
- **Infrastructure**: Docker & Docker Compose, GitHub Actions, GitHub Container Registry (GHCR), MinIO (S3-compatible storage).

## Getting Started

### 1. Prerequisites

- Node.js >= 20
- pnpm >= 10
- Docker & Docker Compose

### 2. Installation

```bash
pnpm install
```

### 3. Start Local Infrastructure

Run PostgreSQL, Redis, and MinIO locally:

```bash
pnpm docker:up
```

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
pnpm --filter @receivables/api prisma:generate
```

### 5. Start Development Servers

Run the full platform concurrently:

```bash
pnpm dev
```

- **Business Web App**: [http://localhost:3000](http://localhost:3000)
- **Admin Portal**: [http://localhost:3001](http://localhost:3001)
- **API Service**: [http://localhost:4000](http://localhost:4000)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Health Endpoint**: [http://localhost:4000/health](http://localhost:4000/health)
- **MinIO S3 Console**: [http://localhost:9001](http://localhost:9001)

## Quality & Verification Commands

```bash
# Type check all workspaces
pnpm type-check

# Lint all code
pnpm lint

# Format code
pnpm format

# Build all packages and applications
pnpm build
```

## License

Private & Confidential - All Rights Reserved.
