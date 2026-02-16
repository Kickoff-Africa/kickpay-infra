/*
  Warnings:

  - You are about to drop the `OnboardingProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OnboardingProfile";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
