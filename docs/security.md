# Receivables Platform - Security Architecture

## 1. Multi-Tenant Isolation

- Every business-scoped resource contains a `business_id`.
- Tenant membership and permissions are validated server-side on every request.
- Frontend visibility toggles are cosmetic; backend guards enforce tenant boundaries.

## 2. Authentication & Credentials

- **Identity**: Phone-only authentication (+250 E.164 normalized format) as primary credential.
- **Hashing**: Argon2id for password verification. Passwords are never stored in plaintext.
- **Invitations**: Single-use, cryptographically random invitation tokens stored as hashes with 72-hour TTL.
- **Redaction**: Structured logger automatically redacts passwords, tokens, cookies, and authorization headers.

## 3. Financial Integrity & Audit

- Every financial mutation (creation, activation, adjustment, payment, allocation, reversal) creates an immutable `AuditEvent`.
- Correlation ID (`X-Request-ID`) links technical request logs to business audit events.
