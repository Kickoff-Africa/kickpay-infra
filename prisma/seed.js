const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = "superadmin@kickpay.com";
const SUPER_ADMIN_PASSWORD = "SecurePassword@123";

async function main() {
  const passwordHash = await hash(SUPER_ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: { passwordHash, role: "super_admin" },
    create: {
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      accountType: "company",
      accountStatus: "pending",
      role: "super_admin",
    },
  });
  console.log("Super admin seeded:", SUPER_ADMIN_EMAIL);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
