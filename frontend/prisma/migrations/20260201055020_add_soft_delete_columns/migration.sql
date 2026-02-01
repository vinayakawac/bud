/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `deactivatedReason` on the `creators` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `creators` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `ratings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comments" DROP COLUMN "deletedAt",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "creators" DROP COLUMN "deactivatedReason",
DROP COLUMN "deletedAt",
ADD COLUMN     "deactivated_reason" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "deletedAt",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ratings" DROP COLUMN "deletedAt",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "comments_deleted_at_idx" ON "comments"("deleted_at");

-- CreateIndex
CREATE INDEX "creators_deleted_at_idx" ON "creators"("deleted_at");

-- CreateIndex
CREATE INDEX "projects_deleted_at_idx" ON "projects"("deleted_at");

-- CreateIndex
CREATE INDEX "ratings_deleted_at_idx" ON "ratings"("deleted_at");
