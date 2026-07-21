-- CreateEnum
CREATE TYPE "LookupType" AS ENUM ('CHANNEL', 'COMM_WAY', 'CANCEL_REASON', 'LEAD_STAGE', 'NEXT_ACTION');

-- CreateEnum
CREATE TYPE "LeadActionStatus" AS ENUM ('PLANNED', 'DONE', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "managerId" TEXT;

-- CreateTable
CREATE TABLE "Lookup" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "LookupType" NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lookup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadAction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "agentId" TEXT,
    "nextAction" TEXT NOT NULL,
    "stageName" TEXT,
    "dueAt" TIMESTAMP(3),
    "comment" TEXT,
    "voiceNoteUrl" TEXT,
    "rating" INTEGER,
    "status" "LeadActionStatus" NOT NULL DEFAULT 'PLANNED',
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lookup_companyId_type_idx" ON "Lookup"("companyId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_companyId_type_name_key" ON "Lookup"("companyId", "type", "name");

-- CreateIndex
CREATE INDEX "LeadAction_companyId_createdAt_idx" ON "LeadAction"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadAction_leadId_createdAt_idx" ON "LeadAction"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadAction_companyId_status_dueAt_idx" ON "LeadAction"("companyId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "LeadAction_agentId_status_idx" ON "LeadAction"("agentId", "status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lookup" ADD CONSTRAINT "Lookup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAction" ADD CONSTRAINT "LeadAction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAction" ADD CONSTRAINT "LeadAction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAction" ADD CONSTRAINT "LeadAction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
