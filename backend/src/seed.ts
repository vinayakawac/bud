import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from './config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = 'Admin@123';
  const passwordHash = await bcrypt.hash(adminPassword, config.bcrypt.saltRounds);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@projectshowcase.com' },
    update: {},
    create: {
      email: 'admin@projectshowcase.com',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create contact info
  const contact = await prisma.contact.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'contact@projectshowcase.com',
      phone: '+1234567890',
      socialLinks: JSON.stringify({
        github: 'https://github.com/yourusername',
        linkedin: 'https://linkedin.com/in/yourusername',
        twitter: 'https://twitter.com/yourusername',
      }),
    },
  });

  console.log('✅ Contact info created');

  console.log('✨ Seeding completed!');
  console.log('\n📝 Admin Credentials:');
  console.log('Email:', admin.email);
  console.log('Password:', adminPassword);
  console.log('\n⚠️  Please change the admin password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
