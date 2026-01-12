-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "author_type" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "parent_id" TEXT;

-- CreateIndex
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
