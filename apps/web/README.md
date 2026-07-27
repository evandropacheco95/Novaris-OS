# web

## Objetivo

Frontend principal da NOVARIS (Next.js, App Router) — interface voltada ao cliente final.

## Escopo

**Primeira fatia real (`ENG-0123`, Frontend Web #1)**: `/login` (email + senha, chama `POST /auth/login` de `apps/api`, guarda o JWT) e `/opportunities` (lista, cria e fecha Opportunities do Sales Domain, chamando as rotas protegidas por `JwtAuthGuard`). Prova a arquitetura de ponta a ponta pela primeira vez incluindo a camada visual: Browser → `apps/web` → HTTP (`fetch`, CORS habilitado em `apps/api`) → `apps/api` → Domain/Infrastructure → Postgres real (Supabase).

`lib/api.ts` é o único ponto de contato com a API — nenhum Component chama `fetch` diretamente. JWT guardado em `localStorage` (aceitável nesta fase de prova; um cookie `httpOnly` seria a evolução natural antes de considerar este app pronto para produção real, ver Nota de Segurança abaixo).

**Customer Domain (`ENG-0127`)**: `/customer` lista/cria Parties (pessoa ou organização externa) e Relationships entre elas, consumindo `apps/api`'s `CustomerModule` (`ENG-0125`). `/opportunities` seleciona a Party via dropdown de Parties reais (corrigido em `ENG-0138` — até então ainda pedia um UUID digitado à mão, com comentário desatualizado dizendo que `Party` não existia).

**Dashboard visual real (`ENG-0124`)**: paleta e tipografia extraídas do brandkit oficial da NOVARIS (`NOVARIS_Brand_Identity_v1.0.html`, ativo de marca já existente do CTO, fora deste repositório) — tokens `--nov-*` em `app/globals.css` (fundo/superfície/borda/escala silver/escala azul), Orbitron (display) + Inter (corpo) via `next/font/google` (`lib/fonts.ts`). `components/dashboard-shell.tsx` é o layout de toda tela autenticada — sidebar com os 10 Business Domains reais de `knowledge/core/DOMAIN_MODEL.md`. `components/tag.tsx`/`components/brand-mark.tsx` são os primeiros componentes visuais reutilizáveis deste app.

**Identity/Organization (`ENG-0128`)**: `/team` (lista/cria Users, ativa/desativa, atribui/revoga Role via checkbox; lista/cria Roles, concede Permission) e `/settings` (perfil da própria Organization — nome, razão social, documento).

**Project (`ENG-0130`)**: `/projects` lista/cria Projects, adiciona Tasks, avança o status de cada Task (4 estados, `pending`/`in_progress`/`completed`/`cancelled`, `BOM.md`) por um select.

**Financial (`ENG-0131`)**: `/financial` lista/cria Subscriptions e Invoices (avulsa ou ligada a uma Subscription), marca Invoice como paga.

**Activity/Marketing/Analytics (`ENG-0133`)**: `/activity` lista/cria Activities vinculadas a uma Party (6 tipos, `ADR-0032`) e permite concluí-las; `/marketing` lista/cria Campaigns (nome + datas opcionais, `ADR-0033`); `/analytics` lista/cria Dashboards (só nome, `ADR-0034` — sem nenhum Widget funcional ainda, bloqueado deliberadamente).

**System/Audit (`ADR-0035`, `ENG-0135`)**: `/system` — **somente leitura**, sem formulário de criação. Lista a trilha de auditoria (ator, alvo, ação, `changeSet` de antes/depois quando aplicável), ordenada da mais recente para a mais antiga. Entradas nascem só do enriquecimento automático feito por outros domínios (hoje, `/settings` ao atualizar o perfil da Organization) — nunca de uma ação manual nesta tela.

10 dos 10 domínios agora habilitados na sidebar — ciclo completo dos Business Domains de `knowledge/core/DOMAIN_MODEL.md`.

**QA visual real (`ENG-0138`)**: `e2e/domains.spec.ts` (Playwright + Chromium, `playwright.config.ts` aponta para uma instância já rodando em `http://localhost:3000` — não gerencia o ciclo de vida do servidor). Login real + os 10 domínios + confirmação de título + screenshot de tela cheia cada; `pnpm --filter @novaris/web run test:e2e` roda a suite (12 testes). Primeira verificação visual de verdade desta engenharia — achado real só visível por inspeção de screenshot, não por `curl`/leitura de código, corrigido na mesma missão (ver nota acima sobre `/opportunities`).

**Arco Salesforce (`ADR-0042`–`0045`, `ENG-0143`–`0146`)**: 9 novas telas — `/leads`, `/products`, `/quotations`, `/contracts` (Sales); `/cases`, `/comments`, `/calendar-events`, `/reminders`, `/checklists` (Activity). Nenhuma vira um 11º Business Domain na sidebar (decisão deliberada, preserva a contagem oficial de 10) — navegação por links internos a partir do domínio dono.

**Design System elevado (`ENG-0147`)**: por pedido direto do CTO ("sofisticação e alto design... alto nível de UI e UX"). `app/globals.css` ganhou uma escala de espaçamento/elevação/sombra/transição real (antes só cor+radius); `components/{button,card,input,page-header,empty-state,stat-card}.tsx` são os primeiros primitivos visuais compartilhados de verdade (antes cada tela repetia seu próprio `inputStyle`/`buttonStyle` local) — `lucide-react` como biblioteca de ícones. `DashboardShell` redesenhado (ícones por domínio, indicador de item ativo com glow, avatar do usuário). **`/` deixou de ser um redirect** — agora é um painel real (`StatCard`s com contagens ao vivo dos domínios já implementados + acessos rápidos aos 9 recursos do arco Salesforce). As 21 telas desta app foram todas migradas para os novos primitivos. Verificado: as 12 suites do Playwright (E2E oficial) + um fluxo real via UI (criar→qualificar→converter um Lead, ponta a ponta contra Postgres real) — nenhuma regressão funcional, só elevação visual.

**Deploy real em produção (`ADR-0046`, `ENG-0148`)**: `apps/web` implantado na Vercel (`https://web-henna-rho-74.vercel.app`), consumindo `apps/api` real hospedada na Railway. `NEXT_PUBLIC_API_URL` aponta para a URL pública do Railway em produção (build-time, `NEXT_PUBLIC_*` é inlined no bundle). Ver `ADR-0046` para os 6 bugs reais de deploy encontrados e corrigidos (lockfile órfão, `tsconfig` fora de escopo, cache do Turborepo, etc.).

**Primeiro refinamento com 21st.dev (`ENG-0149`)**: Dashboard (`/`) e `/opportunities` (âncora do arco Salesforce) elevados com o MCP do 21st.dev, primeira fase de design profundo pedida pelo CTO ("quero superar o Salesforce"). Recharts adicionado (nova dependência) para `components/status-donut.tsx` — donut de breakdown por status, só dado real, nunca inventado. `/opportunities` virou board estilo pipeline (3 colunas por status, padrão Kanban). 2 bugs reais corrigidos: hydration mismatch em `DashboardShell` (presente desde `ENG-0147` nas 21 telas, corrigido com o hook `useCurrentUser()` em `lib/api.ts`) e animação do Recharts travando o donut antes de renderizar (`isAnimationActive={false}`). Escopo deliberadamente restrito a 2 telas — expansão às demais 19 fica para decisão futura do CTO.

**Migração para Tailwind CSS + shadcn/ui (`ADR-0050`, `ENG-0156`-`0158`)**: supera a decisão de CSS puro de `ENG-0147` — motivada pelo pedido do CTO de usar o catálogo real do 21st.dev (distribuído via `npx shadcn@latest add`, incompatível com `style` inline sem retrofit). Fase 1 foi só infraestrutura (tokens mapeados via CSS vars, zero mudança visual). Fase 2 migrou os 9 primitivos compartilhados e as 22 telas de `style` inline para classes Tailwind. Fase 3 elevou o design de verdade com código real de 2 componentes do 21st.dev (`tilt-card`/`reveal`), reimplementado adaptado aos tokens `--nov-*` e sem novas dependências pesadas (`Reveal` usa `IntersectionObserver`, não framer-motion): `Card` ganhou `glow`/`glass`, novos `Skeleton`/`Reveal`, `EmptyState` com CTA opcional, `StatCard` com `trend` opcional (ainda não usado — sem dado histórico real disponível). Aplicado nas 2 telas mais visíveis (Dashboard `/` e Opportunities); replicar nas demais telas com board fica para decisão futura do CTO.

**Replicação da elevação de design nas demais telas com board (`ENG-0159`)**: mesmo padrão da Fase 3 acima (`ADR-0050`, sem nova ADR), aplicado às 4 telas restantes com board Kanban — `/leads` (5 colunas), `/cases` (3), `/quotations` (4), `/contracts` (3). Cada coluna ganhou uma borda superior colorida (`STATUS_COLUMN_BORDER`) alinhada ao tom já usado em `Tag`/`STATUS_TONE`; cards envolvidos em `Reveal` (stagger por índice) e `Card` com `glow`; loading em texto puro trocado por `Skeleton`/`SkeletonCard` (preservando o contrato semântico dos testes E2E via `<span className="sr-only">Carregando...</span>`); `EmptyState` com CTA que foca o campo de criação relevante (`#lead-name-input`, `#case-subject-input`, `#quotation-opportunity-select`, ou navega para `/quotations` em Contracts). Verificado: build+lint limpos, suite oficial 12/12 (após re-execuções isoladas para descartar flakiness de cold-cache já documentada desde `ENG-0154`), monorepo completo (78 tasks) verde.

**Nota de Segurança**: `localStorage` é vulnerável a XSS (qualquer script injetado na página pode ler o token) — aceitável para esta fase de prova de conceito com 2 usuários de teste, mas **não deve ser usado como está em produção real com usuários externos**. Evolução recomendada antes de expor publicamente: mover o JWT para um cookie `httpOnly` + `Secure`, emitido por uma rota própria de `apps/api` (ou por um Route Handler deste próprio app Next.js atuando como proxy).

Setup local: `pnpm build` (raiz) → `pnpm --filter @novaris/web run start` (ou `run dev` para hot reload). Requer `apps/web/.env.local` (`NEXT_PUBLIC_API_URL`, aponta para `apps/api`) e a API já rodando.

## Relação com Outros Módulos

- [adr/ADR-0004](../../adr/ADR-0004-mover-kernel-para-services.md), [adr/ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) — decisões de arquitetura e stack por trás desta pasta
- [apps/api/README.md](../api/README.md) — API consumida por este app (`POST /auth/login`, rotas de `/opportunities`)
- [engineering/decision-tree.md](../../engineering/decision-tree.md) — crivo obrigatório antes do primeiro código entrar aqui

## Status

🟢 21 telas (10 Business Domains + 9 telas do arco Salesforce + home + login), todas usando o Design System compartilhado (`ENG-0147`: `Button`/`Card`/`Input`/`Select`/`Tag`/`PageHeader`/`EmptyState`/`StatCard`), testado contra a API real (Supabase por trás), build/lint/E2E limpos. Estilo ainda em `style` inline por componente (não CSS Modules/Tailwind), sem tratamento de erro refinado (mensagens genéricas). **Verificação visual em navegador real feita (`ENG-0138`, Playwright, 12 testes)** + fluxo real via UI ponta a ponta (`ENG-0147`). **Deploy real em produção (`ADR-0046`, `ENG-0148`)**: Vercel + Railway, live para demo. **Refinamento com 21st.dev MCP iniciado (`ENG-0149`)**: Dashboard + `/opportunities` (Recharts, `StatusDonut`, board estilo pipeline); demais 19 telas ainda no visual de `ENG-0147`, expansão é decisão futura do CTO.
