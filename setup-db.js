const { execSync } = require('child_process');
const path = require('path');

// Set the DATABASE_URL environment variable for this process and its children
// Remote MySQL on Byethost
process.env.DATABASE_URL = 'mysql://b6_40983626:123%40Qwerty@sql307.byethost6.com:3306/b6_40983626_studycubs';

console.log('🚀 Starting StudyCubs Remote Database Setup...');
console.log('DEBUG: process.env.DATABASE_URL =', process.env.DATABASE_URL.replace(/:[^:]+@/, ':****@')); // Hide password in logs

try {
  // 1. Prisma Generate
  console.log('\n--- Step 1: Generating Prisma Client ---');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // 2. Prisma DB Push
  console.log('\n--- Step 2: Pushing Schema to Remote MySQL ---');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // 3. Prisma DB Seed
  console.log('\n--- Step 3: Seeding Demo Data to Remote MySQL ---');
  execSync('npx prisma db seed', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ Remote database setup and seeding completed successfully!');
} catch (error) {
  console.error('\n❌ Setup failed during execution.');
  process.exit(1);
}
