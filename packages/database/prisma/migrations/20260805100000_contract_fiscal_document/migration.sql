-- ADR-0053: Documento Fiscal (NFe) opcional no Contract, input manual (sem
-- integracao real com API fiscal/Bling). Escopo contido ao Sales Domain --
-- decisao explicita do CTO de nao cruzar automaticamente com o Financial
-- Domain (Invoice nao referencia Contract hoje).

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN "fiscal_document_number" VARCHAR(20);
ALTER TABLE "contracts" ADD COLUMN "fiscal_document_access_key" VARCHAR(44);
ALTER TABLE "contracts" ADD COLUMN "fiscal_document_issued_at" TIMESTAMPTZ;
