-- CreateTable
CREATE TABLE "campaign_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" UUID NOT NULL,
    "file_record_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "campaign_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_assets_campaign_id_idx" ON "campaign_assets"("campaign_id");

-- AddForeignKey
ALTER TABLE "campaign_assets" ADD CONSTRAINT "campaign_assets_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS: tabela filha, isolamento via join implícito com a Campaign dona (mesmo
-- padrão de "quotation_line_items" — sem organization_id própria).
ALTER TABLE "campaign_assets" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "campaign_assets"
  USING (EXISTS (SELECT 1 FROM "campaigns" WHERE "campaigns"."id" = "campaign_assets"."campaign_id" AND "campaigns"."organization_id" = public.organization_id()));
