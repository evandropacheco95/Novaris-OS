-- CreateTable
CREATE TABLE "calendar_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "location" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "calendar_events_organization_id_idx" ON "calendar_events"("organization_id");
CREATE INDEX "calendar_events_party_id_idx" ON "calendar_events"("party_id");

ALTER TABLE "calendar_events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "calendar_events"
  USING ("organization_id" = public.organization_id());

-- CreateTable
CREATE TABLE "reminders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "remind_at" TIMESTAMPTZ NOT NULL,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reminders_organization_id_idx" ON "reminders"("organization_id");
CREATE INDEX "reminders_party_id_idx" ON "reminders"("party_id");

ALTER TABLE "reminders" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "reminders"
  USING ("organization_id" = public.organization_id());

-- CreateTable
CREATE TABLE "checklists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "checklists_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "checklists_organization_id_idx" ON "checklists"("organization_id");
CREATE INDEX "checklists_party_id_idx" ON "checklists"("party_id");

ALTER TABLE "checklists" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "checklists"
  USING ("organization_id" = public.organization_id());

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "checklist_id" UUID NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "checklist_items_checklist_id_idx" ON "checklist_items"("checklist_id");

ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "checklist_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "checklist_items"
  USING (EXISTS (SELECT 1 FROM "checklists" WHERE "checklists"."id" = "checklist_items"."checklist_id" AND "checklists"."organization_id" = public.organization_id()));
