-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderGroupId" TEXT,
    "title" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "activeSubscribers" INTEGER NOT NULL DEFAULT 0,
    "unsubscribedCount" INTEGER NOT NULL DEFAULT 0,
    "bouncedCount" INTEGER NOT NULL DEFAULT 0,
    "phoneCount" INTEGER NOT NULL DEFAULT 0,
    "activePhoneCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "syncedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderCampaignId" TEXT,
    "blogId" TEXT,
    "title" TEXT,
    "subject" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "preheader" TEXT,
    "replyTo" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'html',
    "content" TEXT NOT NULL,
    "googleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "autoFollowupActive" BOOLEAN NOT NULL DEFAULT false,
    "autoFollowupSubject" TEXT,
    "autoFollowupDelay" INTEGER,
    "groups" TEXT,
    "segments" TEXT,
    "groupId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduleTime" DATETIME,
    "sentTime" DATETIME,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "opens" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "bouncesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "syncedAt" DATETIME,
    CONSTRAINT "campaigns_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "campaigns_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_campaigns" ("autoFollowupActive", "autoFollowupDelay", "autoFollowupSubject", "blogId", "bouncesCount", "clicks", "content", "contentType", "createdAt", "from", "googleAnalytics", "groups", "id", "opens", "preheader", "recipientCount", "replyTo", "scheduleTime", "segments", "senderCampaignId", "sentCount", "sentTime", "status", "subject", "syncedAt", "title", "updatedAt") SELECT "autoFollowupActive", "autoFollowupDelay", "autoFollowupSubject", "blogId", "bouncesCount", "clicks", "content", "contentType", "createdAt", "from", "googleAnalytics", "groups", "id", "opens", "preheader", "recipientCount", "replyTo", "scheduleTime", "segments", "senderCampaignId", "sentCount", "sentTime", "status", "subject", "syncedAt", "title", "updatedAt" FROM "campaigns";
DROP TABLE "campaigns";
ALTER TABLE "new_campaigns" RENAME TO "campaigns";
CREATE UNIQUE INDEX "campaigns_senderCampaignId_key" ON "campaigns"("senderCampaignId");
CREATE TABLE "new_subscribers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedToSender" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "groupId" TEXT,
    CONSTRAINT "subscribers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_subscribers" ("email", "id", "status", "subscribedAt", "syncedToSender") SELECT "email", "id", "status", "subscribedAt", "syncedToSender" FROM "subscribers";
DROP TABLE "subscribers";
ALTER TABLE "new_subscribers" RENAME TO "subscribers";
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "groups_senderGroupId_key" ON "groups"("senderGroupId");
