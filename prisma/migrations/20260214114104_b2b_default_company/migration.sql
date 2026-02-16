-- RedefineTables
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'company',
    "displayName" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
INSERT INTO "new_User" ("accountType", "countryCode", "createdAt", "displayName", "email", "id", "phone", "updatedAt") SELECT "accountType", "countryCode", "createdAt", "displayName", "email", "id", "phone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
