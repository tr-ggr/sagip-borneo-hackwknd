-- CreateEnum
CREATE TYPE "TriageCategory" AS ENUM ('MEDICAL', 'TRAPPED', 'FLOOD_WATER', 'INFRASTRUCTURE_DAMAGE', 'OTHER');

-- AlterTable
ALTER TABLE "HelpRequest" ADD COLUMN     "triageCategory" "TriageCategory";
