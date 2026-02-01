-- CreateTable: AuditLog for enterprise compliance
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_type" TEXT NOT NULL,
    "actor_email" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes for efficient querying
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");
CREATE INDEX "audit_logs_actor_type_idx" ON "audit_logs"("actor_type");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
