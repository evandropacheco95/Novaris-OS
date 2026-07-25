# Árvore de Monorepo — Proposta (Missão 007)

> ⚠️ **Status: parcialmente materializada, divergente.** Em 2026-07-14, por [ADR-0002](../../adr/ADR-0002-reestruturar-arvore-do-repositorio.md), `apps/`, `packages/`, `services/`, `sdk/`, `database/`, `infrastructure/`, `scripts/`, `tools/`, `design-system/`, `tests/` e `templates/` foram criadas de verdade na raiz do repositório — mas como scaffolding **vazio** (só `README.md` de estrutura em cada uma), não com a árvore interna detalhada abaixo. Essa árvore interna (que produtos viram apps, o que vai em cada package, `integrations/`, `supabase/`) continua proposta, não implementada, e **diverge** da lista de pastas de topo real: não existe `integrations/` nem `supabase/` como pastas próprias — o mais próximo hoje são `services/`, `database/` e `infrastructure/`, mas essa correspondência não foi decidida, só observada. Ver "Divergência com o Scaffolding Real" abaixo. Esta é uma sugestão estrutural para revisão, construída a partir da stack fixa ([architecture/stack-tecnologica.md](../../architecture/stack-tecnologica.md)) e dos produtos/integrações já nomeados em [NOVARIS_OS.md](NOVARIS_OS.md). Os nomes de app usam a lista de 6 produtos de `NOVARIS_OS.md § 7` — se a lista de 9 produtos de [PRODUCTS.md](PRODUCTS.md) prevalecer (conflito ainda não resolvido, ver auditoria; reforçado pelos 9 domínios de [specifications/](../../specifications/README.md)), esta árvore precisa ser revisada.

## Árvore Proposta

```
novaris-platform/
├── apps/
│   ├── web/                     # Shell principal da plataforma (Next.js)
│   ├── growth/                  # NOVARIS Growth
│   ├── crm/                     # NOVARIS CRM
│   ├── ai/                      # NOVARIS AI
│   ├── automation/              # NOVARIS Automation
│   ├── studio/                  # NOVARIS Studio
│   └── saas-admin/              # Administração multiempresa / White Label (NOVARIS SaaS)
│
├── packages/
│   ├── ui/                      # Design System — Shadcn/UI + Tailwind CSS
│   ├── config/                  # eslint, tsconfig, tailwind.config compartilhados
│   ├── database/                # Cliente Supabase, tipos gerados, schema compartilhado
│   ├── auth/                    # Autenticação/autorização compartilhada
│   ├── ai-core/                 # Integração compartilhada com Claude, OpenAI, MCP
│   ├── automation-core/         # Integração compartilhada com n8n
│   ├── sdk/                     # SDK público — base do Portal do Desenvolvedor
│   └── shared/                  # Tipos, constantes e utilitários comuns
│
├── integrations/                # Integrações externas nomeadas em NOVARIS_OS.md § 7 (NOVARIS Automation)
│   ├── whatsapp/
│   ├── google/
│   ├── meta/
│   └── bling/
│
├── supabase/
│   ├── migrations/              # Migrations versionadas (PostgreSQL)
│   └── functions/               # Edge Functions
│
├── docs/                        # já existe — documentação de referência
├── knowledge/                   # já existe — memória permanente
├── agents/                      # já existe — documentação de agentes
├── .claude/                     # já existe — regras operacionais de agentes
│
├── turbo.json                   # orquestração de build (proposta: Turborepo)
└── package.json                 # workspace raiz
```

## Convenções Propostas

- **Apps** (`apps/*`) — produtos com interface própria, deployados independentemente na Vercel.
- **Packages** (`packages/*`) — código compartilhado entre apps, nunca deployado sozinho.
- **Integrations** (`integrations/*`) — adaptadores para serviços de terceiros, isolados para que uma falha externa não acople a um app específico.
- Nenhum app importa código de outro app diretamente — toda comunicação entre produtos passa por `packages/` ou pela camada de API/Edge Functions.

## Divergência com o Scaffolding Real (atualizado — Missão ENG-0000)

Em 2026-07-14, [ADR-0004](../../adr/ADR-0004-mover-kernel-para-services.md) e [ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) materializaram parte real desta árvore, com diferenças concretas em relação à proposta acima:

- **Turborepo deixou de ser sugestão** — `ADR-0005` decidiu formalmente (com Nx como alternativa rejeitada).
- **`sdk/` virou `packages/sdk/`** — como esta proposta já sugeria, não pasta de topo própria.
- **`packages/database/` existe de verdade** (Prisma, não o "cliente Supabase" originalmente proposto aqui — `ADR-0005` registra a coexistência de Prisma com RLS/Supabase).
- **Kernel foi para `services/`, não `packages/`** — diferente desta proposta original, que não previa um Kernel separado; `apps/` ficou com `web/`, `admin/`, `api/` (genéricos), não um app por produto (`growth/`, `crm/`, `ai/`, ...) como proposto aqui — a lista de produtos (`NOVARIS_OS.md § 7` vs. `PRODUCTS.md`) segue não resolvida, e por isso `apps/` não nomeia produtos ainda.
- **`integrations/` e `supabase/` continuam sem pasta própria** — nenhuma decisão nova sobre isso; `packages/config`, `packages/logger`, `packages/types`, `packages/security` (não previstos aqui) preencheram parte do espaço que `packages/shared` cobria nesta proposta.

## Dependências desta Proposta (partes ainda pendentes)

- Resolução do conflito de lista de produtos (`NOVARIS_OS.md § 7` vs. `PRODUCTS.md`) — ainda determina se/quando `apps/` ganha um app por produto.
- Reconciliação de `integrations/`/`supabase/` — ainda pendente.

## Status

🟡 Parcialmente implementada pela Missão ENG-0000 (ver acima). A árvore original desta proposta não foi seguida à risca — divergências registradas, não uma substituição formal deste documento.
