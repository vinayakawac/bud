/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `creators` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `creators` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add the column as nullable first
ALTER TABLE "creators" ADD COLUMN "username" TEXT;

-- Step 2: Set username to 'vinayakawac' for existing user (you can update this based on their email)
UPDATE "creators" SET "username" = 'vinayakawac' WHERE "username" IS NULL;

-- Step 3: Make the column NOT NULL
ALTER TABLE "creators" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "creators_username_key" ON "creators"("username");

-- CreateIndex
CREATE INDEX "creators_username_idx" ON "creators"("username");
