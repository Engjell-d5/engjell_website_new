/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `social_posts` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_social_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "mediaAssets" TEXT,
    "platforms" TEXT NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "publishedOn" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);
INSERT INTO "new_social_posts" ("content", "createdAt", "createdBy", "errorMessage", "id", "platforms", "publishedAt", "publishedOn", "scheduledFor", "status", "updatedAt") SELECT "content", "createdAt", "createdBy", "errorMessage", "id", "platforms", "publishedAt", "publishedOn", "scheduledFor", "status", "updatedAt" FROM "social_posts";
DROP TABLE "social_posts";
ALTER TABLE "new_social_posts" RENAME TO "social_posts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
