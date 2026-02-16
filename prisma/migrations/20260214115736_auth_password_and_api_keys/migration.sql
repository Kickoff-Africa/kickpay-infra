/*
  Warnings:

  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'company',
    "displayName" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "accountStatus" TEXT NOT NULL DEFAULT 'pending',
    "testSecretHash" TEXT,
    "testSecretPrefix" TEXT,
    "liveSecretHash" TEXT,
    "liveSecretPrefix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
INSERT INTO "new_User" ("id", "email", "passwordHash", "phone", "accountType", "displayName", "countryCode", "accountStatus", "createdAt", "updatedAt")
SELECT "id", "email", '', "phone", "accountType", "displayName", "countryCode", 'pending', "createdAt", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
