# O-Hub Platform

A production-grade, full-stack project showcase platform with admin panel, rating system, and dark/light theme support. Built with Next.js and deployed on Vercel.

## 🚀 Features

### Public Features
- 📱 Browse projects with advanced filters (category, technology, year)
- 🔍 View detailed project information with tech stacks
- ⭐ Submit ratings and feedback (rate-limited)
- 📧 Contact form with IP-based rate limiting
- 🌓 Dark/Light theme with smooth transitions
- 🔗 GitHub repository auto-import functionality

### Admin Features
- 🔐 Secure JWT-based authentication
- ✏️ Full CRUD operations for projects
- 🎯 GitHub auto-pull for project details
- 👁️ Toggle project visibility
- 📊 Analytics dashboard
- 💬 View contact messages and ratings
- ⚙️ Update contact information

## 📁 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: JWT with bcrypt
- **State Management**: Zustand + TanStack Query
- **Deployment**: Vercel
- **API**: Next.js API Routes (Serverless Functions)

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/vinayakawac/bud.git
   cd bud/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ohub"
   JWT_SECRET="your-secret-key-here"
   JWT_EXPIRES_IN="7d"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate deploy

   # Seed the database (creates admin user)
   npx prisma db seed
   ```

   **Default admin credentials:**
   - Email: `admin@projectshowcase.com`
   - Password: `Admin@123`

5. **Start development server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Configure environment variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     ```
     DATABASE_URL=your-postgresql-connection-string
     JWT_SECRET=your-secret-key
     JWT_EXPIRES_IN=7d
     NODE_ENV=production
     ```

4. **Set up PostgreSQL database**
   
   You have several options:
   - **Vercel Postgres** (easiest integration)
   - **Neon** (free tier available)
   - **Supabase** (free tier with generous limits)
   - **Railway** (simple deployment)
   - **AWS RDS, Google Cloud SQL, or Azure Database**

   For Vercel Postgres:
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Link your project
   vercel link

   # Create Postgres database
   vercel postgres create
   ```

5. **Run database migrations**
   
   After deployment, run migrations via Vercel CLI:
   ```bash
   # Deploy and run migrations
   vercel env pull .env.local
   npx prisma migrate deploy
   npx prisma db seed
   ```

   Or add a build script (already configured in package.json):
   - The `postinstall` script automatically runs `prisma generate`
   - Migrations should be run manually or via CI/CD

6. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Add environment variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add JWT_EXPIRES_IN
   vercel env add NODE_ENV
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Post-Deployment Steps

1. **Verify deployment**
   - Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
   - Test the homepage, projects page, and rate page

2. **Access admin panel**
   - Go to `/admin/login`
   - Use default credentials or the ones you set up
   - Test CRUD operations

3. **Run database migrations (if not done)**
   ```bash
   # Using Vercel CLI
   vercel env pull .env.production
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. **Configure custom domain (optional)**
   - Go to Vercel Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

## 📊 Database Schema

The application uses PostgreSQL with the following models:

- **Admin**: Authentication and user management
- **Project**: Project information and metadata
- **Rating**: User ratings and feedback
- **Contact**: Contact information
- **ContactMessage**: Contact form submissions

See [frontend/prisma/schema.prisma](frontend/prisma/schema.prisma) for the complete schema.

## 🔒 Security Features

- JWT-based authentication with secure token handling
- Password hashing with bcrypt (10 rounds)
- IP-based rate limiting for ratings and contact forms
- SQL injection protection via Prisma
- XSS protection via React's built-in escaping

## 🎨 Theme System

The application supports dark and light themes with smooth transitions:
- Automatic OS preference detection
- Manual theme toggle
- Persistent theme selection
- Color transitions on all elements

## 📝 API Routes

All API routes are serverless functions deployed to Vercel:

### Public Routes
- `GET /api/projects` - List projects with filters
- `GET /api/projects/[id]` - Get project details
- `POST /api/ratings` - Submit rating
- `GET /api/contact` - Get contact info
- `POST /api/contact/messages` - Send message

### Admin Routes (require authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/projects` - List all projects
- `POST /api/admin/projects` - Create project
- `PUT /api/admin/projects/[id]` - Update project
- `DELETE /api/admin/projects/[id]` - Delete project
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/ratings` - List ratings
- `GET /api/admin/messages` - List messages
- `PUT /api/admin/contact` - Update contact info

## 🐛 Troubleshooting

### Build Errors

**Error: Cannot find module '@prisma/client'**
```bash
cd frontend
npm install
npx prisma generate
```

**Error: Environment variable not found: DATABASE_URL**
- Ensure `.env` file exists in frontend directory
- Check environment variables in Vercel dashboard

### Database Connection Issues

**Error: Can't reach database server**
- Verify DATABASE_URL is correct
- Check database is running and accessible
- Ensure firewall rules allow connections from Vercel IPs

**Migration errors**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name init
```

### Deployment Issues

**Vercel build fails**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Verify Prisma is generating client during build

**Functions timeout**
- Optimize database queries
- Add indexes to frequently queried fields
- Consider upgrading Vercel plan for longer function timeouts

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 👨‍💻 Author

Vinayak Awasthi

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Repository**: https://github.com/vinayakawac/bud
