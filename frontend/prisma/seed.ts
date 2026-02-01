import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================================================
// DEMO ACCOUNTS
// ============================================================================

const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@demo.ohub.com',
    password: 'Demo@Admin123',
    role: 'admin',
  },
  creator: {
    email: 'creator@demo.ohub.com',
    username: 'demo_creator',
    name: 'Demo Creator',
    password: 'Demo@Creator123',
    bio: 'This is a demo account for testing. Feel free to explore!',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    socialLinks: ['https://github.com/demo', 'https://twitter.com/demo'],
  },
};

// ============================================================================
// DEMO PROJECTS
// ============================================================================

const DEMO_PROJECTS = [
  {
    title: 'E-Commerce Platform',
    description: `# Modern E-Commerce Solution

A full-featured e-commerce platform built with modern technologies.

## Features
- Product catalog with search & filters
- Shopping cart & checkout
- User authentication
- Order management
- Admin dashboard

## Tech Highlights
- Server-side rendering for SEO
- Optimistic UI updates
- Real-time inventory tracking`,
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
    category: 'Web Application',
    previewImages: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
    ],
    externalLink: 'https://example.com/ecommerce',
    isPublic: true,
    metadata: { averageRating: 4.5, ratingCount: 12, views: 234, commentCount: 5 },
  },
  {
    title: 'Task Management App',
    description: `# Collaborative Task Manager

A Kanban-style task management application for teams.

## Features
- Drag-and-drop boards
- Real-time collaboration
- Due dates & reminders
- File attachments
- Activity timeline

Built for teams who value simplicity and productivity.`,
    techStack: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Material UI'],
    category: 'Productivity',
    previewImages: [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
    ],
    externalLink: 'https://example.com/taskapp',
    isPublic: true,
    metadata: { averageRating: 4.8, ratingCount: 8, views: 156, commentCount: 3 },
  },
  {
    title: 'AI Chat Assistant',
    description: `# Intelligent Chatbot Platform

An AI-powered chat assistant that learns from conversations.

## Capabilities
- Natural language understanding
- Context-aware responses
- Multi-language support
- Custom training
- Analytics dashboard`,
    techStack: ['Python', 'FastAPI', 'OpenAI', 'Redis', 'React'],
    category: 'AI/ML',
    previewImages: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    ],
    externalLink: 'https://example.com/aichat',
    isPublic: true,
    metadata: { averageRating: 4.2, ratingCount: 5, views: 89, commentCount: 2 },
  },
  {
    title: 'Portfolio Website Template',
    description: `# Developer Portfolio Template

A beautiful, customizable portfolio template for developers.

## Features
- Responsive design
- Dark/light mode
- Project showcase
- Blog integration
- Contact form

Perfect for developers looking to showcase their work.`,
    techStack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'MDX'],
    category: 'Template',
    previewImages: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    ],
    externalLink: 'https://example.com/portfolio-template',
    isPublic: true,
    metadata: { averageRating: 4.9, ratingCount: 20, views: 450, commentCount: 8 },
  },
  {
    title: 'Weather Dashboard',
    description: `# Real-Time Weather Dashboard

A comprehensive weather application with beautiful visualizations.

## Features  
- Current conditions
- 7-day forecast
- Weather maps
- Severe weather alerts
- Location search`,
    techStack: ['Vue.js', 'D3.js', 'OpenWeather API', 'Sass'],
    category: 'Utility',
    previewImages: [
      'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800',
    ],
    externalLink: 'https://example.com/weather',
    isPublic: false, // Draft project
    metadata: { averageRating: 0, ratingCount: 0, views: 12, commentCount: 0 },
  },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Seeding database...\n');

  // ---- Create Admin Account ----
  console.log('Creating admin account...');
  const adminPasswordHash = await bcrypt.hash(DEMO_ACCOUNTS.admin.password, 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: DEMO_ACCOUNTS.admin.email },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: DEMO_ACCOUNTS.admin.email,
      passwordHash: adminPasswordHash,
      role: DEMO_ACCOUNTS.admin.role,
    },
  });
  console.log(`✓ Admin: ${admin.email}`);

  // ---- Create Demo Creator ----
  console.log('\nCreating demo creator...');
  const creatorPasswordHash = await bcrypt.hash(DEMO_ACCOUNTS.creator.password, 10);
  
  const creator = await prisma.creator.upsert({
    where: { email: DEMO_ACCOUNTS.creator.email },
    update: {
      passwordHash: creatorPasswordHash,
      name: DEMO_ACCOUNTS.creator.name,
      bio: DEMO_ACCOUNTS.creator.bio,
      location: DEMO_ACCOUNTS.creator.location,
      website: DEMO_ACCOUNTS.creator.website,
      socialLinks: DEMO_ACCOUNTS.creator.socialLinks,
    },
    create: {
      email: DEMO_ACCOUNTS.creator.email,
      username: DEMO_ACCOUNTS.creator.username,
      name: DEMO_ACCOUNTS.creator.name,
      passwordHash: creatorPasswordHash,
      bio: DEMO_ACCOUNTS.creator.bio,
      location: DEMO_ACCOUNTS.creator.location,
      website: DEMO_ACCOUNTS.creator.website,
      socialLinks: DEMO_ACCOUNTS.creator.socialLinks,
      termsAcceptedAt: new Date(),
    },
  });
  console.log(`✓ Creator: ${creator.email} (${creator.username})`);

  // ---- Create Demo Projects ----
  console.log('\nCreating demo projects...');
  
  for (const projectData of DEMO_PROJECTS) {
    const existingProject = await prisma.project.findFirst({
      where: { 
        title: projectData.title,
        creatorId: creator.id,
      },
    });

    if (!existingProject) {
      const project = await prisma.project.create({
        data: {
          creatorId: creator.id,
          title: projectData.title,
          description: projectData.description,
          techStack: JSON.stringify(projectData.techStack),
          category: projectData.category,
          previewImages: JSON.stringify(projectData.previewImages),
          externalLink: projectData.externalLink,
          isPublic: projectData.isPublic,
          metadata: JSON.stringify(projectData.metadata),
        },
      });
      console.log(`✓ Project: ${project.title} (${projectData.isPublic ? 'public' : 'draft'})`);
    } else {
      console.log(`○ Project exists: ${projectData.title}`);
    }
  }

  // ---- Create Sample Ratings ----
  console.log('\nCreating sample ratings...');
  
  const publicProjects = await prisma.project.findMany({
    where: { creatorId: creator.id, isPublic: true },
    take: 3,
  });

  for (const project of publicProjects) {
    const existingRating = await prisma.rating.findFirst({
      where: { projectId: project.id },
    });

    if (!existingRating) {
      await prisma.rating.create({
        data: {
          projectId: project.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
          feedback: 'Great project! Really well built.',
          ipHash: 'demo_seed_' + Math.random().toString(36).slice(2),
        },
      });
      console.log(`✓ Rating for: ${project.title}`);
    }
  }

  // ---- Create Sample Comments ----
  console.log('\nCreating sample comments...');
  
  const projectWithComments = publicProjects[0];
  if (projectWithComments) {
    const existingComment = await prisma.comment.findFirst({
      where: { projectId: projectWithComments.id },
    });

    if (!existingComment) {
      await prisma.comment.create({
        data: {
          projectId: projectWithComments.id,
          name: 'John Visitor',
          email: 'visitor@example.com',
          content: 'This is really impressive work! How long did it take to build?',
          authorType: 'user',
        },
      });
      console.log(`✓ Comment on: ${projectWithComments.title}`);
    }
  }

  // ---- Create Contact Info ----
  console.log('\nCreating contact info...');
  
  const existingContact = await prisma.contact.findFirst();
  if (!existingContact) {
    await prisma.contact.create({
      data: {
        email: 'contact@ohub.com',
        phone: '+1 (555) 123-4567',
        socialLinks: JSON.stringify({
          github: 'https://github.com/ohub',
          twitter: 'https://twitter.com/ohub',
          linkedin: 'https://linkedin.com/company/ohub',
        }),
      },
    });
    console.log('✓ Contact info created');
  } else {
    console.log('○ Contact info exists');
  }

  // ---- Summary ----
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Seeding completed!\n');
  console.log('Demo Accounts:');
  console.log('─'.repeat(50));
  console.log(`Admin:   ${DEMO_ACCOUNTS.admin.email}`);
  console.log(`         Password: ${DEMO_ACCOUNTS.admin.password}`);
  console.log('');
  console.log(`Creator: ${DEMO_ACCOUNTS.creator.email}`);
  console.log(`         Password: ${DEMO_ACCOUNTS.creator.password}`);
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
