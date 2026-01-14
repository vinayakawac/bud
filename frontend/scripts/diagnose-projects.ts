import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  console.log('=== DIAGNOSING PROJECT DATA ===\n');

  // Check all projects
  const projects = await prisma.$queryRaw<any[]>`
    SELECT 
      id,
      title,
      creator_id,
      is_public,
      pg_typeof(id)::text as id_type,
      pg_typeof(creator_id)::text as creator_id_type,
      created_at
    FROM projects
  `;

  console.log('📊 ALL PROJECTS IN DATABASE:');
  console.log(JSON.stringify(projects, null, 2));
  console.log(`\nTotal projects: ${projects.length}\n`);

  // Check all creators
  const creators = await prisma.$queryRaw<any[]>`
    SELECT 
      id,
      name,
      email,
      pg_typeof(id)::text as id_type
    FROM creators
  `;

  console.log('👥 ALL CREATORS IN DATABASE:');
  console.log(JSON.stringify(creators, null, 2));
  console.log(`\nTotal creators: ${creators.length}\n`);

  // Check if there are any orphaned projects
  const orphaned = await prisma.$queryRaw<any[]>`
    SELECT p.id, p.title, p.creator_id
    FROM projects p
    LEFT JOIN creators c ON p.creator_id = c.id
    WHERE c.id IS NULL
  `;

  if (orphaned.length > 0) {
    console.log('⚠️  ORPHANED PROJECTS (no matching creator):');
    console.log(JSON.stringify(orphaned, null, 2));
  } else {
    console.log('✅ No orphaned projects\n');
  }

  // Test Prisma queries
  console.log('🔍 TESTING PRISMA QUERIES:\n');

  const prismaProjects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      creatorId: true,
      isPublic: true,
    },
  });

  console.log('Prisma project.findMany() result:');
  console.log(JSON.stringify(prismaProjects, null, 2));

  if (projects.length > 0) {
    const firstProjectId = projects[0].id;
    console.log(`\nTesting findUnique with id: ${firstProjectId}`);

    const singleProject = await prisma.project.findUnique({
      where: { id: firstProjectId },
    });

    if (singleProject) {
      console.log('✅ findUnique succeeded');
    } else {
      console.log('❌ findUnique returned null');
    }
  }

  await prisma.$disconnect();
}

diagnose()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exit(1);
  });
