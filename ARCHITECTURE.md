# Project Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Browser (Chrome, Firefox, Safari)                          │
│  - React Components                                          │
│  - Theme System (Dark/Light)                                 │
│  - State Management (Zustand)                                │
│  - API Client (Axios)                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router)                                    │
│  - Server-Side Rendering                                     │
│  - Static Generation                                         │
│  - API Routes (unused, direct backend calls)                 │
│  - Image Optimization                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ REST API
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Express.js Middleware                                       │
│  - CORS                                                      │
│  - Helmet (Security)                                         │
│  - Rate Limiting                                             │
│  - Body Parsing                                              │
│  - Error Handling                                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Controllers                                                 │
│  - Projects Controller                                       │
│  - Ratings Controller                                        │
│  - Contact Controller                                        │
│  - Admin Controllers (Auth, Projects, Ratings, System)       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                       BUSINESS LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Authentication                                              │
│  - JWT Generation                                            │
│  - Token Verification                                        │
│  - Password Hashing (bcrypt)                                 │
│                                                              │
│  Validation                                                  │
│  - Zod Schema Validation                                     │
│  - Input Sanitization                                        │
│                                                              │
│  Authorization                                               │
│  - Role-Based Access Control                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA ACCESS LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Prisma ORM                                                  │
│  - Query Builder                                             │
│  - Migration System                                          │
│  - Type Safety                                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL                                                  │
│  - Projects Table                                            │
│  - Ratings Table                                             │
│  - Contact Table                                             │
│  - ContactMessages Table                                     │
│  - Admins Table                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles + CSS variables
│   │   ├── providers.tsx       # React Query + Theme providers
│   │   ├── projects/
│   │   │   ├── page.tsx        # Projects listing
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Project detail
│   │   ├── rate/
│   │   │   └── page.tsx        # Rating form
│   │   ├── contact/
│   │   │   └── page.tsx        # Contact form
│   │   └── admin/
│   │       ├── login/
│   │       │   └── page.tsx    # Admin login
│   │       └── dashboard/
│   │           └── page.tsx    # Admin dashboard
│   │
│   ├── components/             # Reusable components
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Navigation + theme toggle
│   │   │   └── Footer.tsx      # Footer
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx   # Theme initialization
│   │   │   └── ThemeToggle.tsx     # Dark/Light toggle
│   │   ├── home/
│   │   │   └── FeaturedProjects.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx     # Project preview
│   │   │   └── ProjectFilters.tsx  # Filter controls
│   │   └── admin/
│   │       ├── LoginForm.tsx
│   │       └── AdminNav.tsx
│   │
│   ├── lib/
│   │   └── api.ts              # API client + admin API
│   │
│   ├── store/
│   │   └── authStore.ts        # Zustand auth state
│   │
│   └── types/
│       └── index.ts            # TypeScript interfaces
│
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.ts            # Environment configuration
│   │
│   ├── controllers/            # Request handlers
│   │   ├── projects.ts         # Public project endpoints
│   │   ├── ratings.ts          # Public rating endpoint
│   │   ├── contact.ts          # Public contact endpoints
│   │   └── admin/
│   │       ├── auth.ts         # Admin authentication
│   │       ├── projects.ts     # Admin project CRUD
│   │       ├── ratings.ts      # Admin rating management
│   │       └── system.ts       # Contact + analytics
│   │
│   ├── middleware/             # Express middleware
│   │   ├── auth.ts             # JWT verification
│   │   ├── errorHandler.ts    # Global error handler
│   │   ├── notFound.ts         # 404 handler
│   │   ├── rateLimit.ts        # Rate limiting configs
│   │   └── validate.ts         # Zod validation wrapper
│   │
│   ├── routes/                 # Route definitions
│   │   ├── projects.ts         # Public project routes
│   │   ├── ratings.ts          # Public rating routes
│   │   ├── contact.ts          # Public contact routes
│   │   └── admin.ts            # Admin routes
│   │
│   ├── schemas/                # Zod validation schemas
│   │   └── index.ts            # All schemas + DTOs
│   │
│   ├── utils/
│   │   └── ipHash.ts           # IP hashing utilities
│   │
│   ├── index.ts                # Express app entry point
│   └── seed.ts                 # Database seeding script
│
├── prisma/
│   └── schema.prisma           # Database schema
│
├── package.json
├── tsconfig.json
└── .env.example                # Environment template
```

---

## Data Flow

### Public User Journey

1. **Browse Projects**
   ```
   Browser → Next.js → API Client → Backend API → Prisma → PostgreSQL
   ```

2. **Submit Rating**
   ```
   Browser → Form Submit → API Client → Rate Limiter → 
   Validation → IP Hash → Database → Success Response
   ```

3. **Contact Form**
   ```
   Browser → Form Submit → API Client → Rate Limiter → 
   Validation → IP Hash → Database → Success Response
   ```

### Admin Journey

1. **Login**
   ```
   Browser → Login Form → API Client → Admin API → 
   Credentials Check → bcrypt Verify → JWT Generate → 
   Token Storage (localStorage) → Redirect to Dashboard
   ```

2. **Create Project**
   ```
   Browser → Project Form → API Client + JWT → 
   JWT Verify → Validation → Database Insert → Success
   ```

3. **Update/Delete**
   ```
   Browser → Action → API Client + JWT → JWT Verify → 
   Authorization Check → Database Operation → Success
   ```

---

## Security Architecture

### Authentication Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ 1. Login (email + password)
       ▼
┌──────────────┐
│  Backend API │
└──────┬───────┘
       │ 2. Find admin in DB
       ▼
┌──────────────┐
│  PostgreSQL  │
└──────┬───────┘
       │ 3. Return admin + password hash
       ▼
┌──────────────┐
│  bcrypt      │
│  compare()   │
└──────┬───────┘
       │ 4. Valid? Generate JWT
       ▼
┌──────────────┐
│  jsonwebtoken│
│  sign()      │
└──────┬───────┘
       │ 5. Return token to browser
       ▼
┌──────────────┐
│  localStorage│ (Zustand persist)
└──────────────┘
```

