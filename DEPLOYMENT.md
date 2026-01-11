# Deployment Guide

## Overview

This guide covers deploying the Project Showcase Platform to production environments.

## Architecture

- **Frontend**: Next.js (Vercel/Netlify)
- **Backend**: Node.js + Express (Render/Railway)
- **Database**: PostgreSQL (Neon/Supabase)

---

## Prerequisites

- Git repository (GitHub/GitLab)
- Domain name (optional)
- Cloud accounts:
  - Vercel/Netlify (Frontend)
  - Render/Railway (Backend)
  - Neon/Supabase (Database)

---

## Database Setup (Neon PostgreSQL)

### 1. Create Database

1. Go to [Neon](https://neon.tech)
2. Create new project
3. Copy connection string

### 2. Connection String Format

```
postgresql://user:password@host:5432/database?sslmode=require
```

---

## Backend Deployment (Render)

### 1. Prepare Repository

Ensure `backend/` folder contains:
- `package.json`
- `tsconfig.json`
- `prisma/schema.prisma`
- `src/` directory

### 2. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: `project-showcase-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`

### 3. Environment Variables

Add in Render dashboard:

```env
DATABASE_URL=<neon_connection_string>
JWT_SECRET=<generate_random_string_min_32_chars>
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.vercel.app
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Deploy

- Click "Create Web Service"
- Wait for deployment
- Note the service URL: `https://project-showcase-api.onrender.com`

### 5. Run Database Migrations

In Render Shell:
```bash
npx prisma migrate deploy
npm run seed
```

---

## Frontend Deployment (Vercel)

### 1. Prepare Repository

Ensure `frontend/` folder contains:
- `package.json`
- `next.config.js`
- `tailwind.config.js`

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Environment Variables

Add in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://project-showcase-api.onrender.com/api
```

### 4. Deploy

- Click "Deploy"
- Wait for build completion
- Your site will be live at: `https://your-project.vercel.app`

### 5. Update Backend CORS

Update `CORS_ORIGIN` in Render environment variables:
```env
CORS_ORIGIN=https://your-project.vercel.app
```

---

## Alternative: Railway Deployment

### Backend on Railway

1. Go to [Railway](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Configure environment variables
6. Railway auto-generates domain

---

## Alternative: Netlify Deployment

### Frontend on Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Import repository
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Add environment variables
5. Deploy

---

## Custom Domain Setup

### Vercel

1. Go to project settings → Domains
2. Add your domain
3. Configure DNS:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `cname.vercel-dns.com`

### Render

1. Go to service settings → Custom Domain
2. Add domain
3. Update DNS:
   - Type: `CNAME`
   - Name: `api`
   - Value: `<your-service>.onrender.com`

---

## SSL/TLS Certificates

Both Vercel and Render provide automatic SSL certificates via Let's Encrypt.

---

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Seed data loaded
- [ ] Admin account created
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] Authentication working
- [ ] Rate limiting active
- [ ] Error logging configured

---

## Security Hardening

### 1. Change Default Credentials

After first deployment, login and change admin password.

### 2. Environment Variables

Never commit:
- `JWT_SECRET`
- `DATABASE_URL`
- API keys

### 3. Rate Limiting

Already configured in backend. Adjust if needed:
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # per window
```

### 4. CORS

Restrict to your frontend domain only:
```env
CORS_ORIGIN=https://yourdomain.com
```

---

## Monitoring & Logging

### Recommended Services

- **Error Tracking**: [Sentry](https://sentry.io)
- **Logging**: [Better Stack](https://betterstack.com)
- **Uptime**: [UptimeRobot](https://uptimerobot.com)
- **Analytics**: [Plausible](https://plausible.io)

### Integration

1. Sign up for service
2. Get API key
3. Add to environment variables
4. Update code to send logs

---

## Database Backups

### Neon

- Automatic daily backups
- Point-in-time recovery available

### Manual Backup

```bash
pg_dump $DATABASE_URL > backup.sql
```

---

## Scaling Considerations

### Backend

- **Render**: Upgrade to paid plan for better performance
- **Horizontal Scaling**: Add load balancer for multiple instances

### Database

- **Connection Pooling**: Use PgBouncer
- **Read Replicas**: For high traffic
- **Indexing**: Already configured in Prisma schema

### Frontend

- **CDN**: Vercel provides automatic CDN
- **Image Optimization**: Next.js built-in

---

## Troubleshooting

### Backend Not Starting

1. Check build logs in Render
2. Verify environment variables
3. Check database connection

### Frontend Build Failing

1. Check Vercel build logs
2. Verify `NEXT_PUBLIC_API_URL`
3. Check TypeScript errors

### API Connection Issues

1. Verify CORS settings
2. Check API URL in frontend
3. Test endpoints with Postman

### Database Migration Errors

```bash
npx prisma migrate reset
npx prisma migrate deploy
npm run seed
```

---

## Rollback Procedure

### Render

1. Go to deployment history
2. Select previous deployment
3. Click "Redeploy"

### Vercel

1. Go to deployments tab
2. Select previous deployment
3. Click "Promote to Production"

---

## Cost Estimation

### Free Tier

- **Vercel**: Free for personal projects
- **Render**: 750 hours/month free
- **Neon**: 0.5 GB storage free

### Paid Tier (Recommended for Production)

- **Vercel Pro**: $20/month
- **Render Standard**: $7/month
- **Neon Pro**: $19/month

**Total**: ~$46/month

---

## Support

For deployment issues:
1. Check service documentation
2. Review error logs
3. Contact platform support
4. Check community forums
