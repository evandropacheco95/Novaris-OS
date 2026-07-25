# database

## Objetivo

Prisma schema e client compartilhado, consumido pelos services NestJS. Não gerencia RLS — ver [knowledge/core/DATABASE_ARCHITECTURE.md § 7](../../knowledge/core/DATABASE_ARCHITECTURE.md); políticas de Row Level Security são aplicadas via SQL bruto na mesma migration gerada pelo Prisma (reconciliação entre "Prisma para acesso a dados", `ADR-0005`, e "Supabase CLI migrations", `DATABASE_ARCHITECTURE.md § 17` — ambos operam sobre o mesmo formato de arquivo `.sql` sequencial, sem conflito real).

## Escopo

Primeira versão real: schema do Sales Domain (`Opportunity`, `Pipeline`, `Stage`, `Proposal`) — os 4 objetos com Object Specification já escrita em [knowledge/core/objects/](../../knowledge/core/objects/README.md). Setup local: copiar `.env.example` para `.env` com a `DATABASE_URL` real (nunca commitado — já coberto por `.gitignore`).

## Relação com Outros Módulos

- [adr/ADR-0004](../../adr/ADR-0004-mover-kernel-para-services.md), [adr/ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) — decisões de arquitetura e stack por trás desta pasta
- [engineering/decision-tree.md](../../engineering/decision-tree.md) — crivo obrigatório antes do primeiro código entrar aqui

## Status

🟢 Schema Prisma real criado (Sales Domain: `Opportunity`/`Pipeline`/`Stage`/`Proposal`). Migração e RLS pendentes de execução contra o projeto Supabase real (aguardando `.env` local).
