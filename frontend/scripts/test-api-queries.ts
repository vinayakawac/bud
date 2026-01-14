import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPIs() {
  const projectId = '92424dd1-6de1-4646-918d-e526476cacd9';
  const creatorId = '618e3c93-dd04-49c7-9d5a-85131e42cd3a';

  console.log('=== TESTING API QUERIES ===\n');
  console.log(`Project ID: ${projectId}`);
  console.log(`Creator ID: ${creatorId}\n`);

  // Test 1: Find project by ID only (admin view)
  console.log('TEST 1: Admin query (no filters)');
  const adminQuery = await prisma.project.findUnique({
    where: { id: projectId },
  });
  console.log(adminQuery ? '✅ SUCCESS' : '❌ FAILED');
  console.log(JSON.stringify(adminQuery, null, 2));
  console.log('\n');

  // Test 2: Find project with collaborator check
  console.log('TEST 2: Check if creator has access (canEditProject logic)');
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { creatorId: true },
  });

  if (project) {
    const isPrimaryCreator = project.creatorId === creatorId;
    console.log(`Is primary creator: ${isPrimaryCreator}`);

    const collaborator = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        creatorId,
      },
    });
    console.log(`Is collaborator: ${!!collaborator}`);
    console.log(`Has access: ${isPrimaryCreator || !!collaborator ? '✅ YES' : '❌ NO'}`);
  } else {
    console.log('❌ Project not found');
  }
  console.log('\n');

  // Test 3: List projects by creator (dashboard query)
  console.log('TEST 3: Creator dashboard list (by creatorId)');
  const listQuery = await prisma.project.findMany({
    where: { creatorId },
  });
  console.log(`Found ${listQuery.length} projects`);
  console.log(listQuery.length > 0 ? '✅ SUCCESS' : '❌ FAILED');

  await prisma.$disconnect();
}

testAPIs().catch((e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
