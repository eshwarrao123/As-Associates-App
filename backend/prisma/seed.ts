import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const firstName = process.env.SEED_ADMIN_FIRST_NAME ?? 'Admin';
  const lastName = process.env.SEED_ADMIN_LAST_NAME ?? 'User';

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env',
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user ${email} already exists — skipping seed.`);
    return;
  }

  const passwordHash = await argon2.hash(password);

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'ADMIN',
      status: 'ACTIVE',
      employeeCode: 'ASA-ADMIN-001',
      mustChangePassword: true,
    },
  });

  console.log(`✅ Admin user created: ${admin.email} (${admin.id})`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
