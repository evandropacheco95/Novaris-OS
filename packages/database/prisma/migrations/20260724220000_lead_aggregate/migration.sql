-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "company" VARCHAR(255),
    "source" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL,
    "converted_party_id" UUID,
    "converted_opportunity_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_organization_id_idx" ON "leads"("organization_id");

-- CheckConstraint (Prisma não gera CHECK constraints — adicionado manualmente,
-- refletindo exatamente a união já confirmada em lead.ts: LeadStatus)
ALTER TABLE "leads" ADD CONSTRAINT "leads_status_check" CHECK ("status" IN ('new', 'contacted', 'qualified', 'unqualified', 'converted'));

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "leads"
  USING ("organization_id" = public.organization_id());
