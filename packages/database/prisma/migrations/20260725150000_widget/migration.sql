-- CreateTable
CREATE TABLE "widgets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dashboard_id" UUID NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "metric_key" VARCHAR(100) NOT NULL,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "widgets_type_check" CHECK ("type" IN ('kpi', 'list', 'donut', 'bar'))
);

-- CreateIndex
CREATE INDEX "widgets_dashboard_id_idx" ON "widgets"("dashboard_id");

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS: tabela filha, isolamento via join implícito com o Dashboard dono (mesmo
-- padrão de "campaign_assets"/"quotation_line_items" — sem organization_id própria).
ALTER TABLE "widgets" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "widgets"
  USING (EXISTS (SELECT 1 FROM "dashboards" WHERE "dashboards"."id" = "widgets"."dashboard_id" AND "dashboards"."organization_id" = public.organization_id()));
