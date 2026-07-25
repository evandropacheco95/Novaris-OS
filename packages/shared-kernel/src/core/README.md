# core

## Objetivo

Blocos táticos de DDD (Domain Layer) compartilhados entre todos os serviços — a materialização de [ENGINEERING_PLAYBOOK.md § 3](../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer).

## Conteúdo

| Pasta | Bloco (ENGINEERING_PLAYBOOK.md § 3) |
|---|---|
| [entities/](entities/README.md) | Entities |
| [aggregate-roots/](aggregate-roots/README.md) | Aggregates |
| [value-objects/](value-objects/README.md) | Value Objects |
| [domain-events/](domain-events/README.md) | Domain Events |
| [repositories/](repositories/README.md) | Repositories (interface/port) |
| [services/](services/README.md) | Domain Services |
| [specifications/](specifications/README.md) | Specifications |
| [policies/](policies/README.md) | Policies |
| [factories/](factories/README.md) | Factories |

## Regras

`core/` nunca importa de `infrastructure/` ou `interfaces/` de nenhum serviço consumidor — mesma regra de dependência unidirecional já vigente em [ENGINEERING_PLAYBOOK.md § 2](../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md).

## Status

🚧 Estrutura criada (Missão ENG-0001.1). Nenhuma implementação de código ainda.
