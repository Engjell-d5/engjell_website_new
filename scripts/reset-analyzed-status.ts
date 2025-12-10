import { prisma } from '../lib/prisma';

async function resetAnalyzedStatus() {
  try {
    // Reset analyzed status
    const analyzedResult = await prisma.email.updateMany({
      where: {},
      data: {
        isAnalyzed: false,
      },
    });

    console.log(`✅ Reset analyzed status for ${analyzedResult.count} emails`);

    // Also reset read status so emails can be analyzed
    // (analyze-all only processes unread emails)
    const readResult = await prisma.email.updateMany({
      where: {},
      data: {
        isRead: false,
      },
    });

    console.log(`✅ Reset read status for ${readResult.count} emails`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Total emails: ${analyzedResult.count}`);
    console.log(`   - All emails are now: unread and unanalyzed`);
    console.log(`\n💡 Note: The "Analyze All" button will show if there are unread, unanalyzed, relevant emails.`);
  } catch (error) {
    console.error('❌ Error resetting analyzed status:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAnalyzedStatus();
