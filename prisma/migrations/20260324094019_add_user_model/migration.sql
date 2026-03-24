-- Add userId column allowing null temporarily so we can backfill existing rows
ALTER TABLE "Workout" ADD COLUMN "userId" TEXT;

-- Create the users table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Ensure email uniqueness
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Seed a placeholder user for existing workouts
INSERT INTO "User" ("id", "email", "name", "picture")
VALUES ('legacy-user', 'legacy@example.com', 'Legacy User', NULL)
ON CONFLICT ("id") DO NOTHING;

-- Backfill existing workouts to reference the placeholder user
UPDATE "Workout" SET "userId" = 'legacy-user' WHERE "userId" IS NULL;

-- Make userId required going forward
ALTER TABLE "Workout" ALTER COLUMN "userId" SET NOT NULL;

-- Index lookups by user and day order
CREATE INDEX "Workout_userId_dayOrder_idx" ON "Workout"("userId", "dayOrder");

-- Add FK constraint
ALTER TABLE "Workout"
ADD CONSTRAINT "Workout_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
