-- CreateTable
CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "trigger_event_name" VARCHAR(255) NOT NULL,
    "actions" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_rules_organization_id_idx" ON "automation_rules"("organization_id");

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
ALTER TABLE "automation_rules" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "automation_rules"
  USING ("organization_id" = public.organization_id());
