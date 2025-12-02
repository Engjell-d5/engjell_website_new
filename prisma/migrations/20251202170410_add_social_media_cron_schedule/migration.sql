-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeApiKey" TEXT NOT NULL DEFAULT '',
    "youtubeChannelId" TEXT NOT NULL DEFAULT '',
    "cronSchedule" TEXT NOT NULL DEFAULT '0 2 * * *',
    "socialMediaCronSchedule" TEXT NOT NULL DEFAULT '*/5 * * * *',
    "lastVideoFetch" DATETIME
);
INSERT INTO "new_config" ("cronSchedule", "id", "lastVideoFetch", "youtubeApiKey", "youtubeChannelId") SELECT "cronSchedule", "id", "lastVideoFetch", "youtubeApiKey", "youtubeChannelId" FROM "config";
DROP TABLE "config";
ALTER TABLE "new_config" RENAME TO "config";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