### Authorization Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ 1. Admin action (token in header)
       ▼
┌──────────────┐
│  Backend API │
│  Middleware  │
└──────┬───────┘
       │ 2. Extract token from header
       ▼
┌──────────────┐
│  jwt.verify()│
└──────┬───────┘
       │ 3. Valid? Decode payload
       ▼
┌──────────────┐
│  req.admin   │ (adminId, email, role)
└──────┬───────┘
       │ 4. Continue to controller
       ▼
┌──────────────┐
│  Controller  │
│  Action      │
└──────────────┘
```

### Security Layers

1. **Transport Security**
   - HTTPS only in production
   - SSL/TLS certificates (auto via Vercel/Render)

2. **Request Security**
   - Helmet.js headers
   - CORS restrictions
   - Rate limiting

3. **Data Security**
   - Input validation (Zod)
   - SQL injection prevention (Prisma ORM)
   - XSS protection (input sanitization)
   - Password hashing (bcrypt, 10 rounds)
   - IP hashing (SHA-256)

4. **Authentication Security**
   - JWT tokens (7-day expiry)
   - Token in Authorization header only
   - Secure token storage (httpOnly in production)

5. **Rate Limiting**
   - Public APIs: 100 req/15min
   - Strict endpoints: 5 req/15min
   - Auth attempts: 5 req/15min

---

## State Management

### Frontend State

```
┌─────────────────────────────────────┐
│         React Query Cache           │
│  - Projects data                    │
│  - Project details                  │
│  - Contact info                     │
│  - Analytics (admin)                │
│  - Automatic refetching             │
│  - Stale-while-revalidate           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Zustand Store               │
│  - Auth token (persisted)           │
│  - Admin data (persisted)           │
│  - Login/logout actions             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Local State                 │
│  - Form inputs                      │
│  - Filter selections                │
│  - Theme preference (localStorage)  │
└─────────────────────────────────────┘
```

---

## Database Schema Design

### Relationships

```
┌──────────────┐
│    Admin     │  (Independent table)
│--------------│
│ id (PK)      │
│ email        │
│ passwordHash │
│ role         │
└──────────────┘

