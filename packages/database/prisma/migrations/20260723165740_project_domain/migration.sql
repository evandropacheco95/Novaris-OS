-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tasks_status_check" CHECK ("status" IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- CreateIndex
CREATE INDEX "projects_organization_id_idx" ON "projects"("organization_id");

-- CreateIndex
CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
-- Achado real registrado (DATABASE_ARCHITECTURE.md § 7): o role `postgres`
-- usado pelo Prisma tem `rolbypassrls = true` — RLS não protege esta API,
-- isolamento real é reforçado em código (Controller).
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "projects"
  USING ("organization_id" = public.organization_id());

ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "tasks"
  USING (
    EXISTS (
      SELECT 1 FROM "projects"
      WHERE "projects"."id" = "tasks"."project_id"
      AND "projects"."organization_id" = public.organization_id()
    )
  );
