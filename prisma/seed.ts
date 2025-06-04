import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create a demo user
  const hashedPassword = "demo123456";

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      username: "demo",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  console.log("👤 Created demo user:", demoUser.email);

  // Create sample habits
  const sampleHabits = [
    {
      title: "Drink Water",
      description: "Drink at least 8 glasses of water daily",
      color: "#3B82F6",
    },
    {
      title: "Exercise",
      description: "30 minutes of physical activity",
      color: "#10B981",
    },
    {
      title: "Read",
      description: "Read for at least 20 minutes",
      color: "#F59E0B",
    },
    {
      title: "Meditate",
      description: "10 minutes of mindfulness meditation",
      color: "#8B5CF6",
    },
  ];

  for (const habitData of sampleHabits) {
    const habit = await prisma.habit.upsert({
      where: {
        userId_title: {
          userId: demoUser.id,
          title: habitData.title,
        },
      },
      update: {},
      create: {
        ...habitData,
        userId: demoUser.id,
      },
    });
    console.log(`📝 Created habit: ${habit.title}`);
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