┌──────────────┐
│   Project    │  (Independent table)
│--------------│
│ id (PK)      │
│ title        │
│ description  │
│ techStack[]  │
│ category     │
│ previewImages│
│ externalLink │
│ isPublic     │
│ metadata     │
└──────────────┘

┌──────────────┐
│   Rating     │  (Independent table)
│--------------│
│ id (PK)      │
│ rating       │
│ feedback     │
│ ipHash       │ (Indexed)
└──────────────┘

┌──────────────┐
│   Contact    │  (Singleton table)
│--------------│
│ id (PK)      │
│ email        │
│ phone        │
│ socialLinks  │
└──────────────┘

┌──────────────┐
│ContactMessage│  (Log table)
│--------------│
│ id (PK)      │
│ name         │
│ email        │
│ message      │
│ ipHash       │
└──────────────┘
```

### Indexes

- `projects.isPublic` - Fast public filtering
- `projects.category` - Category filtering
- `projects.createdAt` - Sorting
- `ratings.ipHash` - Rate limit checking
- `ratings.createdAt` - Recent ratings

---

## Theme System

### CSS Variables

```css
:root {
  /* Dark Theme (Default) */
  --dark-bg: #0a0a0a;
  --dark-surface: #1a1a1a;
  --dark-border: #2a2a2a;
  --dark-text-primary: #f5f5f5;
  --dark-text-secondary: #a3a3a3;
  --dark-accent: #3b82f6;

  /* Light Theme */
  --light-bg: #ffffff;
  --light-surface: #f9fafb;
  --light-border: #e5e7eb;
  --light-text-primary: #111827;
  --light-text-secondary: #6b7280;
  --light-accent: #2563eb;
}
```

### Theme Toggle Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ 1. Component mounts
       ▼
┌──────────────┐
│ThemeProvider │
└──────┬───────┘
       │ 2. Check localStorage
       │ 3. Check system preference
       │ 4. Apply theme class
       ▼
┌──────────────┐
│ <html> class │ .light or (default dark)
└──────┬───────┘
       │ 5. CSS variables apply
       ▼
┌──────────────┐
│   Rendered   │
│     UI       │
└──────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     INTERNET                            │
└────────────────┬────────────────────────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│   Vercel    │     │   Render    │
│  (Frontend) │     │  (Backend)  │
│             │     │             │
│  Next.js    │────▶│  Express    │
│  Static     │ API │  Node.js    │
│  CDN        │     │             │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Neon      │
                    │ (PostgreSQL) │
                    │             │
                    │  Database   │
                    └─────────────┘
```

---

## Performance Optimizations

### Frontend

1. **Static Generation**
   - Home page pre-rendered
   - ISR for project pages

2. **Image Optimization**
   - Next.js Image component
   - Automatic WebP conversion
   - Responsive images

3. **Code Splitting**
   - Automatic by Next.js
   - Route-based splitting

4. **Caching**
   - React Query cache (60s stale time)
   - Browser cache headers

### Backend

1. **Database**
   - Indexed queries
   - Connection pooling (Prisma)
   - Selective field loading

2. **API**
   - Compression middleware
   - Response caching headers
   - Efficient queries

---

## Monitoring & Error Handling

### Error Handling Hierarchy

```
1. Try-Catch in Controllers
   ↓
2. Express Error Middleware
   ↓
3. AppError (operational) vs System Error
   ↓
4. Appropriate Status Code + Message
   ↓
5. Log to Console (production: send to service)
```

### Logging Strategy

- Development: Console logging
- Production: Integrate Sentry/Better Stack
- Log levels: Error, Warn, Info
- Sensitive data filtering

---

This architecture ensures:
- Scalability
- Security
- Maintainability
- Performance
- Production readiness
