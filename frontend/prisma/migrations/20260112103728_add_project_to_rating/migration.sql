/*
  Warnings:

  - Added the required column `project_id` to the `ratings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ratings" ADD COLUMN     "project_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ratings_project_id_idx" ON "ratings"("project_id");

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
