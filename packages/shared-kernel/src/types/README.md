# types

## Objetivo

Tipos TypeScript compartilhados entre serviços — distinto de [packages/types/](../../../types/README.md), que cobre tipos derivados do BOM voltados a apps/frontend; este é interno ao domínio compartilhado.

## Conteúdo (Missão ENG-0001.3 — Functional Primitives)

- [result.ts](result.ts) — `Result<T, E>`: sucesso/falha sem lançar exceção como fluxo normal; acesso seguro (`T | undefined` / `E | undefined`).
- [either.ts](either.ts) — `Either<L, R>`: valor em um de dois lados (Left/Right); sem dependência de `Result`.
- [option.ts](option.ts) — `Option<T>`: presença/ausência de valor via dois estados explícitos (`Some`/`None`, não exportados); nunca usa `null` como sinalização de ausência.

**Por que aqui e não em uma pasta nova**: as três primitivas são genéricas — usadas por Domain, Application e Infrastructure Layer (ver contexto da Ordem de Missão ENG-0001.3), não só por `core/` (Domain Layer). `types/` já existia no esqueleto aprovado da Missão ENG-0001.1 e seu Objetivo ("tipos TypeScript compartilhados") cobre isso sem exigir mudança estrutural nem ADR.

## Status

🟢 3 primitivas funcionais implementadas e testadas (Missão ENG-0001.3). Nenhum outro tipo implementado.
