# Pilar 3 — Architecture

## Objetivo

Definir a arquitetura de sistema, domínios e dados que toda implementação deve seguir.

## Responsabilidades

Apontar para as fontes de arquitetura já aprovadas — este pilar não redefine camadas, domínios ou modelo de dados.

## Regras

- Arquitetura de sistema (Kernel, Business Domains, camadas): [architecture/](../../architecture/README.md), [SYSTEM_ARCHITECTURE.md](../../knowledge/core/SYSTEM_ARCHITECTURE.md).
- Domínios de negócio (13 domínios, bounded contexts): [DOMAIN_MODEL.md](../../knowledge/core/DOMAIN_MODEL.md); Product Layer vs. Domain Layer: [ADR-0007](../../adr/ADR-0007-domain-boundaries.md).
- Modelo de dados: [BOM.md](../../knowledge/core/BOM.md) (catálogo de entidades), [objects/](../../knowledge/core/objects/README.md) (especificação individual), [CANONICAL_DATA_MODEL.md](../../knowledge/core/CANONICAL_DATA_MODEL.md) (modelo conceitual), [DATABASE_ARCHITECTURE.md](../../knowledge/core/DATABASE_ARCHITECTURE.md) (convenções físicas).
- Toda tabela exige Object Specification antes de existir ([BOM.md § 1](../../knowledge/core/BOM.md), [NOVARIS_CONSTITUTION.md Article V](../../knowledge/core/NOVARIS_CONSTITUTION.md)).

## Exemplos

O EPIC-001 (Identity Service) usa `services/kernel/identity/CONTRACT.md` (já escrito) e depende de `objects/User.md` estar completa (hoje parcial) antes de qualquer tabela real.

## Referências Cruzadas

- [services/kernel/](../../services/kernel/README.md), [services/domains/](../../services/domains/README.md)
- [packages/database/](../../packages/database/README.md)

## Status

🟢 Documento do NEF v1.0.0.
