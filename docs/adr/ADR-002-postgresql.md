# ADR 002: PostgreSQL for Primary Financial Datastore

## Status

Accepted

## Context

Accounts receivable systems require relational modeling, ACID guarantees, decimal precision (`NUMERIC(19, 4)`), complex filtering (A/R aging buckets), and foreign key integrity.

## Decision

Use PostgreSQL 16 as the primary persistent datastore.
