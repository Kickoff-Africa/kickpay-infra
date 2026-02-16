-- RedefineTables: add "role" to User first (no dependents on User yet)
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "accountType" TEXT NOT NULL DEFAULT 'company',
    "displayName" TEXT,
    "countryCode" TEXT,
    "accountStatus" TEXT NOT NULL DEFAULT 'pending',
    "role" TEXT NOT NULL DEFAULT 'user',
    "testSecretHash" TEXT,
    "testSecretPrefix" TEXT,
    "liveSecretHash" TEXT,
    "liveSecretPrefix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
INSERT INTO "new_User" ("accountStatus", "accountType", "countryCode", "createdAt", "displayName", "email", "id", "liveSecretHash", "liveSecretPrefix", "passwordHash", "phone", "testSecretHash", "testSecretPrefix", "updatedAt") SELECT "accountStatus", "accountType", "countryCode", "createdAt", "displayName", "email", "id", "liveSecretHash", "liveSecretPrefix", "passwordHash", "phone", "testSecretHash", "testSecretPrefix", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateTable
CREATE TABLE "VerificationSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bvn" TEXT NOT NULL,
    "tin" TEXT NOT NULL,
    "cacDocumentPath" TEXT NOT NULL,
    "additionalPaths" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VerificationSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VerificationSubmission_userId_idx" ON "VerificationSubmission"("userId");

-- CreateIndex
CREATE INDEX "VerificationSubmission_status_idx" ON "VerificationSubmission"("status");
