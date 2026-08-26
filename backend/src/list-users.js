const { prisma } = require('./config/database');

async function listUsers() {
  console.log('🔍 Fetching all registered users from PostgreSQL (fitminds_db)...\n');
  const users = await prisma.user.findMany({
    include: {
      profile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Found ${users.length} user(s) in database:\n`);
  users.forEach((u, i) => {
    console.log(`--- User #${i + 1} ---`);
    console.log(`ID:            ${u.id}`);
    console.log(`Name:          ${u.name}`);
    console.log(`Email:         ${u.email}`);
    console.log(`Password Hash: ${u.passwordHash.substring(0, 25)}... (bcrypt encrypted)`);
    console.log(`Created At:    ${u.createdAt.toISOString()}`);
    console.log(`Onboarding:    ${u.profile?.onboardingCompleted ? 'Completed' : 'Pending'}`);
    console.log(`Profile Goal:  ${u.profile?.fitnessGoal || 'Not set'}`);
    console.log('');
  });
}

listUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
