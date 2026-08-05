const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAllDatabaseData() {
  console.log("🧹 Starting database cleanup...");

  try {
    const deletedBookmarks = await prisma.bookmark.deleteMany({});
    console.log(`Deleted ${deletedBookmarks.count} bookmarks.`);

    const deletedApplications = await prisma.application.deleteMany({});
    console.log(`Deleted ${deletedApplications.count} applications.`);

    const deletedPaymentOrders = await prisma.paymentOrder.deleteMany({});
    console.log(`Deleted ${deletedPaymentOrders.count} payment orders.`);

    const deletedCandidateProfiles = await prisma.candidateProfile.deleteMany({});
    console.log(`Deleted ${deletedCandidateProfiles.count} candidate profiles.`);

    const deletedJobs = await prisma.job.deleteMany({});
    console.log(`Deleted ${deletedJobs.count} jobs.`);

    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} users.`);

    console.log("✨ Database successfully cleaned! All old test data removed.");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAllDatabaseData();
