# ADR 001: Modular Monolith Architecture

## Status

Accepted

## Context

Receivables management requires strict financial consistency across customer records, receivables, payment allocations, credit adjustments, and audit logging. Premature microservices introduce distributed transaction hazards (e.g. two-phase commits, saga complexity, eventual consistency delays) that compromise financial correctness.

## Decision

Build the backend as a NestJS modular monolith within a Turborepo monorepo.

## Consequences

- ACID transactions are guaranteed at database boundaries.
- Simplified operational model and local development via Docker Compose.
- Modules retain clear domain boundaries and can be split later if scaling necessitates it.
