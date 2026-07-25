-- CreateTable
CREATE TABLE "file_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(255) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_records_organization_id_idx" ON "file_records"("organization_id");

-- RLS: mesmo padrão já usado em toda tabela multi-tenant desta engenharia.
ALTER TABLE "file_records" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "file_records"
  USING ("organization_id" = public.organization_id());
