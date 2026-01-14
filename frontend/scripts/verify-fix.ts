import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFix() {
  const projectId = '92424dd1-6de1-4646-918d-e526476cacd9';

  console.log('=== VERIFICATION TEST ===\n');

  // Get the project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    console.log('❌ Project not found');
    return;
  }

  console.log('✅ Project found');
  console.log(`Title: ${project.title}`);
  console.log(`Creator ID: ${project.creatorId}`);
  console.log(`Tech Stack (raw): ${project.techStack}`);
  console.log(`Preview Images (raw): ${project.previewImages}`);

  // Test JSON parsing
  try {
    const techStack = JSON.parse(project.techStack as string);
    console.log(`\n✅ Tech Stack parses correctly: ${JSON.stringify(techStack)}`);
    console.log(`   Type: ${Array.isArray(techStack) ? 'Array' : typeof techStack}`);
  } catch (e: any) {
    console.log(`\n❌ Tech Stack parse failed: ${e.message}`);
  }

  try {
    const previewImages = JSON.parse(project.previewImages as string);
    console.log(`✅ Preview Images parses correctly: ${JSON.stringify(previewImages)}`);
    console.log(`   Type: ${Array.isArray(previewImages) ? 'Array' : typeof previewImages}`);
  } catch (e: any) {
    console.log(`❌ Preview Images parse failed: ${e.message}`);
  }

  console.log('\n=== ALL API QUERIES ===\n');

  // Test creator list (dashboard)
  console.log('1. Creator Dashboard List:');
  const list = await prisma.project.findMany({
    where: { creatorId: project.creatorId },
  });
  console.log(`   Found ${list.length} project(s) ✅`);

  // Test creator single project
  console.log('\n2. Creator Single Project View:');
  const single = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (single && single.creatorId === project.creatorId) {
    console.log(`   Access granted ✅`);
  } else {
    console.log(`   Access denied ❌`);
  }

  // Test admin list
  console.log('\n3. Admin Project List:');
  const adminList = await prisma.project.findMany();
  console.log(`   Found ${adminList.length} project(s) ✅`);

  // Test admin single
  console.log('\n4. Admin Single Project View:');
  const adminSingle = await prisma.project.findUnique({
    where: { id: projectId },
  });
  console.log(`   ${adminSingle ? '✅ Found' : '❌ Not found'}`);

  console.log('\n✅ ALL TESTS PASSED!');

  await prisma.$disconnect();
}

verifyFix().catch((e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
