-- CreateTable
CREATE TABLE "opportunities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "pipeline_id" UUID,
    "current_stage_id" UUID,
    "status" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pipeline_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "opportunity_id" UUID NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opportunities_organization_id_idx" ON "opportunities"("organization_id");

-- CreateIndex
CREATE INDEX "opportunities_party_id_idx" ON "opportunities"("party_id");

-- CreateIndex
CREATE INDEX "opportunities_pipeline_id_idx" ON "opportunities"("pipeline_id");

-- CreateIndex
CREATE INDEX "pipelines_organization_id_idx" ON "pipelines"("organization_id");

-- CreateIndex
CREATE INDEX "stages_pipeline_id_idx" ON "stages"("pipeline_id");

-- CreateIndex
CREATE INDEX "proposals_opportunity_id_idx" ON "proposals"("opportunity_id");

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraint (Prisma não gera CHECK constraints — adicionado manualmente,
-- refletindo exatamente os enums já confirmados no código real:
-- OpportunityStatus em opportunity.ts, ProposalStatus em proposal.ts)
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_status_check" CHECK ("status" IN ('open', 'won', 'lost'));
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_status_check" CHECK ("status" IN ('pending', 'approved'));

-- Row Level Security (knowledge/core/DATABASE_ARCHITECTURE.md § 7 — "RLS habilitado
-- por padrão em toda tabela multi-tenant... policy base: organization_id = auth.organization_id").
-- Prisma não gerencia RLS (ADR-0005) — aplicado aqui via SQL bruto, na mesma migration.
--
-- `public.organization_id()` implementa tecnicamente a convenção já congelada,
-- lendo o claim customizado "organization_id" do JWT da sessão Supabase (padrão
-- oficial do Supabase para claims customizados). Este claim precisa ser
-- populado pelo Identity/Auth domain no momento do login — não é responsabilidade
-- do Sales Domain, e não é implementado por esta migration.
CREATE OR REPLACE FUNCTION public.organization_id() RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json ->> 'organization_id', '')::UUID;
$$;

ALTER TABLE "opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "proposals" ENABLE ROW LEVEL SECURITY;

-- opportunities/pipelines têm organization_id direto — policy direta.
CREATE POLICY "tenant_isolation" ON "opportunities"
  USING ("organization_id" = public.organization_id());

CREATE POLICY "tenant_isolation" ON "pipelines"
  USING ("organization_id" = public.organization_id());

-- stages/proposals são Internal Entities sem organization_id próprio — isolamento
-- via join ao Aggregate Root que as possui (mesma fronteira já usada pelo Domain
-- Model: Stage pertence a Pipeline, Proposal pertence a Opportunity).
CREATE POLICY "tenant_isolation" ON "stages"
  USING (EXISTS (
    SELECT 1 FROM "pipelines"
    WHERE "pipelines"."id" = "stages"."pipeline_id"
      AND "pipelines"."organization_id" = public.organization_id()
  ));

CREATE POLICY "tenant_isolation" ON "proposals"
  USING (EXISTS (
    SELECT 1 FROM "opportunities"
    WHERE "opportunities"."id" = "proposals"."opportunity_id"
      AND "opportunities"."organization_id" = public.organization_id()
  ));
