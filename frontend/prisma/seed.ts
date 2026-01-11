import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminEmail = 'admin@projectshowcase.com';
  const adminPassword = 'Admin@123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });

  console.log(`✓ Admin user created: ${adminEmail}`);

  // Create default contact info
  const existingContact = await prisma.contact.findFirst();

  if (!existingContact) {
    await prisma.contact.create({
      data: {
        email: 'contact@ohub.com',
        phone: '+1234567890',
        socialLinks: JSON.stringify({
          github: 'https://github.com',
          linkedin: 'https://linkedin.com',
          twitter: 'https://twitter.com',
        }),
      },
    });

    console.log('✓ Contact info created');
  } else {
    console.log('✓ Contact info already exists');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
