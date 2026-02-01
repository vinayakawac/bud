# O-Hub — Project Showcase Platform

A **production-grade** full-stack collaboration platform for creators to showcase their projects. Built with **Next.js 14**, **TypeScript**, **PostgreSQL**, and **Prisma**.

---

## 🎯 What is O-Hub?

O-Hub is a project portfolio platform where creators register, showcase their work, and collaborate with others. Visitors browse projects, leave feedback, and rate them. Administrators manage the platform through a dedicated admin panel.

**Production Features:**
- Multi-role authentication (Creator, Admin, Visitor)
- Role-based access control (RBAC) with explicit permissions
- Enterprise audit logging for compliance
- Project management with collaboration support
- Rating and feedback system with rate limiting

---

## 📋 Table of Contents

1. [System Design](#-system-design)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Getting Started](#-getting-started)
5. [API Reference](#-api-reference)
6. [Architecture Decisions](#-architecture-decisions)
7. [Resilience & Hardening](#-resilience--hardening)
8. [What I'd Do With More Time](#-what-id-do-with-more-time)

---

## 🏗 System Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                   │
│  │   Public    │   │   Creator   │   │    Admin    │                   │
│  │   Pages     │   │  Dashboard  │   │   Panel     │                   │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                   │
│         │                  │                  │                          │
│         └──────────────────┼──────────────────┘                          │
│                            │                                             │
│                    React Query (Caching)                                 │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────────────┐
│                      API LAYER (Next.js Routes)                          │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    RBAC Middleware                               │    │
│  │  • Role validation (Creator, Admin, Visitor)                     │    │
│  │  • Permission checks                                             │    │
│  │  • Ownership verification                                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                            │                                             │
│                            ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Domain Services                               │    │
│  │  • ProjectService    • CreatorService                            │    │
│  │  • RatingService     • CommentService                            │    │
│  │  • AuditService      • CollaborationService                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                            │                                             │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────────────┐
│                      DATA LAYER                                          │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            ▼                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  Prisma ORM      │  │  PostgreSQL      │  │  Audit Logs      │       │
│  │  (Type-safe)     │──│  (Primary DB)    │──│  (Compliance)    │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└──────────────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    Client    │      │  API Route   │      │   Database   │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                      │
       │  POST /login        │                      │
       │  {email, password}  │                      │
       │────────────────────>│                      │
       │                     │  Find user by email  │
       │                     │─────────────────────>│
       │                     │                      │
       │                     │<─────────────────────│
       │                     │  User record         │
       │                     │                      │
       │                     │  bcrypt.compare()    │
       │                     │  Sign JWT (7 days)   │
       │                     │                      │
       │  Set-Cookie:        │  Audit: LOGIN_SUCCESS│
       │  HttpOnly, Secure   │─────────────────────>│
       │<────────────────────│                      │
       │                     │                      │
       │  Subsequent requests│                      │
       │  + Cookie/Bearer    │                      │
       │────────────────────>│                      │
       │                     │  Verify JWT          │
       │                     │  Check RBAC          │
       │<────────────────────│                      │
```

**JWT Lifecycle:**
1. **Creation**: On successful login, JWT signed with secret, 7-day expiry
2. **Storage**: HTTP-only cookie (XSS protection) OR Bearer token (API clients)
3. **Validation**: Every protected request verifies signature + role
4. **Refresh**: User re-authenticates on expiry (stateless, no refresh tokens)

### Data Model (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Creator   │       │   Project   │       │   Comment   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ username    │  │    │ creatorId   │◄─┘    │ projectId   │◄─┐
│ email       │  │    │ title       │       │ content     │  │
│ name        │  │    │ description │       │ authorType  │  │
│ passwordHash│  │    │ techStack[] │       │ parentId    │──┤ (self-ref)
│ bio         │  │    │ category    │       └─────────────┘  │
│ isActive    │  │    │ isPublic    │                        │
└─────────────┘  │    │ metadata    │       ┌─────────────┐  │
                 │    └─────────────┘       │   Rating    │  │
                 │           │              ├─────────────┤  │
                 │           │              │ id (PK)     │  │
                 │           ▼              │ projectId   │◄─┘
┌─────────────┐  │    ┌─────────────────┐   │ rating 1-5  │
│    Admin    │  │    │ Collaborator    │   │ feedback    │
├─────────────┤  │    ├─────────────────┤   │ ipHash      │
│ id (PK)     │  │    │ projectId (FK)  │   └─────────────┘
│ email       │  │    │ creatorId (FK)  │◄──┘
│ passwordHash│  │    │ role            │
│ role        │  │    └─────────────────┘
└─────────────┘  │
                 │    ┌─────────────┐
                 │    │  AuditLog   │ ◄── Enterprise compliance
                 │    ├─────────────┤
                 │    │ actorId     │◄────────────────────────┘
                 │    │ actorType   │
                 │    │ action      │
                 │    │ entityType  │
                 │    │ entityId    │
                 │    │ metadata    │
                 │    │ timestamp   │
                 │    └─────────────┘
```

---

## ✨ Key Features

### Multi-Role Authentication
- **Creators**: Register, login, manage projects, collaborate
- **Admins**: Platform management, analytics, moderation
- **Visitors**: Browse, rate, comment (IP-rate-limited)

### Role-Based Access Control (RBAC)
```typescript
enum Role {
  VISITOR = 'visitor',
  CREATOR = 'creator', 
  ADMIN = 'admin',
}

// Permission-based guards
requirePermission(Permission.PROJECT_UPDATE)
requireOwnershipOrAdmin(getProjectOwner)
```

### Enterprise Audit Logging
Every significant action is logged:
- Authentication events (login, logout, failures)
- CRUD operations (create, update, delete)
- Permission denials
- Security events

### Collaboration System
- Invite creators to projects
- Accept/reject invitations
- Shared project management

### Rating & Feedback
- 1-5 star ratings with optional feedback
- IP-based rate limiting
- Aggregated statistics in project metadata

---

## 🛠 Technology Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 14 (App Router) | Server components, API routes, optimal DX |
| **Language** | TypeScript | Type safety, better tooling |
| **Database** | PostgreSQL | ACID compliance, relational integrity |
| **ORM** | Prisma | Type-safe queries, migrations, seeding |
| **Auth** | JWT + bcrypt | Stateless, secure password hashing |
| **Styling** | Tailwind CSS | Utility-first, consistent design |
| **State** | React Query | Server state, caching, revalidation |
| **Deployment** | Vercel | Zero-config, edge functions |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm/yarn/pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/vinayakawac/bud.git
cd bud/frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and JWT_SECRET

# Run migrations
npx prisma migrate dev

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.ohub.com | Demo@Admin123 |
| Creator | creator@demo.ohub.com | Demo@Creator123 |

---

## 📖 API Reference

### Authentication

```http
POST /api/creator/login
Content-Type: application/json

{ "email": "user@example.com", "password": "password" }

Response: 200 OK
{
  "success": true,
  "data": { "token": "jwt...", "creator": {...} }
}
```

### Projects (Paginated)

```http
GET /api/projects?page=1&limit=20&sort=createdAt&order=desc&category=web

Response: 200 OK
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Something broke |

---

## 🧠 Architecture Decisions

### Why Domain Services (not Controllers)?

**Problem**: Fat API routes with mixed concerns  
**Solution**: Domain services encapsulate business logic

```
API Route → Pure HTTP handling (validation, response formatting)
Domain Service → Pure business logic (no HTTP awareness)
```

**Benefits:**
- Testable without HTTP mocking
- Reusable across different routes
- Clear separation of concerns

### Why JWT over Sessions?

| Aspect | JWT | Sessions |
|--------|-----|----------|
| Scalability | ✅ Stateless | ❌ Requires session store |
| Revocation | ❌ Can't revoke | ✅ Immediate |
| Security | ✅ Signed tokens | ✅ Server-controlled |

**Decision**: JWT with 7-day expiry — acceptable for portfolio platform, simpler infrastructure.

### Why Prisma over Raw SQL?

- **Type safety**: Catch errors at compile time
- **Migrations**: Version-controlled schema changes
- **Productivity**: Auto-generated types, intellisense

### Why No Separate Backend?

Next.js API routes provide:
- Same deployment unit (simpler ops)
- Shared types between client/server
- Edge function support

For this scale, a separate backend adds complexity without benefit.

---

## � Resilience & Hardening

O-Hub is built with production resilience in mind. See [RESILIENCE.md](frontend/RESILIENCE.md) for full documentation.

### Defense-in-Depth Summary

| Layer | Implementation |
|-------|----------------|
| **Input Validation** | Schema validation at API boundary, sanitization |
| **Rate Limiting** | Sliding window per-IP, progressive lockout |
| **RBAC** | Fail-closed, explicit permissions, ownership checks |
| **Error Handling** | React error boundaries, graceful degradation |
| **Data Safety** | Soft delete with confirmation, cascade protection |
| **Concurrency** | Optimistic locking, idempotency keys, distributed locks |
| **Audit Trail** | All significant actions logged for compliance |

### Key Files

```
src/lib/server/
├── validation.ts    # Input validation & sanitization
├── rateLimit.ts     # Rate limiting with backoff
├── rbac.ts          # Role-based access control
├── audit.ts         # Enterprise audit logging
├── concurrency.ts   # Locks, idempotency, version checks
└── softDelete.ts    # Safe deletion patterns
```

---

## �🔮 What I'd Do With More Time

### Technical Improvements
- [ ] **Redis** for session caching and pub/sub
- [ ] **Background jobs** (notifications, email) via BullMQ
- [ ] **Rate limiting** with sliding window algorithm
- [ ] **Optimistic UI updates** for better perceived performance
- [ ] **WebSocket** for real-time collaboration indicators

### Features
- [ ] **Project versioning** with diff visualization
- [ ] **Full-text search** with PostgreSQL tsvector
- [ ] **Export** projects to PDF/Markdown
- [ ] **Analytics dashboard** with charts
- [ ] **Webhook integrations** for external services

### DevOps
- [ ] **CI/CD pipeline** with GitHub Actions
- [ ] **E2E tests** with Playwright
- [ ] **Performance monitoring** with Sentry
- [ ] **Database backups** with pg_dump cron
- [ ] **Multi-region deployment** for latency

---

## 📁 Project Structure

```
frontend/
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma       # Data models
│   ├── migrations/         # Version-controlled changes
│   └── seed.ts             # Demo data seeding
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (public)/       # Public pages (projects, creators)
│   │   ├── admin/          # Admin panel
│   │   ├── creator/        # Creator dashboard
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── ui/             # Design system primitives
│   │   └── [domain]/       # Feature-specific components
│   ├── domain/             # Business logic services
│   │   ├── project/        # Project CRUD, validation
│   │   ├── creator/        # Creator management, auth
│   │   └── rating/         # Rating system logic
│   ├── lib/                # Utilities
│   │   ├── server/         # Server-only (auth, db, rbac, audit)
│   │   └── api.ts          # Client-side API wrapper
│   └── types/              # TypeScript definitions
└── public/                 # Static assets
```

---

## 📄 License

MIT License

---

**Built with ❤️ by [Vinayak](https://github.com/vinayakawac)**
