-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaigns_organization_id_idx" ON "campaigns"("organization_id");

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
-- Achado real registrado (DATABASE_ARCHITECTURE.md § 7): o role `postgres`
-- usado pelo Prisma tem `rolbypassrls = true` — RLS não protege esta API,
-- isolamento real é reforçado em código (Controller).
ALTER TABLE "campaigns" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "campaigns"
  USING ("organization_id" = public.organization_id());
