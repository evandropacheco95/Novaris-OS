# apps

## Objetivo

Aplicações do monorepo — produtos com interface própria, deployados independentemente.

## Conteúdo (Missão ENG-0000)

- [web/](web/README.md) — frontend principal (Next.js)
- [admin/](admin/README.md) — painel administrativo (Next.js)
- [api/](api/README.md) — camada de API pública/gateway

## Relação com Outros Módulos

- [knowledge/core/MONOREPO_ARCHITECTURE.md](../knowledge/core/MONOREPO_ARCHITECTURE.md) — proposta de árvore interna desta pasta (parcialmente divergente do que existe hoje; ver nota de divergência lá)
- [adr/ADR-0005](../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) — stack de frontend (Next.js/React/TypeScript) usada por `web/` e `admin/`
- [adr/](../adr/README.md) — toda decisão de arquitetura que definir o conteúdo real desta pasta deve ser registrada como ADR antes da implementação
- [engineering/decision-tree.md](../engineering/decision-tree.md) — crivo obrigatório antes do primeiro código entrar aqui

## Status

🟢 `api/` tem os 10 dos 10 Business Domains 100% expostos e protegidos por autenticação real (NestJS, JWT: Sales, Relationship, Identity, Workspace, Project, Financial, Activity, Marketing, Analytics, System). `web/` tem dashboard real de frontend (Next.js, visual do brandkit oficial aplicado) para os mesmos 10 domínios (Opportunities, Customer, Team, Settings, Projects, Financial, Activity, Marketing, Analytics, System), ciclo completo Browser→API→Postgres provado, incluindo a primeira integração real de enriquecimento de auditoria (`ADR-0035`). `admin/` permanece estrutura criada (Missão ENG-0000), sem implementação.
