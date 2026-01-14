# Project Restructuring Plan

## ⚠️ CRITICAL: This is a major refactoring
**Do NOT do this all at once. Follow phases carefully.**

---

## Current Issues
1. API logic scattered across `route.ts` + `handlers/`
2. Domain logic mixed with UI
3. Auth helpers in multiple places (`lib/server/auth.ts`, `lib/server/creatorAuth.ts`)
4. Response helpers duplicated (`lib/server/response.ts`, `lib/utils/response.ts`)
5. Hard to discover ownership (public vs creator vs admin)

---

## Target Architecture

### Domain-Driven Structure
```
src/
├── domain/              # Business logic (NO UI, NO HTTP)
│   ├── project/
│   │   ├── service.ts      # All project CRUD
│   │   ├── normalizers.ts  # JSON parsing, data cleanup
│   │   └── validators.ts   # Input validation
│   ├── creator/
│   │   ├── service.ts
│   │   ├── auth.ts        # Creator authentication
│   │   └── validators.ts
│   ├── comment/
│   └── rating/
│
├── app/                 # UI pages (calls domain services)
│   ├── (public)/       # Public routes
│   ├── creator/        # Creator dashboard
│   └── admin/          # Admin panel
│
├── api/                 # HTTP handlers (thin layer)
│   ├── public/
│   ├── creator/
│   └── admin/
│
├── components/          # React components
├── lib/                 # Cross-cutting concerns
│   ├── db.ts           # Prisma client
│   ├── auth.ts         # Consolidated auth
│   └── http.ts         # HTTP helpers
│
└── utils/               # Pure utilities
    ├── normalize.ts
    └── guards.ts
```

---

## Migration Phases

### ✅ PHASE 1: Create Domain Services (SAFE)
**Goal**: Extract business logic WITHOUT changing existing files

**Steps**:
1. Create `src/domain/project/normalizers.ts`
   - Move normalization logic from APIs
   - Keep existing code working (import from new location)

2. Create `src/domain/project/service.ts`
   - Extract all project CRUD operations
   - Database queries, permission checks

3. Create `src/domain/creator/auth.ts`
   - Consolidate `lib/server/auth.ts` + `lib/server/creatorAuth.ts`

4. **Test**: Run `npm run build` - must succeed
5. **Test**: Run app - everything must still work

### ✅ PHASE 2: Update API Routes (CAREFUL)
**Goal**: Replace API handlers with domain service calls

**For each API route**:
1. Update imports to use domain services
2. Remove inline business logic
3. Keep route handler thin (auth → service → response)

**Example**:
```typescript
// OLD: app/api/creator/projects/route.ts
const projects = await db.project.findMany({...});
const formatted = projects.map(p => ({
  ...p,
  techStack: JSON.parse(p.techStack)
}));

// NEW: app/api/creator/projects/route.ts
import { projectService } from '@/domain/project/service';
const projects = await projectService.getCreatorProjects(creatorId);
```

**Test after EACH route update**:
- `npm run build`
- Manual API testing
- Check dev server logs

### ✅ PHASE 3: Flatten API Structure (OPTIONAL)
**Goal**: Remove `handlers/` directories

**Only if** all business logic is in domain layer:
1. Merge `route.ts` + `handlers/*.ts` into single `route.ts`
2. Route becomes thin wrapper around domain service

**Test**: Full regression testing

### ✅ PHASE 4: Consolidate Utilities (SAFE)
**Goal**: Single source of truth for helpers

1. Merge response helpers:
   - `lib/server/response.ts` + `lib/utils/response.ts` → `lib/http.ts`

2. Merge auth helpers:
   - `lib/server/auth.ts` + `lib/server/creatorAuth.ts` → `lib/auth.ts`

3. Update all imports across codebase

**Test**: TypeScript compilation, full app test

### ✅ PHASE 5: Update UI Components (SAFE)
**Goal**: Components import from `domain/` not API helpers

Currently:
```typescript
// components might import from lib/utils
import { normalizeTechStack } from '@/lib/utils/normalize';
```

After:
```typescript
// Import from domain
import { normalizeTechStack } from '@/domain/project/normalizers';
```

**Test**: UI renders correctly, no console errors

---

## Rollback Strategy

**If anything breaks**:
1. Revert last commit
2. Fix issue
3. Proceed incrementally

**Always have working state in Git**:
- Commit after each successful phase
- Never commit broken code
- Use feature branch: `git checkout -b restructure`

---

## File Mapping (Reference)

### Current → Target

#### Domain Services
```
lib/server/collaboration.ts → domain/project/service.ts (collaboration methods)
lib/utils/normalize.ts → domain/project/normalizers.ts
lib/server/creatorAuth.ts → domain/creator/auth.ts
lib/server/auth.ts → lib/auth.ts (admin auth)
```

#### API Routes
```
app/api/projects/ → api/public/projects/
app/api/creator/ → api/creator/
app/api/admin/ → api/admin/
```

#### Pages (minimal changes)
```
app/(public)/ → app/(public)/ (keep as is)
app/creator/(creator)/ → app/creator/ (flatten group)
app/admin/(admin)/ → app/admin/ (flatten group)
```

---

## Testing Checklist

After EACH phase:

- [ ] `npm run build` succeeds
- [ ] Dev server starts without errors
- [ ] Public pages load
- [ ] Creator dashboard works
- [ ] Admin panel works
- [ ] Login/logout works
- [ ] Project CRUD works
- [ ] No TypeScript errors
- [ ] No console errors in browser

---

## Timeline Estimate

- **Phase 1**: 2-3 hours (domain service creation)
- **Phase 2**: 4-6 hours (API route updates)
- **Phase 3**: 1-2 hours (flatten APIs)
- **Phase 4**: 1-2 hours (consolidate utilities)
- **Phase 5**: 1-2 hours (update UI imports)

**Total**: 1-2 days of careful work

---

## When to Stop

**Stop immediately if**:
- Build fails
- TypeScript errors appear
- App crashes on load
- Any functionality breaks

**Fix before proceeding.**

---

## Benefits After Completion

1. ✅ New developers understand structure in 5 minutes
2. ✅ Business logic testable without HTTP layer
3. ✅ Adding features doesn't touch existing domains
4. ✅ Zero duplicate code
5. ✅ Clear ownership boundaries
6. ✅ Easier to add: search, flags, moderation, reports

---

## Next Steps

1. Create feature branch: `git checkout -b restructure`
2. Start Phase 1
3. Commit after each successful step
4. Test thoroughly before moving to next phase

**Do you want me to start Phase 1 (creating domain services)?**
