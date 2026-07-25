# Objects — Especificações Individuais do BOM

## Objetivo

Um arquivo por objeto catalogado em [BOM.md](../BOM.md), seguindo [OBJECT_SPECIFICATION_TEMPLATE.md](../OBJECT_SPECIFICATION_TEMPLATE.md).

## Escopo

Detalhamento completo de cada objeto: atributos, ciclo de vida, eventos, permissões, regras de negócio, API, automações, IA, auditoria, KPIs e dependências.

## Conteúdo

| Objeto | Categoria (BOM) | Status |
|---|---|---|
| [Organization.md](Organization.md) | Core Objects | 🟢 Official (v1.0.0) |
| [User.md](User.md) | Core Objects | 🚧 Parcial (v0.1.0) — escrito para desbloquear ARCH-001, maior parte `TODO` |
| [Role.md](Role.md) | Core Objects | 🚧 Parcial (v0.1.0) — idem |
| [Permission.md](Permission.md) | Core Objects | 🚧 Parcial (v0.1.0) — idem |
| [Opportunity.md](Opportunity.md) | Sales (Business Domain) | 🟢 Official (v1.0.0) — derivado do código real congelado |
| [Pipeline.md](Pipeline.md) | Sales (Business Domain) | 🟢 Official (v1.0.0) — idem |
| [Stage.md](Stage.md) | Sales (Business Domain) | 🟢 Official (v1.0.0) — idem |
| [Proposal.md](Proposal.md) | Sales (Business Domain) | 🟢 Official (v1.0.0) — idem |

`BOM.md` cataloga cerca de 65 objetos ao todo (Core, Business, Intelligence, Analytics, System Objects); 8 têm especificação individual escrita até aqui, sendo `Organization`, `Opportunity`, `Pipeline`, `Stage` e `Proposal` completas.

## Relação com Outros Módulos

- [BOM.md](../BOM.md) — catálogo do qual cada arquivo aqui é o detalhamento
- [OBJECT_SPECIFICATION_TEMPLATE.md](../OBJECT_SPECIFICATION_TEMPLATE.md) — template obrigatório de cada arquivo
- [services/kernel/](../../../services/kernel/README.md) — `User`, `Role` e `Permission` foram escritos como pré-requisito da Fase B da Missão ARCH-001

## Status

🚧 4 de ~65 objetos do BOM especificado individualmente; 1 completo, 3 parciais.
