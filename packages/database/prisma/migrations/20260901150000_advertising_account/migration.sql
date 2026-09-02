-- CreateTable
CREATE TABLE "advertising_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "external_account_id" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "connection_status" VARCHAR(20) NOT NULL DEFAULT 'NOT_CONNECTED',
    "connected_at" TIMESTAMPTZ,
    "last_sync_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "advertising_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "advertising_accounts_organization_id_idx" ON "advertising_accounts"("organization_id");

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
-- Achado real registrado (DATABASE_ARCHITECTURE.md § 7): o role `postgres`
-- usado pelo Prisma tem `rolbypassrls = true` — RLS não protege esta API,
-- isolamento real é reforçado em código (Controller).
ALTER TABLE "advertising_accounts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "advertising_accounts"
  USING ("organization_id" = public.organization_id());
