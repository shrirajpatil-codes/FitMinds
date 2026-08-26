const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to PostgreSQL via Prisma Client...');
    const count = await prisma.user.count();
    console.log(`✅ Prisma connected successfully! Current User count: ${count}`);
  } catch (error) {
    console.error('❌ Prisma test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
