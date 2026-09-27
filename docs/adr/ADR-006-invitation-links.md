# ADR 006: Secure Invitation Links for User Onboarding

## Status

Accepted

## Context

When business owners invite accountants or managers, displaying plaintext temporary passwords is prone to leakage (e.g. over unencrypted chat apps).

## Decision

Generate cryptographically secure, single-use invitation tokens with a 72-hour TTL stored hashed in the database. The invitee follows the secure link to set their own password and activate their membership.
