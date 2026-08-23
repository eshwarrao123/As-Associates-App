import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

async function main() {
  const prisma = new PrismaClient();

  const password = 'ChangeMe@123';
  const hash = await argon2.hash(password);

  const user = await prisma.user.update({
    where: { email: 'admin@asassociates.com' },
    data: { passwordHash: hash },
  });

  console.log('✅ Password reset for:', user.email, user.employeeCode);
  console.log('New password:', password);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Reset failed:', error);
  process.exit(1);
});
