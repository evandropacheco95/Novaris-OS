# packages

## Objetivo

Código compartilhado entre apps (UI, config, tipos, utilitários) — nunca deployado sozinho.

## Conteúdo

- [shared-kernel/](shared-kernel/README.md) — blocos táticos de DDD (Domain Layer) + primitivas funcionais + sistema de erros + contrato de Domain Event + Specification Pattern + contratos de repositório + contratos de Domain Service compartilhados entre todos os serviços: `UniqueEntityId`, `Entity<T>`, `ValueObject<T>`, `AggregateRoot<T>` (ENG-0001.2), `Result<T,E>`, `Either<L,R>`, `Option<T>` (ENG-0001.3), `AppError`/`DomainError` + 8 subclasses (ENG-0001.4), `DomainEvent` (ENG-0001.5), `Specification<T>`/`AbstractSpecification<T>`/`And`/`Or`/`Not` (ENG-0001.6), `Repository<T>`/`ReadRepository<T>`/`WriteRepository<T>` (ENG-0001.7), `DomainService`/`AsyncDomainService`/`DomainServiceResult<T>` (ENG-0001.8), `HasIdentity`/`Timestamped`/`Versionable`/`HasMetadata`/`Auditable` (ENG-0001.9); esqueleto na ENG-0001.1

## Conteúdo (Missão ENG-0000)

- [database/](database/README.md) — Prisma schema + client compartilhado
- [ui/](ui/README.md) — Design System (Shadcn/UI + Tailwind)
- [config/](config/README.md) — eslint/tsconfig/tailwind compartilhados
- [logger/](logger/README.md) — wrapper compartilhado sobre `services/kernel/logging/`
- [types/](types/README.md) — tipos TypeScript compartilhados (inclui os objetos do BOM)
- [security/](security/README.md) — helpers de auth/RLS compartilhados
- [sdk/](sdk/README.md) — SDK público, base do Portal do Desenvolvedor
- [contracts/](contracts/README.md) — eventos, API, schemas: comunicação entre `services/kernel/` e `services/domains/` (Missão ENG-0000.1)
- [ai/](ai/README.md) — agents, prompts, tools, memory: estrutura inicial de IA (Missão ENG-0000.1, sem funcionalidade)

⚠️ O Kernel (Identity, Organizations, Audit — Domain Capabilities; Event Bus, Storage, etc. — Infrastructure Capabilities, ver [services/kernel/KERNEL_BOUNDARY_REVIEW.md](../services/kernel/KERNEL_BOUNDARY_REVIEW.md)) **não** vive aqui — foi movido para [services/kernel/](../services/kernel/README.md) por [ADR-0004](../adr/ADR-0004-mover-kernel-para-services.md), depois separado de `services/domains/` por [ADR-0006](../adr/ADR-0006-monorepo-structure-decision.md).

## Relação com Outros Módulos

- [knowledge/core/MONOREPO_ARCHITECTURE.md](../knowledge/core/MONOREPO_ARCHITECTURE.md) — proposta de árvore interna desta pasta (parcialmente divergente do que existe hoje; ver nota de divergência lá)
- [adr/ADR-0005](../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) — stack (Prisma, pnpm, Turborepo) que estes pacotes usam
- [adr/ADR-0006](../adr/ADR-0006-monorepo-structure-decision.md) — decisão de criar `contracts/` e `ai/`
- [adr/](../adr/README.md) — toda decisão de arquitetura que definir o conteúdo real desta pasta deve ser registrada como ADR antes da implementação
- [engineering/decision-tree.md](../engineering/decision-tree.md) — crivo obrigatório antes do primeiro código entrar aqui

## Status

🚧 Estrutura criada (Missões ENG-0000 e ENG-0000.1). Nenhuma implementação de código ainda.
