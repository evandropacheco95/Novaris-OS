# ADR-0005 - Adotar NestJS, Prisma, pnpm e Turborepo como Extensão da Stack

## Problema

A "Ordem de Missão ENG-0000" pede NestJS (backend), Prisma (acesso a dados), pnpm (gerenciador de pacotes) e a escolha entre Turborepo/Nx (orquestração de monorepo). Nenhuma dessas tecnologias consta na stack oficial fixa (Next.js, TypeScript, Tailwind CSS, Shadcn/UI, Supabase, Edge Functions, PostgreSQL, OpenAI, Claude, MCP, n8n, GitHub, Vercel), e `PROJECT_RULES.md` exige ADR para qualquer mudança de stack.

## Contexto

A stack fixa já cobre frontend (Next.js/Tailwind/Shadcn) e persistência (Supabase/PostgreSQL/Edge Functions), mas não define um framework de backend para serviços com lógica própria fora de Edge Functions, nem um ORM, nem gerenciador de pacotes, nem orquestrador de monorepo — lacunas que ENG-0000 precisa preencher para o Kernel (`services/`) existir como código real.

## Alternativas

1. **Adotar NestJS + Prisma + pnpm + Turborepo** (pedido pela missão) — escolhida.
2. Usar apenas Next.js API Routes/Edge Functions + Supabase client, sem NestJS/Prisma, mantendo pnpm/Turborepo só como tooling — rejeitada nesta missão porque o usuário optou explicitamente por registrar ADR e adotar a stack pedida, não por restringir a ela.
3. Nx em vez de Turborepo — rejeitada: Turborepo já era a sugestão não-decidida em `knowledge/core/MONOREPO_ARCHITECTURE.md`, e tem integração mais direta com a Vercel (plataforma de deploy já fixa) do que Nx, que é agnóstico de plataforma e exigiria mais configuração própria para o mesmo resultado.

## Escolha

- **Monorepo**: Turborepo.
- **Package manager**: pnpm.
- **Backend dos serviços de Kernel**: NestJS + TypeScript.
- **Acesso a dados nos serviços NestJS**: Prisma.

## Consequências

Positivas: preenche as lacunas de backend/ORM/tooling que a stack fixa original não cobria; Turborepo integra nativamente com Vercel.

Negativas / pontos de atenção: **Prisma não gerencia Row Level Security** — `DATABASE_ARCHITECTURE.md § 7` continua vigente e é responsabilidade da camada SQL/Supabase diretamente (migrations e policies), não do Prisma. Todo `schema.prisma` deve refletir, não substituir, as convenções já definidas em `DATABASE_ARCHITECTURE.md` (UUID, soft delete, `organization_id`, naming convention). Coexistência de dois "mundos" de acesso a dados (Supabase client direto para Edge Functions/Next.js, Prisma para services NestJS) precisa de disciplina para não divergir — risco registrado, não resolvido por este ADR.

## Responsável

Decisão de arquitetura: usuário (Ordem de Missão ENG-0000, consultado via pergunta direta). Execução: Engenheiro Principal.

## Data

2026-07-14

## Impactos

Cria os arquivos de tooling raiz do monorepo (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.eslintrc.cjs`, `.prettierrc`). Não altera `architecture/stack-tecnologica.md` diretamente nesta missão — fica registrado aqui como extensão; reconciliar o documento de stack fica como pendência (mesma disciplina de não resolver silenciosamente conflitos usada a sessão inteira).

## Plano de Migração

Não aplicável — não há backend implementado anteriormente. Tooling criado do zero nesta missão.

## Status

Aceito
