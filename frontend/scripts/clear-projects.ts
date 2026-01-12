import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearProjects() {
  try {
    console.log('Deleting all projects...');
    
    const result = await prisma.project.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} projects successfully`);
  } catch (error) {
    console.error('❌ Error deleting projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearProjects();
