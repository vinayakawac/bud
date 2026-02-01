-- Add soft-delete support to key tables
-- This migration adds deletedAt columns for safe deletion

-- Projects soft delete
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Create index for efficient filtering of non-deleted records
CREATE INDEX IF NOT EXISTS "projects_deletedAt_idx" ON "projects"("deletedAt") WHERE "deletedAt" IS NULL;

-- Comments soft delete
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "comments_deletedAt_idx" ON "comments"("deletedAt") WHERE "deletedAt" IS NULL;

-- Ratings soft delete
ALTER TABLE "ratings" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "ratings_deletedAt_idx" ON "ratings"("deletedAt") WHERE "deletedAt" IS NULL;

-- Creators soft delete (for deactivating accounts)
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "deactivatedReason" TEXT;
CREATE INDEX IF NOT EXISTS "creators_deletedAt_idx" ON "creators"("deletedAt") WHERE "deletedAt" IS NULL;
