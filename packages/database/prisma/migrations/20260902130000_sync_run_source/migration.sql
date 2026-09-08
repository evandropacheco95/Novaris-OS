-- AlterTable
ALTER TABLE "advertising_sync_runs" ADD COLUMN     "source" VARCHAR(20) NOT NULL DEFAULT 'API',
ADD COLUMN     "source_file_record_id" UUID;
