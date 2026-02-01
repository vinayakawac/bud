# Production Hardening Setup Guide

This document explains the enterprise-grade features added to O-Hub and how to complete the setup.

## What Was Added

### Phase A — Architectural Hardening

#### 1. Role-Based Access Control (RBAC)
**File:** `src/lib/server/rbac.ts`

- Explicit `Role` enum: `VISITOR`, `CREATOR`, `ADMIN`, `SUPER_ADMIN`
- Explicit `Permission` enum with granular permissions
- Permission mapping per role
- Route guards: `requireRole()`, `requirePermission()`, `requireOwnershipOrAdmin()`

**Usage Example:**
```typescript
import { requireRole, Role, Permission, requirePermission } from '@/lib/server/rbac';

// Require specific role
export const DELETE = requireRole(Role.ADMIN)(async (request, authContext, params) => {
  // Only admins can reach here
});

// Require specific permission
export const PUT = requirePermission(Permission.PROJECT_UPDATE)(async (request, authContext) => {
  // Only users with PROJECT_UPDATE permission can reach here
});
```

#### 2. Enterprise Audit Logging
**Files:** 
- `src/lib/server/audit.ts` - Service
- `prisma/schema.prisma` - AuditLog model
- `prisma/migrations/20260201120000_add_audit_logs/` - Migration
- `src/app/api/admin/audit/route.ts` - Admin API endpoint

**Logged Events:**
- Authentication (login success/failure, logout)
- Project lifecycle (create, update, delete, publish)
- Creator management (register, update, deactivate)
- Security events (permission denied, rate limit exceeded)

**Usage Example:**
```typescript
import { auditService, AuditAction, EntityType, ActorType } from '@/lib/server/audit';

await auditService.log({
  actorId: user.id,
  actorType: ActorType.CREATOR,
  actorEmail: user.email,
  action: AuditAction.PROJECT_CREATED,
  entityType: EntityType.PROJECT,
  entityId: project.id,
  metadata: { title: project.title },
  ipAddress,
  userAgent,
});
```

### Phase B — Operational Credibility

#### 3. Failure States
**Files:**
- `src/app/not-found.tsx` - Custom 404 page
- `src/app/forbidden.tsx` - Custom 403 page (reusable)
- `src/app/error.tsx` - Custom 500 page with retry
- `src/components/ui/EmptyState.tsx` - Reusable empty states

**Available Empty States:**
- `NoProjectsEmpty` - For project listings
- `NoSearchResultsEmpty` - For search with no results
- `NoCommentsEmpty` - For comment sections
- `NoRatingsEmpty` - For rating sections
- `NoCreatorsEmpty` - For creator listings
- `LoadingState` - For loading indicators

#### 4. Enhanced API Responses
**File:** `src/lib/server/response.ts`

- `forbidden()` - 403 responses
- `rateLimited()` - 429 responses
- `parsePaginationParams()` - Standardized pagination parsing
- `paginatedSuccess()` - Paginated response formatter

### Phase C — Documentation

#### 5. System Design README
**File:** `README.md`

- Architecture diagram (ASCII)
- Authentication flow diagram
- Data model (ERD)
- Technology decisions with rationale
- "What I'd Do With More Time" section

### Phase D — Demo & Testing

#### 6. Demo Accounts & Seed Data
**File:** `prisma/seed.ts`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.ohub.com | Demo@Admin123 |
| Creator | creator@demo.ohub.com | Demo@Creator123 |

**Seed includes:**
- 5 demo projects (4 public, 1 draft)
- Sample ratings and comments
- Contact information

#### 7. Unit Tests
**Files:**
- `src/__tests__/rbac.test.ts` - RBAC permission tests
- `src/__tests__/ownership.test.ts` - Project ownership tests
- `src/__tests__/audit.test.ts` - Audit log type tests

---

## Setup Instructions

### 1. Install New Dependencies

```bash
cd frontend
npm install vitest --save-dev
```

### 2. Apply Database Migration

```bash
npx prisma migrate dev --name add_audit_logs
```

Or if the migration already exists:
```bash
npx prisma migrate deploy
```

### 3. Regenerate Prisma Client

```bash
npx prisma generate
```

### 4. Seed Demo Data

```bash
npm run db:seed
```

### 5. Run Tests

```bash
npm test           # Run once
npm run test:watch # Watch mode
```

---

## Files Changed/Added

### New Files
- `src/lib/server/rbac.ts` - RBAC system
- `src/lib/server/audit.ts` - Audit logging
- `src/app/not-found.tsx` - 404 page
- `src/app/forbidden.tsx` - 403 page
- `src/app/error.tsx` - 500 page
- `src/components/ui/EmptyState.tsx` - Empty states
- `src/app/api/admin/audit/route.ts` - Audit API
- `src/__tests__/rbac.test.ts` - RBAC tests
- `src/__tests__/ownership.test.ts` - Ownership tests
- `src/__tests__/audit.test.ts` - Audit tests
- `vitest.config.ts` - Test configuration
- `prisma/migrations/20260201120000_add_audit_logs/migration.sql`

### Modified Files
- `README.md` - Complete rewrite with system design
- `prisma/schema.prisma` - Added AuditLog model
- `prisma/seed.ts` - Demo accounts and projects
- `package.json` - Test scripts, vitest dependency
- `src/lib/server/response.ts` - Added pagination helpers
- `src/app/api/admin/projects/[id]/handlers/index.ts` - Audit integration example

---

## Interview Talking Points

### "Why RBAC instead of simple role checks?"
"I chose an explicit RBAC system with permissions because it separates the concept of *who you are* from *what you can do*. This makes it trivial to add new roles or modify permissions without changing route handlers. It's also self-documenting — anyone reading the code knows exactly what permissions each role has."

### "Why audit logging?"
"Audit logs are table stakes for any production system. They help with debugging issues, security investigations, and compliance requirements. I designed it to never block the main flow — even if logging fails, the user operation succeeds."

### "Why domain services over fat controllers?"
"By putting business logic in domain services, I keep HTTP concerns out of business logic. This makes testing easier, logic reusable, and the codebase more maintainable as it grows."

### "Why JWT over sessions?"
"For a portfolio platform, JWT's simplicity outweighs its drawbacks. I don't need instant revocation (7-day expiry is acceptable), and stateless auth means simpler infrastructure without a session store."

---

## Next Steps (If Time Permits)

1. **Add Redis** for rate limiting and caching
2. **Add Playwright E2E tests** for critical user flows
3. **Implement WebSocket** for real-time collaboration
4. **Add GitHub Actions** CI/CD pipeline
5. **Set up Sentry** for error monitoring
