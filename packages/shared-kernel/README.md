# shared-kernel

## Objetivo

Código de domínio compartilhado entre **todos** os serviços do ecossistema NOVARIS (`services/kernel/` e `services/domains/`) — os blocos de construção táticos de DDD (Domain Layer) e utilitários cross-cutting que não pertencem a nenhum bounded context específico.

## Conteúdo Real

- `UniqueEntityId`, `Entity<T>`, `ValueObject<T>`, `AggregateRoot<T>` — as 4 classes base do Domain Layer, implementadas na Missão ENG-0001.2 (Core Domain Foundations). Ver [core/entities/](src/core/entities/README.md), [core/value-objects/](src/core/value-objects/README.md), [core/aggregate-roots/](src/core/aggregate-roots/README.md).
- `Result<T, E>`, `Either<L, R>`, `Option<T>` — as 3 primitivas funcionais, implementadas na Missão ENG-0001.3 (Functional Primitives). Ver [types/](src/types/README.md).
- `AppError`, `DomainError`, `ValidationError`, `BusinessRuleError`, `AuthorizationError`, `AuthenticationError`, `ConflictError`, `NotFoundError`, `InfrastructureError`, `UnexpectedError` — as 10 classes do sistema de erros, implementadas na Missão ENG-0001.4 (Domain Error System). Ver [errors/](src/errors/README.md).
- `DomainEvent` — contrato oficial de evento de domínio (interface), implementado na Missão ENG-0001.5 (Domain Event Contracts); `AggregateRoot` foi atualizado para usá-lo em vez de `unknown`. Ver [core/domain-events/](src/core/domain-events/README.md).
- `Specification<T>`, `AbstractSpecification<T>`, `AndSpecification<T>`, `OrSpecification<T>`, `NotSpecification<T>` — Specification Pattern com composição fluente, implementado na Missão ENG-0001.6. Ver [core/specifications/](src/core/specifications/README.md).
- `Repository<T>`, `ReadRepository<T>`, `WriteRepository<T>` — contratos oficiais de persistência (interfaces, sem implementação concreta), implementados na Missão ENG-0001.7. Ver [core/repositories/](src/core/repositories/README.md).
- `DomainService<TInput, TOutput>`, `AsyncDomainService<TInput, TOutput>`, `DomainServiceResult<T>` — contratos oficiais de Domain Service, implementados na Missão ENG-0001.8. Ver [core/services/](src/core/services/README.md).
- `HasIdentity`, `Timestamped`, `Versionable`, `HasMetadata<T>`, `Auditable` — contratos estruturais compartilhados por Entities/Aggregates, implementados na Missão ENG-0001.9. Ver [interfaces/](src/interfaces/README.md).

Todas as demais pastas seguem apenas como esqueleto arquitetural (Missão ENG-0001.1), sem conteúdo — nenhum helper ou Contract foi implementado.

## Estrutura

```
src/
├── index.ts              # barrel de exportação pública — exporta as 4 classes base
├── core/                  # Domain Layer — blocos táticos de DDD (ver knowledge/engineering/ENGINEERING_PLAYBOOK.md § 3)
│   ├── entities/           # UniqueEntityId, Entity<T> — implementados
│   ├── aggregate-roots/    # AggregateRoot<T> — implementado
│   ├── value-objects/      # ValueObject<T> — implementado
│   ├── domain-events/       # DomainEvent (interface) — implementado (Missão ENG-0001.5)
│   ├── repositories/        # Repository<T> + ReadRepository/WriteRepository — implementados (Missão ENG-0001.7)
│   ├── services/            # DomainService + AsyncDomainService + DomainServiceResult — implementados (Missão ENG-0001.8)
│   ├── specifications/      # Specification<T> + AbstractSpecification + And/Or/Not — implementados (Missão ENG-0001.6)
│   ├── policies/
│   └── factories/
├── errors/                # AppError, DomainError + 8 subclasses — implementados (Missão ENG-0001.4)
├── types/                 # Result<T,E>, Either<L,R>, Option<T> — implementados (Missão ENG-0001.3)
├── contracts/              # contratos de interface entre serviços (distinto de packages/contracts/, que cobre eventos/API/schemas entre Kernel e Domains)
├── utils/                 # utilitários puros, sem estado
├── validation/             # primitivas de validação (biblioteca ainda não escolhida — requer decisão/ADR)
├── testing/                # helpers e fixtures de teste compartilhados
├── interfaces/              # HasIdentity, Timestamped, Versionable, HasMetadata, Auditable — implementados (Missão ENG-0001.9)
├── constants/               # constantes compartilhadas
└── config/                  # configuração compartilhada
```

`core/` mapeia diretamente os 9 blocos da Domain Layer já definidos em [knowledge/engineering/ENGINEERING_PLAYBOOK.md § 3](../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer) (Entities, Value Objects, Aggregates, Factories, Repositories, Domain Services, Specifications, Policies, Domain Events) — não é uma estrutura nova, é a materialização do que o playbook já descrevia.

## Regras

- Nenhum código de negócio de um domínio específico (CRM, Growth, Financial, etc.) vive aqui — isso pertence a `services/domains/<dominio>/`.
- Nenhuma infraestrutura (banco, HTTP, fila) vive aqui — isso pertence à Infrastructure Layer de cada serviço.
- Toda alteração de arquitetura desta estrutura exige ADR ([FOUNDATION_STATUS.md](../../FOUNDATION_STATUS.md), Foundation Freeze).

## Relação com Outros Módulos

- [knowledge/engineering/ENGINEERING_PLAYBOOK.md](../../knowledge/engineering/ENGINEERING_PLAYBOOK.md) — fonte da divisão Domain/Application/Infrastructure/Interface Layer usada aqui
- [services/kernel/](../../services/kernel/README.md), [services/domains/](../../services/domains/README.md) — consumidores deste pacote
- [packages/contracts/](../contracts/README.md) — contratos de evento/API entre Kernel e Domains (escopo diferente de `src/contracts/` deste pacote, que é interno ao domínio)
- [engineering/decision-tree.md](../../engineering/decision-tree.md) — crivo obrigatório antes do primeiro código real entrar em qualquer pasta acima

## Status

🟢 4 classes base do Domain Layer (ENG-0001.2) + 3 primitivas funcionais (ENG-0001.3) + 10 classes de erro (ENG-0001.4) + contrato `DomainEvent` (ENG-0001.5) + Specification Pattern, 5 componentes (ENG-0001.6) + 3 contratos de repositório (ENG-0001.7) + 3 contratos de Domain Service (ENG-0001.8) + 5 contratos estruturais (ENG-0001.9) implementados e testados. Demais pastas seguem como esqueleto (Missão ENG-0001.1).
