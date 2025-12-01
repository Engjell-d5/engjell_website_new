-- CreateTable
CREATE TABLE "email_cron_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "schedule" TEXT NOT NULL DEFAULT '0 */6 * * *',
    "syncEmails" BOOLEAN NOT NULL DEFAULT true,
    "analyzeEmails" BOOLEAN NOT NULL DEFAULT true,
    "aiIntegrationId" TEXT,
    "lastRun" DATETIME,
    "lastSyncAt" DATETIME,
    "lastAnalyzeAt" DATETIME,
    "nextRun" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
