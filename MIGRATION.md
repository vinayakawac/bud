# Migration Guide: Express Backend → Next.js API Routes

This guide explains the changes made to make O-Hub deployable on Vercel.

## 🔄 What Changed

### 1. Architecture Shift

**Before:**
```
Backend (Express) ← → Frontend (Next.js)
   ↓
SQLite Database
```

**After:**
```
Next.js Application (Frontend + API Routes)
   ↓
PostgreSQL Database (Hosted)
```

### 2. Backend Migration

All Express.js routes have been converted to Next.js API routes:

#### Directory Structure
```
frontend/src/app/api/
├── projects/
│   ├── route.ts              (GET /api/projects)
│   └── [id]/
│       └── route.ts          (GET /api/projects/[id])
├── ratings/
│   └── route.ts              (POST /api/ratings)
├── contact/
│   ├── route.ts              (GET /api/contact)
│   └── messages/
│       └── route.ts          (POST /api/contact/messages)
└── admin/
    ├── login/
    │   └── route.ts          (POST /api/admin/login)
    ├── projects/
    │   ├── route.ts          (GET/POST /api/admin/projects)
    │   └── [id]/
    │       └── route.ts      (PUT/DELETE /api/admin/projects/[id])
    ├── analytics/
    │   └── route.ts          (GET /api/admin/analytics)
    ├── ratings/
    │   └── route.ts          (GET /api/admin/ratings)
    ├── messages/
    │   └── route.ts          (GET /api/admin/messages)
    └── contact/
        └── route.ts          (PUT /api/admin/contact)
```

### 3. Database Migration

**Before:** SQLite (`dev.db` file)
**After:** PostgreSQL (hosted database)

#### Schema Changes
- Changed from `sqlite` to `postgresql` provider
- Updated connection URL to use environment variable
- JSON fields remain as strings (compatible with both)

#### Prisma Schema Location
- Moved from `backend/prisma/schema.prisma`
- To `frontend/prisma/schema.prisma`

### 4. API Client Updates

**Before:**
```typescript
const API_URL = 'http://localhost:5000/api';
```

**After:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
```

### 5. Authentication

Authentication logic moved from Express middleware to Next.js API route helpers:

```typescript
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  // JWT verification logic
}
```

### 6. Environment Variables

**Before:**
```env
# backend/.env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="..."
CORS_ORIGIN="http://localhost:3000"
```

**After:**
```env
# frontend/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
NODE_ENV="production"
```

## 📦 Dependencies Changes

### Added to frontend/package.json
```json
{
  "dependencies": {
    "@prisma/client": "^5.8.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "prisma": "^5.8.0",
    "ts-node": "^10.9.2"
  }
}
```

### Build Scripts Updated
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

## 🔧 Configuration Files

### Added Files

1. **vercel.json** - Vercel deployment configuration
2. **frontend/.env.example** - Environment variable template
3. **frontend/prisma/schema.prisma** - Database schema
4. **frontend/prisma/seed.ts** - Database seeding script
5. **DEPLOYMENT.md** - Detailed deployment guide
6. **MIGRATION.md** - This file

### Modified Files

1. **frontend/src/lib/api.ts** - Updated base URL
2. **frontend/package.json** - Added dependencies and scripts
3. **README.md** - Updated with Vercel deployment instructions

## 🚀 Deployment Benefits

### Advantages of New Architecture

1. **Single Deployment**: One Vercel deployment instead of separate backend/frontend
2. **Serverless**: Automatic scaling, no server management
3. **Global CDN**: Faster performance worldwide
4. **Zero Config**: Vercel auto-detects Next.js
5. **Free Tier**: Generous free tier for hobby projects
6. **HTTPS**: Automatic SSL certificates
7. **Git Integration**: Automatic deployments on push

### Limitations to Consider

1. **Execution Time**: Serverless functions have 10s timeout (hobby tier)
2. **Cold Starts**: First request may be slower
3. **Database**: Must use hosted database (no SQLite)
4. **File Storage**: Ephemeral filesystem (can't store uploads)

## 🔄 Migration Checklist for Similar Projects

If you want to migrate another Express + Next.js project:

- [ ] Copy backend controllers to Next.js API routes
- [ ] Convert Express `req, res` to Next.js `NextRequest, NextResponse`
- [ ] Move authentication middleware to helper functions
- [ ] Update Prisma schema provider to PostgreSQL
- [ ] Copy Prisma schema to frontend directory
- [ ] Update API client base URL
- [ ] Add Prisma dependencies to frontend
- [ ] Create seed script in frontend
- [ ] Update environment variables
- [ ] Test all API endpoints locally
- [ ] Set up hosted PostgreSQL database
- [ ] Deploy to Vercel
- [ ] Run migrations on production database

## 📝 Code Conversion Examples

### Express Route → Next.js API Route

**Before (Express):**
```typescript
// backend/src/routes/projects.ts
export const getProjects = async (req: Request, res: Response) => {
  const projects = await prisma.project.findMany();
  res.json({ success: true, data: projects });
};
```

**After (Next.js API Route):**
```typescript
// frontend/src/app/api/projects/route.ts
export async function GET(request: NextRequest) {
  const projects = await prisma.project.findMany();
  return NextResponse.json({ success: true, data: projects });
}
```

### Middleware → Helper Function

**Before (Express):**
```typescript
// middleware/auth.ts
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // verify token
  next();
};
```

**After (Next.js):**
```typescript
// Helper function in route file
function verifyAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  // verify and return result
  return decoded;
}
```

## 🎓 Learning Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql)
- [Serverless Best Practices](https://vercel.com/docs/functions/serverless-functions)

## ❓ FAQ

**Q: What happens to the backend directory?**
A: It's no longer needed for deployment but kept for reference.

**Q: Can I still run locally with SQLite?**
A: You'd need to maintain separate schema or use PostgreSQL locally.

**Q: How do I rollback if needed?**
A: Keep backend directory, restore database connection, deploy backend separately.

**Q: Does this affect performance?**
A: Serverless has cold starts but scales automatically. Overall good for most apps.

**Q: Can I use other databases?**
A: Yes! Prisma supports MySQL, MongoDB, etc. Update schema accordingly.

---

Need help with migration? Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment steps.
