-- CreateTable
CREATE TABLE "OnboardingProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountType" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
