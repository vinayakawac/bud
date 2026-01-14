-- CreateTable
CREATE TABLE "project_collaborators" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "role" TEXT DEFAULT 'collaborator',
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaboration_invites" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),

    CONSTRAINT "collaboration_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_collaborators_project_id_idx" ON "project_collaborators"("project_id");

-- CreateIndex
CREATE INDEX "project_collaborators_creator_id_idx" ON "project_collaborators"("creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_collaborators_project_id_creator_id_key" ON "project_collaborators"("project_id", "creator_id");

-- CreateIndex
CREATE INDEX "collaboration_invites_receiver_id_status_idx" ON "collaboration_invites"("receiver_id", "status");

-- CreateIndex
CREATE INDEX "collaboration_invites_project_id_idx" ON "collaboration_invites"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "collaboration_invites_project_id_receiver_id_key" ON "collaboration_invites"("project_id", "receiver_id");

-- AddForeignKey
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_invites" ADD CONSTRAINT "collaboration_invites_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_invites" ADD CONSTRAINT "collaboration_invites_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
