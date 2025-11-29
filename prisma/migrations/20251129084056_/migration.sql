-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "seoMetaTitle" TEXT,
    "seoMetaDescription" TEXT,
    "seoKeywords" TEXT,
    "seoOgTitle" TEXT,
    "seoOgDescription" TEXT,
    "seoOgImage" TEXT,
    "seoTwitterCard" TEXT,
    "seoTwitterTitle" TEXT,
    "seoTwitterDescription" TEXT,
    "seoTwitterImage" TEXT,
    CONSTRAINT "blogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "youtube_videos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "thumbnailUrl" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "duration" TEXT NOT NULL,
    "viewCount" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeApiKey" TEXT NOT NULL DEFAULT '',
    "youtubeChannelId" TEXT NOT NULL DEFAULT '',
    "cronSchedule" TEXT NOT NULL DEFAULT '0 2 * * *',
    "lastVideoFetch" DATETIME
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedToSender" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "podcast_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "businesses" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "biggestChallenge" TEXT NOT NULL,
    "whyPodcast" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending'
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_videos_videoId_key" ON "youtube_videos"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");
