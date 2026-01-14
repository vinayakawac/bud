import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProject() {
  const projectId = '92424dd1-6de1-4646-918d-e526476cacd9';

  console.log('Fixing project techStack and previewImages...\n');

  // Get current project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  console.log('Current techStack:', project?.techStack);
  console.log('Current previewImages:', project?.previewImages);

  // Fix the data
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      techStack: JSON.stringify(['Python']),  // Convert to proper JSON array
      previewImages: JSON.stringify([]),  // Empty array if none
    },
  });

  console.log('\n✅ Fixed!');
  console.log('New techStack:', updated.techStack);
  console.log('New previewImages:', updated.previewImages);

  await prisma.$disconnect();
}

fixProject().catch((e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
