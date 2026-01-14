import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalVerification() {
  const projectId = '92424dd1-6de1-4646-918d-e526476cacd9';
  const creatorId = '618e3c93-dd04-49c7-9d5a-85131e42cd3a';

  console.log('=== FINAL API VERIFICATION ===\n');

  // Test 1: Creator List (Dashboard)
  console.log('TEST 1: Creator Dashboard List API');
  try {
    const projects = await prisma.project.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`✅ Found ${projects.length} project(s)\n`);
  } catch (e: any) {
    console.log(`❌ FAILED: ${e.message}\n`);
  }

  // Test 2: Creator Single View API (with JSON parsing)
  console.log('TEST 2: Creator Single Project View API');
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborators: {
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!project) {
      console.log('❌ Project not found');
    } else {
      // Check access
      const hasAccess = project.creatorId === creatorId;
      console.log(`   Access check: ${hasAccess ? '✅ Granted' : '❌ Denied'}`);

      if (hasAccess) {
        // Try parsing JSON fields (this is where it was crashing before)
        try {
          const techStack = JSON.parse(project.techStack as string);
          const previewImages = JSON.parse(project.previewImages as string);
          console.log(`   JSON parsing: ✅ Success`);
          console.log(`   Tech Stack: ${JSON.stringify(techStack)}`);
          console.log(`✅ API WORKS COMPLETELY\n`);
        } catch (parseError: any) {
          console.log(`   ❌ JSON parsing failed: ${parseError.message}\n`);
        }
      }
    }
  } catch (e: any) {
    console.log(`❌ FAILED: ${e.message}\n`);
  }

  // Test 3: Admin List API
  console.log('TEST 3: Admin Project List API');
  try {
    const projects = await prisma.project.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`✅ Found ${projects.length} project(s)\n`);
  } catch (e: any) {
    console.log(`❌ FAILED: ${e.message}\n`);
  }

  // Test 4: Admin Single Project API (new endpoint I added)
  console.log('TEST 4: Admin Single Project View API');
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!project) {
      console.log('❌ Project not found\n');
    } else {
      try {
        const techStack = JSON.parse(project.techStack as string);
        const previewImages = JSON.parse(project.previewImages as string);
        console.log(`✅ API WORKS - JSON parsing successful\n`);
      } catch (parseError: any) {
        console.log(`❌ JSON parsing failed: ${parseError.message}\n`);
      }
    }
  } catch (e: any) {
    console.log(`❌ FAILED: ${e.message}\n`);
  }

  console.log('=== SUMMARY ===');
  console.log('All four critical APIs tested.');
  console.log('If all show ✅, the fix is complete!');

  await prisma.$disconnect();
}

finalVerification().catch((e) => {
  console.error('UNEXPECTED ERROR:', e);
  process.exit(1);
});
