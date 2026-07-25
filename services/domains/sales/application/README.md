# sales / application

## Purpose

Camada de aplicação de `Sales` — orquestra Commands e Queries sobre os Aggregates do domínio, sem conter regra de negócio própria (isso pertence a `domain/`).

## Responsibilities

Receber um Command/Query, carregar o Aggregate via Repository, invocar seu comportamento, persistir o resultado — nenhuma decisão de negócio é tomada nesta camada.

## Allowed Dependencies

`domain/` (Aggregates, Repository interfaces); `packages/shared-kernel/` (`Result`, `Option`).

## Forbidden Dependencies

`infrastructure/` diretamente (só via interface de `domain/repositories/`); nenhum acesso direto a banco de dados, ORM ou framework HTTP.

## Implementation Status

🟡 Application Layer implementada parcialmente (Missões `ENG-0059`–`ENG-0070`): 6 Commands (`commands/`) + 6 Handlers (`handlers/`) implementados e correspondentes 1:1 — ver inventário em [commands/README.md](commands/README.md) e [handlers/README.md](handlers/README.md). Queries continuam vazias (`queries/`, nenhuma nomeada por nenhuma fonte). Controllers/API não existem — `contracts/` permanece vazio. Nenhum framework utilizado (`NestJS`, `class-validator` etc.) — toda a camada é TypeScript puro, consistente com o Domain Layer.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde à camada `Application` de `§ 12 (Future Implementation Order)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md), posicionada após `Domain`.

## Status

🟡 6 Commands + 6 Handlers implementados (Missões `ENG-0059`–`ENG-0070`), auditados e classificados `APPLICATION VERIFIED WITH CONDITIONS` (`ENG-0071`) — corrigido em `ENG-0072`. Queries, Controllers e API permanecem vazios.
