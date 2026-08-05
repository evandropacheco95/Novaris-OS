-- ADR-0052: SalesChannel como Aggregate Root de configuracao do Sales Domain,
-- referencia real: Winnet (industria+ecommerce, ENG-0166). 4 tipos confirmados
-- pelo CTO (direct/distributor/marketplace/online_store), nenhum inventado.

-- CreateTable
CREATE TABLE "sales_channels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sales_channels_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sales_channels_type_check" CHECK ("type" IN ('direct', 'distributor', 'marketplace', 'online_store'))
);

CREATE INDEX "sales_channels_organization_id_idx" ON "sales_channels"("organization_id");

-- RLS — mesmo padrao ja usado em toda tabela desta base (defesa em profundidade
-- inerte, RLS nao protege nada nesta API por rolbypassrls=true, ENG-0122).
ALTER TABLE "sales_channels" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "sales_channels"
  USING ("organization_id" = public.organization_id());

-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN "sales_channel_id" UUID;
CREATE INDEX "opportunities_sales_channel_id_idx" ON "opportunities"("sales_channel_id");
