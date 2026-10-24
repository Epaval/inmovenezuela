import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 Diagnóstico de usuarios en la base de datos:\n');

  // 1. Todos los usuarios
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      role: true,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log(`📊 Total de usuarios: ${allUsers.length}`);
  allUsers.forEach((user, i) => {
    console.log(`\n${i + 1}. ${user.fullName} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
  });

  // 2. Solo SELLERs
  const sellers = await prisma.user.findMany({
    where: { role: 'SELLER' },
    select: { id: true, email: true, fullName: true, role: true },
  });

  console.log(`\n\n Total de SELLERs: ${sellers.length}`);
  sellers.forEach((seller, i) => {
    console.log(`${i + 1}. ${seller.fullName} - ${seller.email}`);
  });

  // 3. Solo ADMINs
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, fullName: true, role: true },
  });

  console.log(`\n👑 Total de ADMINs: ${admins.length}`);
  admins.forEach((admin, i) => {
    console.log(`${i + 1}. ${admin.fullName} - ${admin.email}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });