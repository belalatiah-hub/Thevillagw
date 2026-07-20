-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('META', 'FACEBOOK_LEAD_ADS', 'INSTAGRAM_LEAD_ADS', 'GOOGLE_ADS', 'GOOGLE_DRIVE', 'GOOGLE_SHEETS', 'GOOGLE_CALENDAR', 'GOOGLE_CONTACTS', 'GOOGLE_MAPS', 'TIKTOK_LEADS', 'TIKTOK_BUSINESS', 'WHATSAPP_CLOUD', 'SMTP', 'TWILIO', 'FIREBASE');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('DISCONNECTED', 'CONNECTED', 'ERROR', 'SYNCING');

-- CreateEnum
CREATE TYPE "IntegrationAuthType" AS ENUM ('OAUTH2', 'API_KEY', 'WEBHOOK', 'SMTP_CREDS');

-- CreateEnum
CREATE TYPE "SyncDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SUCCESS', 'FAILED', 'RETRYING');

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "authType" "IntegrationAuthType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "secretEnc" TEXT,
    "secretHint" TEXT,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "health" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSyncLog" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "direction" "SyncDirection" NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "summary" TEXT NOT NULL,
    "records" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Integration_companyId_status_idx" ON "Integration"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_companyId_provider_key" ON "Integration"("companyId", "provider");

-- CreateIndex
CREATE INDEX "IntegrationSyncLog_integrationId_createdAt_idx" ON "IntegrationSyncLog"("integrationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
