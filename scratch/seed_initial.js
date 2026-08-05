const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedInitialData() {
  console.log("🌱 Seeding clean initial data...");

  try {
    const hashedPassword = await bcrypt.hash("recruiter123", 10);

    // Create primary Recruiter/Employer account
    const recruiter = await prisma.user.create({
      data: {
        email: "recruiter@gmail.com",
        name: "Acme Tech Recruiter",
        password: hashedPassword,
        role: "EMPLOYER",
        jobsPosted: {
          create: [
            {
              title: "Senior Full Stack Engineer",
              company: "Acme Technologies",
              location: "Remote / Bengaluru, India",
              salary: "₹18,00,000 - ₹24,00,000 / yr",
              description: "We are looking for a Senior Full Stack Engineer proficient in Next.js, TypeScript, PostgreSQL, and LLM APIs to build high-performance matching algorithms.",
              isPremium: true,
              skillsRequired: ["TypeScript", "Next.js", "PostgreSQL", "Node.js", "React.js"],
              skillsNiceToHave: ["Framer Motion", "Tailwind CSS", "Vercel", "Docker"],
            },
            {
              title: "UI/UX Product Designer",
              company: "Reve Cult",
              location: "Hybrid / Mumbai, India",
              salary: "₹12,00,000 - ₹16,00,000 / yr",
              description: "Seeking a passionate UI/UX Product Designer to design beautiful, fluid interfaces and design systems using Figma, Illustrator, and Framer.",
              isPremium: false,
              skillsRequired: ["Figma", "UI/UX Design", "Illustrator"],
              skillsNiceToHave: ["Framer Motion", "CorelDraw", "Blender"],
            },
          ],
        },
      },
    });

    console.log(`✅ Recruiter account created: ${recruiter.email} (Password: recruiter123)`);
    console.log("🌱 Database seeded cleanly!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedInitialData();
