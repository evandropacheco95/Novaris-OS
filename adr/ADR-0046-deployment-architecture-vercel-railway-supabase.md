# ADR-0046: Arquitetura de deploy — Vercel (web) + Railway (api) + Supabase (dados)

## Status

Aceita.

## Contexto

O CTO pediu a preparação de uma apresentação ao vivo da NOVARIS ("preparar a proxima apresentação no servidor, uma NOVARIS OS de ponta, completa, funcional e pronta para teste"), inicialmente sem especificar onde hospedar. Perguntado diretamente, confirmou: deploy real na Vercel, mantendo o Supabase já em uso como banco (`vamos implementar a NOVARIS na VERCEL, usando supabase também`).

`apps/web` (Next.js, App Router, zero dependências de workspace) é compatível nativamente com o modelo serverless da Vercel — cada rota vira uma function isolada, sem estado entre requisições.

`apps/api` (NestJS) não é: mantém em processo `EventBus`/`Scheduler`/`AutomationRuleRegistry` (todos in-memory, `ADR-0037`–`0041`) e um `WebSocketGateway` real (`@nestjs/platform-ws`, `ADR-0039`) — nenhum dos três sobrevive a um modelo de function isolada e efêmera. Perguntado se o Supabase poderia hospedar também a API ("spabase nao funciona pro projeto?"), a resposta é não pela mesma razão: Supabase Edge Functions são igualmente serverless (Deno, sem processo persistente), a mesma limitação da Vercel.

## Decisão

- **`apps/web`** → Vercel. Natural fit, nenhuma mudança de código necessária.
- **`apps/api`** → Railway (processo Node persistente, contêiner via Nixpacks). Escolhida entre as opções por já sustentar um processo Node de longa duração sem exigir reescrever `EventBus`/`Scheduler`/`WebSocketGateway` sobre um broker externo (Redis Pub/Sub, etc.) — mudança de infraestrutura muito maior que o pedido original.
- **Banco de dados** → Supabase Postgres, inalterado — já em uso durante toda a sessão, nenhuma migração de dados necessária.

Autenticação: Railway via `RAILWAY_API_TOKEN` (não `RAILWAY_TOKEN`, que é escopo de projeto/CI, não de conta — necessário para criar o projeto). Vercel via conexão já existente no ambiente (conta `evandropacheco95`, `vercel whoami` completou o fluxo OAuth automaticamente).

## Consequências

- `packages/database/package.json`'s script `build` precisou passar a rodar `prisma generate && tsc` (antes só `tsc`) — sem isso, qualquer build fresco em ambiente Linux (Railway) não gera o Prisma Client correto; até então sempre feito manualmente (`npx prisma generate`) ao longo de toda a sessão.
- `railway.json` (novo, raiz do repo): builda com Nixpacks, comando `pnpm turbo run build --filter=@novaris/api...` (não sem o sufixo `...` — ver nota de correção abaixo), inicia com `node apps/api/dist/main.js`.
- `apps/web` é implantado isolado (só o conteúdo de `apps/web`, sem o monorepo ao redor) — qualquer referência a arquivo fora dessa pasta (ex.: `tsconfig.json` com `extends` para a raiz) quebra silenciosamente o deploy. `apps/web/tsconfig.json` precisou virar autocontido (compilerOptions do `tsconfig.base.json` copiados, sem `extends`).
- `apps/api`, ao contrário, builda a partir do monorepo inteiro (Railway não isola como a Vercel) — mas o `pnpm-lock.yaml` da raiz precisa estar em sincronia com **todos** os `package.json` do workspace, mesmo os de pacotes não relacionados a `apps/api` (ex.: `apps/web`), porque `pnpm i --frozen-lockfile` valida o lockfile contra todos os 28 projetos do workspace de uma vez.
- `.railwayignore` (novo) evita subir `node_modules`/`.turbo`/`dist`/`.next` locais no upload do `railway up` — sem isso, uma pasta `.turbo/` local (cache de builds anteriores desta sessão) chegou a "enganar" o Turborepo remoto (ver bug abaixo).

## Bugs reais encontrados e corrigidos durante o primeiro deploy

1. **Vercel — "No Next.js version detected"**: causado por um `apps/web/package-lock.json` órfão (de um `npm install lucide-react` manual anterior, `ENG-0147`) conflitando com a detecção de gerenciador de pacote num deploy isolado sem `pnpm-lock.yaml`/`pnpm-workspace.yaml` visível. Removido — `apps/web` não tem nenhuma dependência `workspace:*`, instala limpo via `npm install` puro.
2. **Vercel — `tsconfig.json` apontando para fora do escopo**: `extends: "../../tsconfig.base.json"` não existe no upload isolado. Corrigido tornando o tsconfig autocontido (ver Consequências acima).
3. **Railway — `pnpm-lock.yaml` desatualizado**: a raiz nunca foi atualizada quando `lucide-react` entrou via `npm install` direto (mesma causa do bug 1) — `pnpm i --frozen-lockfile` falhava para todo o workspace, não só `apps/web`. Corrigido com `pnpm install` na raiz, sincronizando o lockfile.
4. **Railway — filtro do Turborepo incompleto**: `railway.json` buildava só `@novaris/api` (`--filter=@novaris/api`, sem `...`) — `@novaris/database` (dono do `prisma generate`) e outras 22 dependências de workspace nunca eram construídas. Corrigido para `--filter=@novaris/api...`.
5. **Railway — cache do Turborepo mentindo**: mesmo com o filtro corrigido, o Turbo encontrou um cache local antigo (de builds desta sessão, enviado ao Railway por falta do `.railwayignore` — ver bug 6) e só "replayou" o log de sucesso do `prisma generate`, sem regenerar o client de fato — o output do Prisma vive em `node_modules/.pnpm/.../node_modules/.prisma`, fora do que o Turbo declara como `outputs` (`dist/**`/`.next/**`) e por isso nunca é realmente restaurado por um cache hit. Corrigido com `--force` no comando de build do Railway.
6. **Railway — artefatos locais subindo no deploy**: sem `.railwayignore`, `railway up` sobe o diretório local inteiro (`.turbo/`, possivelmente `node_modules/`) — causa raiz do bug 5. Corrigido com `.railwayignore` novo.

## Verificação

Login real via `POST /auth/login` (Railway) retornou um JWT genuíno; `GET /opportunities` autenticado retornou dado real do Supabase; CORS confirmado permissivo (`access-control-allow-origin: *`). Fluxo completo via navegador real (Playwright): login pela UI da Vercel → dashboard renderizado com contagens reais dos 6 domínios → zero erros de console. Bundle JS da Vercel confirmado com a URL correta do Railway (`novaris-api-production.up.railway.app`), não `localhost`.

URLs live: `https://web-henna-rho-74.vercel.app` (web), `https://novaris-api-production.up.railway.app` (api).
