# O-Hub Platform

A production-grade, full-stack project showcase website with admin panel, rating system, and dark/light theme support.

## Architecture

```
website/
├── frontend/          # Next.js application
├── backend/           # Express.js API
└── database/          # PostgreSQL schema & migrations
```

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Dark/Light theme system
- React Query for state management

### Backend
- Node.js + Express
- TypeScript
- JWT authentication
- PostgreSQL with Prisma ORM
- Rate limiting & security middleware

### Database
- PostgreSQL
- Normalized schema
- Indexed queries

## Features

### Public Features
- Browse projects with filters
- View detailed project information
- Download project artifacts
- Submit ratings (rate-limited)
- Contact form

### Admin Features
- Secure JWT-based authentication
- Project CRUD operations
- Toggle project visibility
- Moderate ratings
- Update contact information
- Analytics dashboard

## API Endpoints

### Public Routes
```
GET    /api/projects              - List all public projects
GET    /api/projects/:id          - Get project details
POST   /api/ratings               - Submit rating
POST   /api/contact               - Send contact message
```

### Admin Routes (Protected)
```
POST   /api/admin/login           - Admin authentication
POST   /api/admin/projects        - Create project
PUT    /api/admin/projects/:id    - Update project
DELETE /api/admin/projects/:id    - Delete project
GET    /api/admin/ratings         - Get all ratings
DELETE /api/admin/ratings/:id     - Delete rating
PUT    /api/admin/contact         - Update contact info
GET    /api/admin/analytics       - Get analytics data
```

## Environment Setup

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Backend Setup
```bash
cd backend
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm seed
pnpm dev
```

### Frontend Setup
```bash
cd frontend
pnpm install
pnpm dev
```

## Database Schema

### Projects
- id (UUID, PK)
- title (String)
- description (Text, Markdown)
- tech_stack (String[])
- category (String)
- preview_images (String[])
- external_link (String)
- is_public (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)

### Ratings
- id (UUID, PK)
- rating (Integer 1-5)
- feedback (Text, Optional)
- ip_hash (String, Indexed)
- created_at (Timestamp)

### Contact
- id (UUID, PK)
- email (String)
- phone (String, Optional)
- social_links (JSON)
- updated_at (Timestamp)

### Admin
- id (UUID, PK)
- email (String, Unique)
- password_hash (String)
- role (String)
- created_at (Timestamp)

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Rate limiting on all public APIs
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration
- Environment-based secrets
- IP hashing for ratings

## Deployment

### Backend (Render/Railway)
1. Connect repository
2. Set environment variables
3. Run build command: `pnpm build`
4. Start command: `pnpm start`

### Frontend (Vercel/Netlify)
1. Connect repository
2. Framework: Next.js
3. Build command: `pnpm build`
4. Output directory: `.next`
5. Set environment variables

### Database (Neon/Supabase)
1. Create PostgreSQL instance
2. Copy connection string
3. Update DATABASE_URL in backend

## Development Commands

### Backend
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm prisma:studio # Open database GUI
pnpm seed         # Seed database
pnpm test         # Run tests
```

### Frontend
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript check
```

## Theme System

The application supports system-aware dark/light mode:
- Respects user's OS preference
- Manual toggle available
- Persisted in localStorage
- CSS variables for consistent theming
- Smooth transitions

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Proper ARIA labels
- Color contrast ratios
- Focus indicators

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Admin account created
- [ ] CORS origins updated
- [ ] Rate limits configured
- [ ] SSL/TLS enabled
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Error tracking (Sentry)
- [ ] Analytics configured

## License

MIT

## Support

For issues or questions, contact via the platform's contact form.
