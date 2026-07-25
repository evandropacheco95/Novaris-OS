-- CreateTable
CREATE TABLE "audit_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "target_type" VARCHAR(100) NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "occurred_at" TIMESTAMPTZ NOT NULL,
    "origin" VARCHAR(255) NOT NULL,
    "change_set" JSONB,

    CONSTRAINT "audit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_entries_organization_id_idx" ON "audit_entries"("organization_id");

-- CreateIndex
CREATE INDEX "audit_entries_target_id_target_type_idx" ON "audit_entries"("target_id", "target_type");

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
-- Achado real registrado (DATABASE_ARCHITECTURE.md § 7): o role `postgres`
-- usado pelo Prisma tem `rolbypassrls = true` — RLS não protege esta API,
-- isolamento real é reforçado em código (Controller).
ALTER TABLE "audit_entries" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "audit_entries"
  USING ("organization_id" = public.organization_id());

-- Sem gatilho de "updated_at": "audit_entries" é write-once por design
-- (AuditEntry é imutável, AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 7-8) — nenhuma
-- linha desta tabela é atualizada após inserida.
