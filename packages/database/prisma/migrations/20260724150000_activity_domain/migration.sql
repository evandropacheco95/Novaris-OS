-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activities_type_check" CHECK ("type" IN ('ligacao', 'whatsapp', 'email', 'reuniao', 'visita', 'nota')),
    CONSTRAINT "activities_status_check" CHECK ("status" IN ('open', 'completed'))
);

-- CreateIndex
CREATE INDEX "activities_organization_id_idx" ON "activities"("organization_id");

-- CreateIndex
CREATE INDEX "activities_party_id_idx" ON "activities"("party_id");

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
-- Achado real registrado (DATABASE_ARCHITECTURE.md § 7): o role `postgres`
-- usado pelo Prisma tem `rolbypassrls = true` — RLS não protege esta API,
-- isolamento real é reforçado em código (Controller).
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "activities"
  USING ("organization_id" = public.organization_id());
