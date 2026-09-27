# Receivables Platform - Development Guide

## Prerequisites

- Node.js >= 20.x
- pnpm >= 9.x (recommended 10.x)
- Docker & Docker Compose

## Local Quick Start

1. **Install Dependencies**:

   ```bash
   pnpm install
   ```

2. **Start Infrastructure (PostgreSQL, Redis, MinIO)**:

   ```bash
   pnpm docker:up
   ```

3. **Prisma Setup**:

   ```bash
   pnpm --filter @receivables/api prisma:generate
   ```

4. **Run Development Services**:
   ```bash
   pnpm dev
   ```

- Web App: `http://localhost:3000`
- Admin App: `http://localhost:3001`
- NestJS API: `http://localhost:4000`
- API Swagger Docs: `http://localhost:4000/api/docs`
- MinIO Console: `http://localhost:9001`
