-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('PLANNED', 'DONE', 'SKIPPED');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Week" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "status" "WorkoutStatus" NOT NULL DEFAULT 'PLANNED';
