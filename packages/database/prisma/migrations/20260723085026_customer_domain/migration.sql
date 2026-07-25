-- CreateTable
CREATE TABLE "parties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "party_type" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "document" VARCHAR(32),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "parties_party_type_check" CHECK ("party_type" IN ('person', 'external_organization'))
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "party_id_a" UUID NOT NULL,
    "party_id_b" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "relationships_type_check" CHECK ("type" IN ('cliente', 'fornecedor', 'parceiro', 'prospect', 'investidor', 'colaborador'))
);

-- CreateIndex
CREATE INDEX "parties_organization_id_idx" ON "parties"("organization_id");

-- CreateIndex
CREATE INDEX "relationships_organization_id_idx" ON "relationships"("organization_id");

-- CreateIndex
CREATE INDEX "relationships_party_id_a_idx" ON "relationships"("party_id_a");

-- CreateIndex
CREATE INDEX "relationships_party_id_b_idx" ON "relationships"("party_id_b");

-- RLS: mesmo padrão já usado para Sales/Identity — função pública
-- `public.organization_id()` já existe (criada por `init_sales_domain`),
-- reaproveitada aqui, não recriada. Achado real registrado em
-- DATABASE_ARCHITECTURE.md § 7: o role `postgres` (usado pelo Prisma) tem
-- `rolbypassrls = true`, então RLS não protege esta API — isolamento real
-- é reforçado em código (Controller), mesmo padrão de `OpportunityController`.
ALTER TABLE "parties" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "parties"
  USING ("organization_id" = public.organization_id());

ALTER TABLE "relationships" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "relationships"
  USING ("organization_id" = public.organization_id());
