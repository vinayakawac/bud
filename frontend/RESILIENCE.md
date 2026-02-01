# Resilience & Hardening Architecture

This document details the defensive engineering patterns implemented in O-Hub to ensure system reliability, security, and graceful failure handling.

## Table of Contents

1. [Data & State Resilience](#data--state-resilience)
2. [Authentication & Authorization](#authentication--authorization)
3. [Error Handling & Recovery](#error-handling--recovery)
4. [Concurrency Protection](#concurrency-protection)
5. [Rate Limiting](#rate-limiting)
6. [Soft Delete & Data Safety](#soft-delete--data-safety)
7. [API Contracts](#api-contracts)
8. [Observability](#observability)

---

## Data & State Resilience

### Input Validation

All API inputs are validated at the boundary before processing:

```typescript
import { schemas, validateSchema } from '@/lib/server/validation';

// Example: Validating project creation
const validation = validateSchema(schemas.createProject, body);
if (!validation.valid) {
  return validationError(validation.errors);
}
```

**Validation Rules:**
- String lengths enforced (min/max)
- Email format validation
- URL format validation
- UUID format validation
- Array bounds checking
- Enum value enforcement

### Sanitization

All user inputs are sanitized to prevent injection attacks:

```typescript
import { sanitizeString, ensureArray } from '@/lib/server/validation';

const safeTitle = sanitizeString(body.title);
const safeTags = ensureArray(body.tags);
```

**Sanitization Applied:**
- HTML entity encoding
- Trim whitespace
- Null byte removal
- Array normalization (always returns array)
- Safe JSON parsing with fallbacks

---

## Authentication & Authorization

### RBAC (Role-Based Access Control)

Centralized permission system with explicit role hierarchy:

```
VISITOR → CREATOR → ADMIN → SUPER_ADMIN
```

**Key Principles:**
- **Fail-Closed:** Unknown routes require authentication by default
- **Explicit Permissions:** Every action maps to a specific permission
- **Ownership Checks:** Creators can only modify their own resources

```typescript
import { requireRole, requireOwnershipOrAdmin, Role } from '@/lib/server/rbac';

// Role check
const auth = await requireRole(request, Role.CREATOR);
if (!auth.authorized) {
  return forbidden(auth.message);
}

// Ownership check
const canEdit = await requireOwnershipOrAdmin(
  request, 
  'project', 
  projectId
);
```

### Auth Flow Security

- JWT tokens with 7-day expiration
- HTTP-only cookies (XSS protection)
- Bcrypt password hashing (cost factor 12)
- Progressive lockout on failed attempts
- Session invalidation on password change

---

## Error Handling & Recovery

### Error Boundaries

React error boundaries prevent cascading failures:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary level="section">
  <ProjectGrid />
</ErrorBoundary>
```

**Levels:**
- `page` - Full page fallback with home navigation
- `section` - Section-specific retry UI
- `component` - Inline error indicator

### Graceful Degradation

| Failure | Behavior |
|---------|----------|
| Database connection lost | Show cached data, queue writes |
| External API timeout | Return partial data, show warning |
| Image load failure | Display placeholder |
| JavaScript error | Error boundary catches, shows fallback |

### HTTP Error Responses

Standardized error response format:

```json
{
  "success": false,
  "error": "Resource not found",
  "code": "NOT_FOUND",
  "details": {
    "resource": "project",
    "id": "abc123"
  }
}
```

---

## Concurrency Protection

### Optimistic Locking

Prevent lost updates with version checking:

```typescript
import { checkVersion } from '@/lib/server/concurrency';

const versionCheck = await checkVersion('project', id, request.headers['if-match']);
if (!versionCheck.valid) {
  return conflict('Resource was modified by another request');
}
```

### Idempotency Keys

Safe retries for write operations:

```typescript
import { checkIdempotency, completeIdempotentRequest } from '@/lib/server/concurrency';

const idempotencyKey = request.headers['idempotency-key'];
const cached = checkIdempotency(idempotencyKey);

if (cached.cached) {
  return cached.status === 'pending' 
    ? conflict('Request in progress')
    : success(cached.data);
}

// Process request...
completeIdempotentRequest(idempotencyKey, result, true);
```

### Distributed Locks

Exclusive access for critical operations:

```typescript
import { withLock } from '@/lib/server/concurrency';

const result = await withLock(
  `project:${id}:publish`,
  userId,
  30000, // 30s timeout
  async () => publishProject(id)
);
```

---

## Rate Limiting

### Endpoint Categories

| Category | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Public Read | 100 requests | 1 minute |
| Write Operations | 30 requests | 1 minute |
| Form Submissions | 3 requests | 1 hour |
| File Uploads | 10 requests | 1 hour |

### Implementation

```typescript
import { withRateLimit, rateLimitConfigs } from '@/lib/server/rateLimit';

export async function POST(request: Request) {
  const rateLimitResult = await withRateLimit(
    request, 
    rateLimitConfigs.write,
    async () => createProject(body)
  );
  
  if (!rateLimitResult.allowed) {
    return rateLimited(rateLimitResult.retryAfter);
  }
  
  return success(rateLimitResult.result);
}
```

### Progressive Backoff

Failed authentication attempts trigger exponential lockout:

| Failures | Lockout Duration |
|----------|------------------|
| 3 | 1 minute |
| 5 | 5 minutes |
| 7 | 15 minutes |
| 10+ | 1 hour |

---

## Soft Delete & Data Safety

### Soft Delete Pattern

No data is permanently deleted immediately:

```typescript
import { softDelete, restore } from '@/lib/server/softDelete';

// Soft delete
await softDelete('project', projectId, userId);

// Restore within retention period
await restore('project', projectId, userId);
```

**Retention Policy:**
- Soft-deleted records retained for 30 days
- Hard delete requires prior soft delete
- Cascade soft delete for related entities

### Deletion Confirmation

Destructive operations require confirmation tokens:

```typescript
import { 
  generateDeleteConfirmation, 
  validateDeleteConfirmation 
} from '@/lib/server/softDelete';

// Step 1: Generate token
const token = generateDeleteConfirmation('project', projectId, userId);

// Step 2: User confirms, validate token
const confirmation = validateDeleteConfirmation(token, userId);
if (!confirmation.valid) {
  return badRequest(confirmation.error);
}

// Step 3: Execute deletion
await softDelete(confirmation.table, confirmation.entityId, userId);
```

---

## API Contracts

### Request Validation

All API endpoints validate:
- Content-Type header
- Required fields
- Field types and formats
- Array bounds
- Unknown field rejection (when strict mode enabled)

### Response Structure

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## Observability

### Audit Logging

All significant actions are logged:

```typescript
import { auditService, AuditAction } from '@/lib/server/audit';

await auditService.log({
  action: AuditAction.PROJECT_CREATED,
  actorId: userId,
  actorType: 'creator',
  entityType: 'project',
  entityId: projectId,
  metadata: { title, category },
});
```

**Logged Events:**
- Authentication (success/failure)
- Resource creation/modification/deletion
- Permission changes
- Admin actions
- Rate limit violations

### Structured Logging

Console logs follow structured format:

```
[2024-01-15T10:30:00.000Z] [ERROR] [ProjectService] Failed to create project
  userId=abc123
  error="Unique constraint violation"
  stack=...
```

### Health Checks

`GET /api/health` returns system status:

```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 86400,
  "version": "1.0.0"
}
```

---

## Security Headers

Applied via Next.js middleware:

```typescript
// Security headers
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Failure Scenarios

### Scenario: Database Unavailable

1. Connection pool exhausted / DB down
2. Queries fail with timeout
3. API returns 503 with `retry-after` header
4. Health check reports unhealthy
5. Frontend shows cached data where available

### Scenario: Memory Pressure

1. Rate limit stores grow
2. Cleanup intervals remove expired entries
3. If memory critical, oldest entries evicted
4. New requests may be rejected with 503

### Scenario: Malicious Actor

1. Rapid requests trigger rate limiting
2. Failed auth triggers progressive lockout
3. Invalid inputs rejected at validation layer
4. Actions logged to audit trail
5. Admin alerted via observability system

---

## Testing Resilience

```bash
# Run unit tests
npm run test

# Test specific resilience patterns
npm run test -- --grep "rate limit"
npm run test -- --grep "validation"
npm run test -- --grep "rbac"

# Load testing (requires k6)
k6 run load-tests/rate-limit.js
```

---

## Configuration

Environment variables for tuning:

```env
# Rate Limiting
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_AUTH_WINDOW=900000

# Session
JWT_EXPIRY=7d
SESSION_COOKIE_SECURE=true

# Soft Delete
SOFT_DELETE_RETENTION_DAYS=30

# Logging
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true
```
