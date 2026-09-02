-- DropForeignKey
ALTER TABLE "campaign_assets" DROP CONSTRAINT "campaign_assets_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "quotation_line_items" DROP CONSTRAINT "quotation_line_items_quotation_id_fkey";

-- DropForeignKey
ALTER TABLE "widgets" DROP CONSTRAINT "widgets_dashboard_id_fkey";

-- AlterTable
ALTER TABLE "advertising_accounts" ADD COLUMN     "encrypted_refresh_token" TEXT;

-- CreateTable
CREATE TABLE "advertising_ad_campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "advertising_account_id" UUID NOT NULL,
    "external_campaign_id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "channel_type" VARCHAR(50) NOT NULL,
    "last_cost_micros" BIGINT NOT NULL DEFAULT 0,
    "last_clicks" INTEGER NOT NULL DEFAULT 0,
    "last_impressions" INTEGER NOT NULL DEFAULT 0,
    "last_conversions" INTEGER NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "advertising_ad_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising_ad_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "advertising_account_id" UUID NOT NULL,
    "ad_campaign_id" UUID NOT NULL,
    "external_ad_group_id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "last_synced_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "advertising_ad_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising_keywords" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "advertising_account_id" UUID NOT NULL,
    "ad_group_id" UUID NOT NULL,
    "external_criterion_id" VARCHAR(255) NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "match_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "quality_score" INTEGER,
    "last_cost_micros" BIGINT NOT NULL DEFAULT 0,
    "last_clicks" INTEGER NOT NULL DEFAULT 0,
    "last_impressions" INTEGER NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "advertising_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising_search_terms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "advertising_account_id" UUID NOT NULL,
    "ad_group_id" UUID NOT NULL,
    "sync_run_id" UUID NOT NULL,
    "search_term" VARCHAR(500) NOT NULL,
    "date_range_start" DATE NOT NULL,
    "date_range_end" DATE NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "cost_micros" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "advertising_search_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising_sync_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "advertising_account_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'RUNNING',
    "started_at" TIMESTAMPTZ NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "error_message" TEXT,
    "campaigns_synced" INTEGER NOT NULL DEFAULT 0,
    "ad_groups_synced" INTEGER NOT NULL DEFAULT 0,
    "keywords_synced" INTEGER NOT NULL DEFAULT 0,
    "search_terms_synced" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "advertising_sync_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "advertising_ad_campaigns_organization_id_idx" ON "advertising_ad_campaigns"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "advertising_ad_campaigns_advertising_account_id_external_ca_key" ON "advertising_ad_campaigns"("advertising_account_id", "external_campaign_id");

-- CreateIndex
CREATE INDEX "advertising_ad_groups_organization_id_idx" ON "advertising_ad_groups"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "advertising_ad_groups_advertising_account_id_external_ad_gr_key" ON "advertising_ad_groups"("advertising_account_id", "external_ad_group_id");

-- CreateIndex
CREATE INDEX "advertising_keywords_organization_id_idx" ON "advertising_keywords"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "advertising_keywords_advertising_account_id_external_criter_key" ON "advertising_keywords"("advertising_account_id", "external_criterion_id");

-- CreateIndex
CREATE INDEX "advertising_search_terms_organization_id_idx" ON "advertising_search_terms"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "advertising_search_terms_advertising_account_id_ad_group_id_key" ON "advertising_search_terms"("advertising_account_id", "ad_group_id", "search_term", "date_range_start", "date_range_end");

-- CreateIndex
CREATE INDEX "advertising_sync_runs_organization_id_idx" ON "advertising_sync_runs"("organization_id");

-- CreateIndex
CREATE INDEX "advertising_sync_runs_advertising_account_id_idx" ON "advertising_sync_runs"("advertising_account_id");

-- AddForeignKey
ALTER TABLE "campaign_assets" ADD CONSTRAINT "campaign_assets_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line_items" ADD CONSTRAINT "quotation_line_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
