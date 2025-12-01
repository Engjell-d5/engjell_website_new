-- CreateTable
CREATE TABLE "campaigns" (
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
    CONSTRAINT "campaigns_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_senderCampaignId_key" ON "campaigns"("senderCampaignId");
