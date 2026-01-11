# Quick Start Guide

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- PostgreSQL 14+ ([Download](https://postgresql.org)) or use Neon cloud
- Git ([Download](https://git-scm.com))
- Code editor (VS Code recommended)

---

## Installation

### 1. Clone Repository

```powershell
cd C:\Users\vinay\Projectz\website
```

### 2. Backend Setup

```powershell
cd backend

# Install dependencies
npm install

# Or use pnpm (recommended)
npm install -g pnpm
pnpm install

# Copy environment file
copy .env.example .env

# Edit .env with your database credentials
notepad .env
```

**Update .env:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/project_showcase
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Generate Prisma Client & Run Migrations:**
```powershell
npx prisma generate
npx prisma migrate dev --name init
```

**Seed Database:**
```powershell
npm run seed
```

This creates:
- Admin account: `admin@projectshowcase.com` / `Admin@123`
- 5 sample projects
- Sample ratings
- Contact information

**Start Backend:**
```powershell
npm run dev
```

Backend runs on http://localhost:5000

---

### 3. Frontend Setup

Open new terminal:

```powershell
cd C:\Users\vinay\Projectz\website\frontend

# Install dependencies
npm install
# Or with pnpm
pnpm install

# Copy environment file
copy .env.local.example .env.local

# Edit .env.local
notepad .env.local
```

**Update .env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start Frontend:**
```powershell
npm run dev
```

Frontend runs on http://localhost:3000

---

## Verify Installation

### Backend Health Check

Open browser: http://localhost:5000/health

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test API

Get projects:
```powershell
curl http://localhost:5000/api/projects
```

### Frontend

Open browser: http://localhost:3000

Should see:
- Home page with hero section
- Featured projects
- Navigation menu
- Theme toggle

---

## First Steps

### 1. Browse Projects

Navigate to http://localhost:3000/projects

- View all projects
- Use filters (category, tech, year)
- Click project to see details

### 2. Submit Rating

Navigate to http://localhost:3000/rate

- Select star rating
- Add feedback (optional)
- Submit

### 3. Access Admin Panel

Navigate to http://localhost:3000/admin/login

**Credentials:**
- Email: `admin@projectshowcase.com`
- Password: `Admin@123`

**⚠️ IMPORTANT:** Change this password immediately!

### 4. Admin Dashboard

After login:
- View analytics
- Manage projects (create, edit, delete)
- View ratings
- Update contact info

---

## Database Management

### Prisma Studio (Database GUI)

```powershell
cd backend
npx prisma studio
```

Opens http://localhost:5555 with visual database editor.

### Reset Database

```powershell
cd backend
npx prisma migrate reset
npm run seed
```

### Create Migration

```powershell
npx prisma migrate dev --name your_migration_name
```

---

## Common Commands

### Backend

```powershell
cd backend

# Development
npm run dev              # Start with hot reload

# Production
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Database
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open database GUI
npm run seed             # Seed database

# Utilities
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript
```

### Frontend

```powershell
cd frontend

# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm start                # Serve production build

# Utilities
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript
```

---

## Project Structure Overview

```
website/
├── backend/                 # Express API
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # Route definitions
│   │   ├── schemas/        # Validation schemas
│   │   ├── utils/          # Utilities
│   │   ├── index.ts        # Entry point
│   │   └── seed.ts         # Database seeding
│   ├── .env.example        # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/            # Pages (App Router)
│   │   ├── components/     # React components
│   │   ├── lib/            # API client
│   │   ├── store/          # State management
│   │   └── types/          # TypeScript types
│   ├── public/             # Static files
│   ├── .env.local.example  # Environment template
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── README.md               # Main documentation
├── SETUP.md                # This file
├── API.md                  # API documentation
├── DEPLOYMENT.md           # Deployment guide
└── ARCHITECTURE.md         # System architecture
```

---

## Development Workflow

### Adding a New Project (via UI)

1. Login to admin panel
2. Navigate to dashboard
3. (Admin CRUD UI to be implemented)
4. Or use API directly:

```powershell
curl -X POST http://localhost:5000/api/admin/projects `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{
    \"title\": \"New Project\",
    \"description\": \"# Description\\n\\nProject details...\",
    \"techStack\": [\"React\", \"Node.js\"],
    \"category\": \"Web Application\",
    \"externalLink\": \"https://github.com/user/repo\",
    \"previewImages\": [\"https://example.com/image.jpg\"],
    \"isPublic\": true
  }'
```

### Testing API Endpoints

Use Postman, Insomnia, or curl:

**Get Projects:**
```powershell
curl http://localhost:5000/api/projects
```

**Submit Rating:**
```powershell
curl -X POST http://localhost:5000/api/ratings `
  -H "Content-Type: application/json" `
  -d '{\"rating\": 5, \"feedback\": \"Great platform!\"}'
```

**Admin Login:**
```powershell
curl -X POST http://localhost:5000/api/admin/login `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"admin@projectshowcase.com\", \"password\": \"Admin@123\"}'
```

---

## Troubleshooting

### Backend won't start

**Error: Cannot find module**
```powershell
cd backend
rm -rf node_modules
npm install
```

**Error: DATABASE_URL not found**
- Check `.env` file exists in `backend/`
- Verify DATABASE_URL format

**Error: P1001 (Can't reach database)**
- Check PostgreSQL is running
- Verify database credentials
- Test connection: `psql -U user -d database`

### Frontend won't start

**Error: Module not found**
```powershell
cd frontend
rm -rf node_modules .next
npm install
```

**Error: API_URL not defined**
- Check `.env.local` file exists in `frontend/`
- Verify NEXT_PUBLIC_API_URL is set

### Database issues

**Reset everything:**
```powershell
cd backend
npx prisma migrate reset --force
npx prisma generate
npx prisma migrate dev
npm run seed
```

### Port already in use

**Backend (port 5000):**
```powershell
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Frontend (port 3000):**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### CORS errors

- Check backend `CORS_ORIGIN` matches frontend URL
- Restart backend after .env changes

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| JWT_SECRET | Secret for JWT signing (min 32 chars) | `your_secret_key_here` |
| JWT_EXPIRES_IN | Token expiration time | `7d` |
| PORT | Server port | `5000` |
| CORS_ORIGIN | Allowed frontend origin | `http://localhost:3000` |
| NODE_ENV | Environment mode | `development` or `production` |
| RATE_LIMIT_WINDOW_MS | Rate limit time window | `900000` (15 min) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | `100` |

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | `http://localhost:5000/api` |

---

## Default Accounts

### Admin

- **Email:** admin@projectshowcase.com
- **Password:** Admin@123
- **⚠️ Change immediately!**

### Contact Info

- **Email:** contact@projectshowcase.com
- **Phone:** +1234567890
- **Social:** GitHub, LinkedIn, Twitter links

---

## Next Steps

1. ✅ Verify installation
2. ✅ Login to admin panel
3. ✅ Change admin password
4. ✅ Update contact information
5. ✅ Customize sample projects or add your own
6. ✅ Test all features
7. ✅ Read [API.md](API.md) for API details
8. ✅ Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

---

## Getting Help

### Documentation

- [README.md](README.md) - Project overview
- [API.md](API.md) - API documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

### Resources

- Next.js: https://nextjs.org/docs
- Prisma: https://prisma.io/docs
- Express: https://expressjs.com
- Tailwind: https://tailwindcss.com

---

## Production Checklist

Before deploying:

- [ ] Change admin password
- [ ] Update contact information
- [ ] Add real projects
- [ ] Set strong JWT_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Set CORS_ORIGIN to production domain
- [ ] Set NODE_ENV=production
- [ ] Test all features
- [ ] Review security settings
- [ ] Set up monitoring
- [ ] Configure backups

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.
