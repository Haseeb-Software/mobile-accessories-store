/**
 * Usage: npm run create-admin -- "Your Name" "you@store.com" "StrongPass123!"
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
console.log("RAW ARGS:", process.argv);
const prisma = new PrismaClient();

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Usage: npm run create-admin -- "Full Name" "you@store.com" "StrongPass123!"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.error(`An admin with email ${email} already exists. Delete it in Prisma Studio first, or use a different email.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.adminUser.create({
    data: { name, email: email.toLowerCase(), passwordHash, role: "SUPER_ADMIN" },
  });

  console.log(`Admin user created: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());