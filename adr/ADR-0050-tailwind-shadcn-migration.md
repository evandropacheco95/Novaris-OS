# ADR-0050: Migração de `apps/web` para Tailwind CSS + shadcn/ui

## Status

Aceita.

## Contexto

Desde `ENG-0147`, `apps/web` usa CSS puro (custom properties `--nov-*` em `app/globals.css`, extraídas fielmente do brandkit oficial) + `style` inline por componente — decisão deliberada para não migrar de stack no meio da construção do Design System básico.

O CTO avaliou que o painel atual "não está moderno" e pediu para elevar o nível de design/layout usando a biblioteca/MCP do 21st.dev como fonte de inspiração e componentes reais ("tem códigos de scroll, cards interativos, gráficos... se inspire, extraia, e vamos usar e adaptar para a Novaris"). Praticamente todo componente do catálogo 21st.dev é distribuído via `npx shadcn@latest add ...`, o que pressupõe Tailwind CSS + a convenção `cn()`/`cva` do shadcn — incompatível com `style` inline sem um retrofit.

Apresentado o trade-off (reescrever ~34 arquivos de `style` inline para Tailwind vs. manter CSS puro e só extrair/readaptar manualmente cada componente do 21st.dev), o CTO escolheu migrar para Tailwind agora, não um adiamento nem um modelo híbrido.

## Decision Drivers

- Instalar componentes reais do catálogo 21st.dev (não só se inspirar visualmente) exige Tailwind — é a única forma de usar o ecossistema como o CTO pediu, em vez de reimplementar cada efeito do zero.
- Os tokens de marca (`--nov-*`) já são a fonte de verdade correta (extraídos do brandkit oficial) — a migração não deve recriá-los, só torná-los consumíveis também via classes utilitárias.
- Risco de regressão visual silenciosa é real ao tocar ~34 arquivos — mitigado fazendo a migração em fases verificadas (`ENG-0156`/`0157`/`0158`), não uma reescrita monolítica.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Migrar para Tailwind + shadcn, tokens preservados via CSS vars** | `tailwind.config.ts` referencia cada `var(--nov-*)` existente, nunca recria o valor — `globals.css` continua sendo a única fonte de verdade da marca | Escolhida (decisão direta do CTO) |
| B. Manter CSS puro, extrair/readaptar manualmente cada componente do 21st.dev | Sem retrabalho nas 21 telas já prontas, mas cada componente do catálogo precisa ser reimplementado à mão, perdendo a maior parte do ganho de produtividade do 21st.dev | Rejeitada pelo CTO |
| C. Híbrido — Tailwind só em telas/componentes novos | Duas metodologias de estilo coexistindo no mesmo app, inconsistência crescente | Rejeitada pelo CTO |

## Decision

**Opção A**, em 3 fases sequenciais e verificadas:

1. **`ENG-0156`** (esta ADR) — infraestrutura: Tailwind CSS 3.x + PostCSS + Autoprefixer instalados (`pnpm add`, nunca `npm install` avulso — lição de `ENG-0147`). `tailwind.config.ts` mapeia cor/fonte/raio/sombra/duração de transição para as mesmas CSS custom properties de `globals.css` (nenhum valor recriado; a escala de espaçamento `--space-*` já é idêntica à escala padrão do Tailwind, sem necessidade de mapeamento). `components.json` e `lib/utils.ts` (`cn()`, `clsx`+`tailwind-merge`) criados manualmente (não via `shadcn init` automático) para não arriscar sobrescrever a configuração recém-mapeada. Nenhum componente/tela migrado ainda nesta fase — build e suite E2E confirmados idênticos ao estado anterior.
2. **`ENG-0157`** (futura) — migração mecânica dos ~13 componentes compartilhados e ~21 telas de `style` inline para `className` Tailwind, mesmos valores visuais, verificado em lotes.
3. **`ENG-0158`** (futura) — elevação de design de verdade: instalação real de componentes do catálogo 21st.dev (skeleton loaders, empty states com CTA, stat cards com tendência, scroll reveal, cards com glow/tilt, kanban) adaptados às cores/fontes da marca.

## Consequences

- Novo `apps/web/tailwind.config.ts`, `apps/web/postcss.config.js`, `apps/web/components.json`, `apps/web/lib/utils.ts`.
- `app/globals.css` ganha as 3 diretivas `@tailwind base/components/utilities` no topo — nenhum token existente foi removido ou alterado.
- Novas dependências (`ADR` registra por transparência, mesmo padrão de `Recharts` em `ENG-0149`): `tailwindcss`, `postcss`, `autoprefixer` (dev); `clsx`, `tailwind-merge`, `class-variance-authority`, `tailwindcss-animate` (runtime, exigidas pela convenção shadcn).
- `services/domains`/`apps/api` **não são afetados** — mudança inteiramente restrita a `apps/web`.
- `ENG-0147` (decisão original de CSS puro) fica superada por esta ADR, não removida do histórico — mesma disciplina de não reescrever decisões passadas silenciosamente.
