-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_emails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gmailId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT,
    "snippet" TEXT,
    "body" TEXT,
    "bodyText" TEXT,
    "receivedAt" DATETIME NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_emails" ("body", "bodyText", "createdAt", "from", "gmailId", "id", "isRead", "lastSyncedAt", "receivedAt", "snippet", "subject", "syncedAt", "threadId", "to", "updatedAt") SELECT "body", "bodyText", "createdAt", "from", "gmailId", "id", "isRead", "lastSyncedAt", "receivedAt", "snippet", "subject", "syncedAt", "threadId", "to", "updatedAt" FROM "emails";
DROP TABLE "emails";
ALTER TABLE "new_emails" RENAME TO "emails";
CREATE UNIQUE INDEX "emails_gmailId_key" ON "emails"("gmailId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
