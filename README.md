# O-Hub - Project Showcase Platform

A full-stack platform for creators to showcase their projects, built with Next.js 14 and PostgreSQL.

## What is O-Hub?

O-Hub is a project portfolio platform where creators can showcase their work. Creators register, manage their projects, and share them publicly. Visitors can browse projects, rate them, and provide feedback. Administrators manage the platform through a dedicated admin panel.

## Key Features

- **Three User Roles**: Creators (project owners), Visitors (public viewers), and Admins (platform managers)
- **Creator Dashboard**: Personal workspace to create, edit, and publish projects with draft/published states
- **Public Gallery**: Browse and filter projects by category and technology
- **Rating System**: IP-based rating and feedback collection with rate limiting
- **Profile Customization**: Bio, location, social links, and pronouns for creators
- **Theme Support**: Dark and light mode with smooth transitions
- **Responsive Design**: Works seamlessly across all devices

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: JWT with bcrypt

## How It Works

### Architecture

The platform uses a domain-driven design pattern:

User Interface (Next.js Pages) -> API Routes (Authentication & Validation) -> Domain Services (Business Logic) -> Database (PostgreSQL via Prisma)

### Project Structure

frontend/
 src/
    app/           # Pages and API routes
    components/    # Reusable UI components
    domain/        # Business logic services
    lib/           # Utilities and database client
 prisma/            # Database schema and migrations


### Default Admin Account

- Email: admin@projectshowcase.com
- Password: Admin@123

## License

MIT License
