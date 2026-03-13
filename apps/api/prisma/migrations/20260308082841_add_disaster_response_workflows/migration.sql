-- CreateEnum
CREATE TYPE "HazardType" AS ENUM ('FLOOD', 'TYPHOON', 'EARTHQUAKE', 'AFTERSHOCK');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VolunteerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "WarningStatus" AS ENUM ('DRAFT', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HelpRequestStatus" AS ENUM ('OPEN', 'CLAIMED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HelpUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('CLAIMED', 'EN_ROUTE', 'ON_SITE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PinStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED');

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocationSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "region" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLocationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskRegionSnapshot" (
    "id" TEXT NOT NULL,
    "hazardType" "HazardType" NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "radiusKm" DOUBLE PRECISION,
    "polygonGeoJson" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskRegionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VolunteerStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VolunteerStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarningEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "hazardType" "HazardType" NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "status" "WarningStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "suggestedPrompt" TEXT,
    "isManualDispatch" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarningTargetArea" (
    "id" TEXT NOT NULL,
    "warningEventId" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "radiusKm" DOUBLE PRECISION,
    "polygonGeoJson" TEXT,

    CONSTRAINT "WarningTargetArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvacuationArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvacuationArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarningEventEvacuationArea" (
    "id" TEXT NOT NULL,
    "warningEventId" TEXT NOT NULL,
    "evacuationAreaId" TEXT NOT NULL,

    CONSTRAINT "WarningEventEvacuationArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvacuationRouteSuggestion" (
    "id" TEXT NOT NULL,
    "warningEventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyId" TEXT,
    "evacuationAreaId" TEXT NOT NULL,
    "originLatitude" DOUBLE PRECISION NOT NULL,
    "originLongitude" DOUBLE PRECISION NOT NULL,
    "etaMinutes" INTEGER NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "polylineGeoJson" TEXT,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvacuationRouteSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "familyId" TEXT,
    "hazardType" "HazardType" NOT NULL,
    "urgency" "HelpUrgency" NOT NULL,
    "status" "HelpRequestStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpAssignment" (
    "id" TEXT NOT NULL,
    "helpRequestId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'CLAIMED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarningEventLog" (
    "id" TEXT NOT NULL,
    "warningEventId" TEXT NOT NULL,
    "actorId" TEXT,
    "status" "WarningStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarningEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerDecisionLog" (
    "id" TEXT NOT NULL,
    "volunteerApplicationId" TEXT NOT NULL,
    "actorId" TEXT,
    "previousStatus" "VolunteerStatus",
    "nextStatus" "VolunteerStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerDecisionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpRequestEvent" (
    "id" TEXT NOT NULL,
    "helpRequestId" TEXT NOT NULL,
    "actorId" TEXT,
    "previousStatus" "HelpRequestStatus",
    "nextStatus" "HelpRequestStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapPinStatus" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "hazardType" "HazardType" NOT NULL,
    "status" "PinStatus" NOT NULL DEFAULT 'OPEN',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "region" TEXT,
    "note" TEXT,
    "reporterId" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapPinStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Family_code_key" ON "Family"("code");

-- CreateIndex
CREATE INDEX "FamilyMember_userId_idx" ON "FamilyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_familyId_userId_key" ON "FamilyMember"("familyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocationSnapshot_userId_key" ON "UserLocationSnapshot"("userId");

-- CreateIndex
CREATE INDEX "RiskRegionSnapshot_hazardType_severity_idx" ON "RiskRegionSnapshot"("hazardType", "severity");

-- CreateIndex
CREATE INDEX "RiskRegionSnapshot_startsAt_endsAt_idx" ON "RiskRegionSnapshot"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "VolunteerApplication_userId_status_idx" ON "VolunteerApplication"("userId", "status");

-- CreateIndex
CREATE INDEX "VolunteerApplication_reviewedById_idx" ON "VolunteerApplication"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerProfile_userId_key" ON "VolunteerProfile"("userId");

-- CreateIndex
CREATE INDEX "VolunteerProfile_status_idx" ON "VolunteerProfile"("status");

-- CreateIndex
CREATE INDEX "WarningEvent_status_hazardType_severity_idx" ON "WarningEvent"("status", "hazardType", "severity");

-- CreateIndex
CREATE INDEX "WarningEvent_startsAt_endsAt_idx" ON "WarningEvent"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "WarningTargetArea_warningEventId_idx" ON "WarningTargetArea"("warningEventId");

-- CreateIndex
CREATE INDEX "EvacuationArea_region_isActive_idx" ON "EvacuationArea"("region", "isActive");

-- CreateIndex
CREATE INDEX "WarningEventEvacuationArea_evacuationAreaId_idx" ON "WarningEventEvacuationArea"("evacuationAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "WarningEventEvacuationArea_warningEventId_evacuationAreaId_key" ON "WarningEventEvacuationArea"("warningEventId", "evacuationAreaId");

-- CreateIndex
CREATE INDEX "EvacuationRouteSuggestion_warningEventId_userId_idx" ON "EvacuationRouteSuggestion"("warningEventId", "userId");

-- CreateIndex
CREATE INDEX "EvacuationRouteSuggestion_familyId_idx" ON "EvacuationRouteSuggestion"("familyId");

-- CreateIndex
CREATE INDEX "HelpRequest_requesterId_status_idx" ON "HelpRequest"("requesterId", "status");

-- CreateIndex
CREATE INDEX "HelpRequest_familyId_idx" ON "HelpRequest"("familyId");

-- CreateIndex
CREATE INDEX "HelpAssignment_helpRequestId_status_idx" ON "HelpAssignment"("helpRequestId", "status");

-- CreateIndex
CREATE INDEX "HelpAssignment_volunteerId_idx" ON "HelpAssignment"("volunteerId");

-- CreateIndex
CREATE INDEX "WarningEventLog_warningEventId_createdAt_idx" ON "WarningEventLog"("warningEventId", "createdAt");

-- CreateIndex
CREATE INDEX "VolunteerDecisionLog_volunteerApplicationId_createdAt_idx" ON "VolunteerDecisionLog"("volunteerApplicationId", "createdAt");

-- CreateIndex
CREATE INDEX "HelpRequestEvent_helpRequestId_createdAt_idx" ON "HelpRequestEvent"("helpRequestId", "createdAt");

-- CreateIndex
CREATE INDEX "MapPinStatus_status_hazardType_priority_idx" ON "MapPinStatus"("status", "hazardType", "priority");

-- CreateIndex
CREATE INDEX "MapPinStatus_region_idx" ON "MapPinStatus"("region");

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocationSnapshot" ADD CONSTRAINT "UserLocationSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerApplication" ADD CONSTRAINT "VolunteerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerApplication" ADD CONSTRAINT "VolunteerApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarningEvent" ADD CONSTRAINT "WarningEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarningTargetArea" ADD CONSTRAINT "WarningTargetArea_warningEventId_fkey" FOREIGN KEY ("warningEventId") REFERENCES "WarningEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarningEventEvacuationArea" ADD CONSTRAINT "WarningEventEvacuationArea_warningEventId_fkey" FOREIGN KEY ("warningEventId") REFERENCES "WarningEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarningEventEvacuationArea" ADD CONSTRAINT "WarningEventEvacuationArea_evacuationAreaId_fkey" FOREIGN KEY ("evacuationAreaId") REFERENCES "EvacuationArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvacuationRouteSuggestion" ADD CONSTRAINT "EvacuationRouteSuggestion_warningEventId_fkey" FOREIGN KEY ("warningEventId") REFERENCES "WarningEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvacuationRouteSuggestion" ADD CONSTRAINT "EvacuationRouteSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvacuationRouteSuggestion" ADD CONSTRAINT "EvacuationRouteSuggestion_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvacuationRouteSuggestion" ADD CONSTRAINT "EvacuationRouteSuggestion_evacuationAreaId_fkey" FOREIGN KEY ("evacuationAreaId") REFERENCES "EvacuationArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpAssignment" ADD CONSTRAINT "HelpAssignment_helpRequestId_fkey" FOREIGN KEY ("helpRequestId") REFERENCES "HelpRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpAssignment" ADD CONSTRAINT "HelpAssignment_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarningEventLog" ADD CONSTRAINT "WarningEventLog_warningEventId_fkey" FOREIGN KEY ("warningEventId") REFERENCES "WarningEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarningEventLog" ADD CONSTRAINT "WarningEventLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerDecisionLog" ADD CONSTRAINT "VolunteerDecisionLog_volunteerApplicationId_fkey" FOREIGN KEY ("volunteerApplicationId") REFERENCES "VolunteerApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerDecisionLog" ADD CONSTRAINT "VolunteerDecisionLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequestEvent" ADD CONSTRAINT "HelpRequestEvent_helpRequestId_fkey" FOREIGN KEY ("helpRequestId") REFERENCES "HelpRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequestEvent" ADD CONSTRAINT "HelpRequestEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPinStatus" ADD CONSTRAINT "MapPinStatus_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
