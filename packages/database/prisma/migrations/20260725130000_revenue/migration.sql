-- CreateTable
CREATE TABLE "revenues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "recognized_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "revenues_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "revenues_amount_check" CHECK ("amount" > 0)
);

-- CreateIndex
CREATE INDEX "revenues_organization_id_idx" ON "revenues"("organization_id");
CREATE INDEX "revenues_contract_id_idx" ON "revenues"("contract_id");

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
ALTER TABLE "revenues" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "revenues"
  USING ("organization_id" = public.organization_id());
