-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100),
    "unit_price" DECIMAL(12,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_organization_id_idx" ON "products"("organization_id");

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "products"
  USING ("organization_id" = public.organization_id());

-- CreateTable
CREATE TABLE "quotations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quotations_organization_id_idx" ON "quotations"("organization_id");
CREATE INDEX "quotations_opportunity_id_idx" ON "quotations"("opportunity_id");

-- CheckConstraint (Prisma não gera CHECK constraints — adicionado manualmente,
-- refletindo exatamente a união já confirmada em quotation.ts: QuotationStatus)
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_status_check" CHECK ("status" IN ('draft', 'sent', 'accepted', 'rejected'));

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
ALTER TABLE "quotations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "quotations"
  USING ("organization_id" = public.organization_id());

-- CreateTable
CREATE TABLE "quotation_line_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quotation_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "quotation_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quotation_line_items_quotation_id_idx" ON "quotation_line_items"("quotation_id");

-- AddForeignKey
ALTER TABLE "quotation_line_items" ADD CONSTRAINT "quotation_line_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS: tabela filha, isolamento via join implícito com a Quotation dona (mesmo
-- padrão de "stages"/"proposals" — sem organization_id própria).
ALTER TABLE "quotation_line_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "quotation_line_items"
  USING (EXISTS (SELECT 1 FROM "quotations" WHERE "quotations"."id" = "quotation_line_items"."quotation_id" AND "quotations"."organization_id" = public.organization_id()));

-- CreateTable
CREATE TABLE "cases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(15) NOT NULL,
    "priority" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cases_organization_id_idx" ON "cases"("organization_id");
CREATE INDEX "cases_party_id_idx" ON "cases"("party_id");

-- CheckConstraint (Prisma não gera CHECK constraints — adicionado manualmente,
-- refletindo exatamente as uniões já confirmadas em case.ts: CaseStatus/CasePriority)
ALTER TABLE "cases" ADD CONSTRAINT "cases_status_check" CHECK ("status" IN ('new', 'in_progress', 'closed'));
ALTER TABLE "cases" ADD CONSTRAINT "cases_priority_check" CHECK ("priority" IN ('low', 'medium', 'high'));

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
ALTER TABLE "cases" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "cases"
  USING ("organization_id" = public.organization_id());

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "target_type" VARCHAR(50) NOT NULL,
    "target_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_organization_id_idx" ON "comments"("organization_id");
CREATE INDEX "comments_target_type_target_id_idx" ON "comments"("target_type", "target_id");

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "comments"
  USING ("organization_id" = public.organization_id());
