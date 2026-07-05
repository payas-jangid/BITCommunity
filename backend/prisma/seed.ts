import { PrismaClient } from "@prisma/client";
import process = require("process");
const prisma = new PrismaClient();

async function main() {
  console.log("started database seeding...");

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Message", "Announcements", "ChatRoom", "User" RESTART IDENTITY CASCADE;`,
  );
  await prisma.message.deleteMany();
  await prisma.announcements.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.user.deleteMany();

  const adminUser = await prisma.user.create({
    data: {
      name: "ACM Club Admin",
      email: "btech10001.24@bitmesra.ac.in",
      ClerkId: "mock_id",
      branch: "cse",
      role: "Club_admin",
    },
  });

  await prisma.chatRoom.createMany({
    data: [
      { name: "global", type: "GLOBAL" },
      { name: "k23", type: "BATCH" },
      { name: "branch-cse", type: "BATCH" },
    ],
  });

  await prisma.announcements.create({
    data: {
      title: "ACM Hackathon 2026",
      description:
        "Join us for the annual campus hackathon! Registrations open tonight.",
      tag: "WORKSHOP",
      eventDate: "July 10, 2026",
      eventTime: "10:00 AM",
      authorId: adminUser.id,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
