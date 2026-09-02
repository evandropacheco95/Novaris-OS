# Performance Intelligence — Permissions

> **Corrigido por `ADR-0060`**: a versão original deste arquivo propunha prefixo de produto (`performance-intelligence.*`). Desde `ADR-0059` (criação do Advertising Domain), a convenção real do repositório é prefixar por **domínio** (`marketing.campaigns.manage`, `sales.leads.manage` — `ADR-0036`/`ENG-0136`), não por produto — `Performance Intelligence` é Product Layer (`ADR-0058`), composição de domínios, sem namespace de Permission próprio. `advertising.ad-accounts.manage` já está implementado e em `FULL_PERMISSION_CATALOG` (`apps/api/src/seed.ts`) desde a Fase 01/02. As demais permanecem propostas, a nascer com o domínio (provavelmente `analytics.*`/`advertising.*`) quando a fase correspondente for implementada — nenhum prefixo `performance-intelligence.*` deve ser usado no código.

## Permissions

- `advertising.ad-accounts.manage` — conectar/desconectar conta, disparar sincronização. **Implementada** (Fase 01/02, Advertising Domain).
- `analytics.insights.view` (nome final a confirmar quando a Fase 06 implementar) — ver sinais, diagnósticos e recomendações (somente leitura). Proposta, não implementada.
- `advertising.recommendations.approve` (nome final a confirmar quando a Fase 09 implementar) — aprovar/rejeitar/editar recomendação. **Distinta** de `insights.view`, porque aprovar uma ação é mais sensível que só visualizar (mesmo raciocínio do `ADR-0057`: exportar dados é mais sensível que editar o próprio perfil). Proposta, não implementada.
- `advertising.recommendations.execute` (nome final a confirmar) — executar ação já aprovada. Reservada para Nível 2+ (execução após aprovação humana), nunca concedida por padrão a todo usuário com `approve`. Proposta, não implementada.

## Isolamento de tenant

Mesma exigência já documentada em `OpportunityController`/`ADR-0057`: `organizationId` extraído do token, nunca de query/body — RLS por si só não é suficiente porque a role do Prisma usada tem `rolbypassrls = true`.
