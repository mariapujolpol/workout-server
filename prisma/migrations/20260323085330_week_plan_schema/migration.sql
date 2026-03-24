/*
  Warnings:

  - You are about to drop the column `reps` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `sets` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Workout` table. All the data in the column will be lost.
  - Added the required column `scheme` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dayLabel` to the `Workout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dayOrder` to the `Workout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekId` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_workoutId_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "reps",
DROP COLUMN "sets",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheme" TEXT NOT NULL,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "calories",
DROP COLUMN "duration",
DROP COLUMN "name",
ADD COLUMN     "dayLabel" TEXT NOT NULL,
ADD COLUMN     "dayOrder" INTEGER NOT NULL,
ADD COLUMN     "focusTag" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "weekId" TEXT NOT NULL,
ALTER COLUMN "date" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Week" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exercise_workoutId_position_idx" ON "Exercise"("workoutId", "position");

-- CreateIndex
CREATE INDEX "Workout_weekId_dayOrder_idx" ON "Workout"("weekId", "dayOrder");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
