-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "quotation_id" UUID NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contracts_organization_id_idx" ON "contracts"("organization_id");
CREATE INDEX "contracts_opportunity_id_idx" ON "contracts"("opportunity_id");
CREATE INDEX "contracts_quotation_id_idx" ON "contracts"("quotation_id");

-- CheckConstraint (Prisma não gera CHECK constraints — adicionado manualmente,
-- refletindo exatamente a união já confirmada em contract.ts: ContractStatus)
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_status_check" CHECK ("status" IN ('draft', 'active', 'terminated'));

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
ALTER TABLE "contracts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "contracts"
  USING ("organization_id" = public.organization_id());
