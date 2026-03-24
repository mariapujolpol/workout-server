-- Add optional googleId column for OAuth bookkeeping
ALTER TABLE "User"
  ADD COLUMN "googleId" TEXT;

-- Create unique index for googleId
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- Ensure placeholder user exists for backfill safety
INSERT INTO "User" ("id", "email", "name", "picture")
VALUES ('legacy-user', 'legacy@example.com', 'Legacy User', NULL)
ON CONFLICT ("id") DO NOTHING;

-- Add userId to Week, backfill existing data, then enforce NOT NULL
ALTER TABLE "Week" ADD COLUMN "userId" TEXT;
UPDATE "Week" SET "userId" = 'legacy-user' WHERE "userId" IS NULL;
ALTER TABLE "Week" ALTER COLUMN "userId" SET NOT NULL;

-- Index by user and start date for planner queries
CREATE INDEX "Week_userId_startDate_idx" ON "Week"("userId", "startDate");

-- Foreign key constraint
ALTER TABLE "Week" ADD CONSTRAINT "Week_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
