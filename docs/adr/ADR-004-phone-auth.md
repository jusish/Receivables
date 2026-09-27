# ADR 004: Phone-First Authentication

## Status

Accepted

## Context

Target business users in the region operate primarily with phone numbers rather than enterprise email addresses.

## Decision

Implement phone number + password as the primary authentication mechanism with Argon2id hashing. Email is not required in V1.
