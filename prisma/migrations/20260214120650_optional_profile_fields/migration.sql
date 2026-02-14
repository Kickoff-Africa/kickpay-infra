-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "accountType" TEXT NOT NULL DEFAULT 'company',
    "displayName" TEXT,
    "countryCode" TEXT,
    "accountStatus" TEXT NOT NULL DEFAULT 'pending',
    "testSecretHash" TEXT,
    "testSecretPrefix" TEXT,
    "liveSecretHash" TEXT,
    "liveSecretPrefix" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("accountStatus", "accountType", "countryCode", "createdAt", "displayName", "email", "id", "liveSecretHash", "liveSecretPrefix", "passwordHash", "phone", "testSecretHash", "testSecretPrefix", "updatedAt") SELECT "accountStatus", "accountType", "countryCode", "createdAt", "displayName", "email", "id", "liveSecretHash", "liveSecretPrefix", "passwordHash", "phone", "testSecretHash", "testSecretPrefix", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
