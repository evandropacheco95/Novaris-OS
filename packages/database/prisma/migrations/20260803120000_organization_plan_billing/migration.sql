-- ENG-0164: Organization ganha plan/billingStatus/trialEnd/maxUsers/enabledDomains
-- (decisao direta do CTO). Backfill de linhas existentes: DEFAULT 'starter'/'trialing'
-- so para nao quebrar as Organizations ja seedadas (necessidade tecnica de migration,
-- nao um default de negocio decidido pelo Aggregate -- toda chamada de
-- Organization.create() continua exigindo plan/billingStatus explicitos).
-- maxUsers/enabledDomains sem default de negocio nenhum -- null/vazio = sem limite/
-- todos os dominios habilitados, mesmo comportamento de toda Organization anterior
-- a esta migration.

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "plan" VARCHAR(20) NOT NULL DEFAULT 'starter';
ALTER TABLE "organizations" ADD COLUMN "billing_status" VARCHAR(20) NOT NULL DEFAULT 'trialing';
ALTER TABLE "organizations" ADD COLUMN "trial_end" TIMESTAMPTZ;
ALTER TABLE "organizations" ADD COLUMN "max_users" INTEGER;
ALTER TABLE "organizations" ADD COLUMN "enabled_domains" TEXT[] NOT NULL DEFAULT '{}';

-- CHECK constraints, mesmo padrao de "organizations_status_check"
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_plan_check" CHECK ("plan" IN ('starter', 'professional', 'enterprise'));
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_billing_status_check" CHECK ("billing_status" IN ('trialing', 'active', 'overdue', 'canceled'));
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_max_users_check" CHECK ("max_users" IS NULL OR "max_users" > 0);
