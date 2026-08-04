import { SetMetadata } from "@nestjs/common";

export const REQUIRED_DOMAIN_KEY = "requiredDomain";

/**
 * Marca um Controller como pertencente a um dos 10 Business Domains
 * (`ENG-0164`, fecha o gap deixado em aberto por `ENG-0164`/`architecture/multi-tenancy.md`
 * § "Tópicos a Documentar" — `enabledDomains` só era aplicado no frontend).
 * Verificado por `PlanGuard` contra `Organization.enabledDomains` — mesmas
 * chaves usadas em `apps/web/components/dashboard-shell.tsx` (`DOMAINS[].key`):
 * `Sales`/`Relationship`/`Activity`/`Project`/`Marketing`/`Financial`/`Analytics`/
 * `Workspace`/`Identity`/`System`. Aplicado no nível de classe, mesmo critério
 * de `RequirePermission` (`ADR-0036`). Controllers de Kernel/infraestrutura
 * sem produto correspondente na sidebar (`ai-runtime`, `automation-runtime`,
 * `configuration`, `feature-flags`, `files`, `integration-hub`, `monitoring`,
 * `auth`) deliberadamente não usam este decorator — não fazem parte do
 * conceito de "domínio habilitado por plano".
 */
export const RequireDomain = (domainKey: string) => SetMetadata(REQUIRED_DOMAIN_KEY, domainKey);
