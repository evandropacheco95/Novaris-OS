# Services

## Objetivo

Serviços de backend com deploy próprio, divididos em duas categorias que não se misturam ([ADR-0006](../adr/ADR-0006-monorepo-structure-decision.md), Missão ENG-0000.1):

- [kernel/](kernel/README.md) — infraestrutura compartilhada (20 módulos: Identity, Organizations, Audit (Domain Capabilities); Event Bus, Storage, Logging, Integration Hub, etc. (Infrastructure Capabilities) — classificação completa em [kernel/KERNEL_BOUNDARY_REVIEW.md](kernel/KERNEL_BOUNDARY_REVIEW.md), Missão ENG-0007; `Permissions` não é módulo independente — `Permission` é Value Object dentro de Identity, EPIC-004)
- [domains/](domains/README.md) — domínios de negócio, restritos a bounded contexts técnicos (Sales, Customer, Marketing, Analytics, Financial, Projects — `Growth` removido por [ADR-0007](../adr/ADR-0007-domain-boundaries.md), é Product Layer, não Domain Layer)

Nenhum domínio de negócio acessa o Kernel diretamente — só pela interface pública de cada módulo, e a comunicação entre as duas camadas passa pela camada de contratos em [packages/contracts/](../packages/contracts/README.md).

## Relação com Outros Módulos

- [adr/ADR-0004](../adr/ADR-0004-mover-kernel-para-services.md) — Kernel movido para `services/`
- [adr/ADR-0005](../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) — stack (NestJS/Prisma)
- [adr/ADR-0006](../adr/ADR-0006-monorepo-structure-decision.md) — separação Kernel/Domains e criação de `packages/contracts/`
- [adr/ADR-0007](../adr/ADR-0007-domain-boundaries.md) — Product Layer vs. Domain Layer; remoção de `growth`; adição de `customer`/`marketing`/`analytics`
- [DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md) — os 13 domínios de negócio; `services/domains/` cobre 6 deles após esta missão

## Status

🟢 Estrutura reorganizada (Missões ENG-0000.1 e ENG-0000.2). **`services/kernel/identity/` tem os 2 primeiros Value Objects reais** (Missão ENG-0002.3) — primeiro serviço com código real. `pnpm-workspace.yaml` ganhou o padrão `services/*/*` para que módulos de Kernel/Domain individuais sejam pacotes pnpm próprios (necessário para o build funcionar; não é mudança de arquitetura, só tooling). Demais serviços ainda não implementados.
