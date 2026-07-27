-- ADR-0051: Pipeline ganha `name` (multi-pipeline nomeado por Organização),
-- Stage ganha `order` (reorder via drag-and-drop). Seguro sem default/backfill —
-- confirmado via query real no Postgres de produção: 0 linhas em "pipelines"/
-- "stages" antes desta migration (nenhum Controller jamais existiu para criar uma).

-- AlterTable
ALTER TABLE "pipelines" ADD COLUMN "name" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "stages" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;
