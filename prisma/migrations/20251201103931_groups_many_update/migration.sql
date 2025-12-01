-- CreateTable
CREATE TABLE "subscriber_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriberId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriber_groups_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "subscribers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subscriber_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_groups_subscriberId_groupId_key" ON "subscriber_groups"("subscriberId", "groupId");
