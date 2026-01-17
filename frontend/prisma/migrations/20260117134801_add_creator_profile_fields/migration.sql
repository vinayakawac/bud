-- AlterTable
ALTER TABLE "creators" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "pronouns" TEXT,
ADD COLUMN     "show_local_time" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "social_links" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "website" TEXT;
