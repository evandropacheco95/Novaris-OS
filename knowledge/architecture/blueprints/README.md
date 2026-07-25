# NOVARIS — Architecture Blueprints

## Purpose

Especificações técnicas de implementação ("Technical Blueprint", Fase 1 final de `KERNEL_DOMAIN_LIFECYCLE_V2.md`) que consolidam Discovery, Aggregate Design e ADRs de um Business Domain em orientação única e coerente para a fase de código — sem, elas mesmas, conterem código, classes, interfaces, contratos ou schemas.

## Scope

Cobre:
- Consolidação de decisões já aprovadas (Discovery + Aggregate Design + ADRs) num único documento de referência por domínio, pronto para orientar a Fase 2 (`Aggregate & Contract Implementation`) de `KERNEL_DOMAIN_LIFECYCLE_V2.md`.
- Estrutura de pastas pretendida, interfaces de Repository (conceituais, sem métodos), Commands/Domain Events candidatos (nomes apenas), matriz de rastreabilidade.

Não cobre:
- Investigação de evidência (isso é `../analysis/`) — um Blueprint nunca resolve uma pergunta em aberto, apenas a lista (§ "Open Questions").
- Decisões formais de arquitetura (isso é `../decisions/` e `adr/`) — um Blueprint cita ADRs já aceitos, nunca cria um novo.
- Código, classes, contratos, schemas ou qualquer artefato de implementação real (isso é `services/domains/<domínio>/`, quando a Fase 2 começar).

## Document Inventory

| Documento | Missão | Domínio |
|---|---|---|
| [SALES_TECHNICAL_BLUEPRINT.md](SALES_TECHNICAL_BLUEPRINT.md) | ENG-0036 | `Sales` |
| [SALES_PERSISTENCE_MAPPING_BLUEPRINT.md](SALES_PERSISTENCE_MAPPING_BLUEPRINT.md) | ENG-0046 | `Sales` — contrato de persistência de `Opportunity`/`Pipeline`, sem tecnologia definida |

## Relation with `../analysis/`

Todo Blueprint depende de, e cita, um ou mais documentos de `../analysis/` (Discovery, Aggregate Design) como sua base de evidência — nunca reabre ou reavalia essa evidência, apenas a consolida. Se uma pergunta em `../analysis/` não tem resposta, o Blueprint a lista em "Open Questions", nunca a resolve por conta própria (mesmo princípio "Evidence Before Freeze" de `../governance/ARCHITECTURE_GOVERNANCE.md`).

## Relation with `../decisions/`

Todo Blueprint cita os ADRs (`adr/`) e documentos de `../decisions/` que já resolveram formalmente cada aspecto arquitetural do domínio — nunca reinterpreta ou redefine uma decisão já aceita. Uma "Traceability Matrix" é seção obrigatória de todo Blueprint, mapeando cada decisão consolidada à sua fonte formal exata.

## Relation with Implementation

Um Blueprint é o **último** artefato puramente documental antes do código — a "Future Implementation Order" que ele recomenda (`Domain → Application → Infrastructure → Contracts → Tests`) é a sequência que a Fase 2 de `KERNEL_DOMAIN_LIFECYCLE_V2.md` deve seguir. Nenhuma missão de implementação real (`services/domains/<domínio>/`) deve começar sem um Blueprint aprovado para o domínio em questão — mesmo padrão já usado por `Identity`/`Organization`/`Audit` (`IDENTITY_TECHNICAL_BLUEPRINT.md`, `ORGANIZATION_TECHNICAL_BLUEPRINT.md`, `AUDIT_TECHNICAL_BLUEPRINT.md`, todos em `services/kernel/<domínio>/`, não nesta pasta — `Sales` é o primeiro Business Domain a ter Blueprint antes de ter scaffolding próprio em `services/domains/`, por isso vive em `knowledge/architecture/blueprints/` até que `services/domains/sales/` exista).

## Navigation References

- [../README.md](../README.md) — visão geral da árvore `knowledge/architecture/`
- [../analysis/README.md](../analysis/README.md) — Discoveries e Aggregate Designs que alimentam os Blueprints
- [../decisions/README.md](../decisions/README.md) — decisões formais citadas pelos Blueprints
- [adr/README.md](../../../adr/README.md) — ADRs sequenciais citados pelos Blueprints
- [knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md](../../engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) — processo oficial que define a fase "Technical Blueprint"

## Relationship with NOVARIS Architecture

Um Blueprint não introduz nenhuma decisão nova — é uma tradução de decisões já congeladas (`ADR-0019`, e cada ADR específico do domínio) para uma forma pronta para orientar código. Alterar qualquer decisão consolidada aqui exige alterar o ADR de origem primeiro, nunca o Blueprint diretamente.

## Status

🟢 Estrutura criada (Missão ENG-0036). Primeira pasta de Blueprint de Business Domain desta árvore — nenhum código, Aggregate, Entity, contract ou schema criado por esta missão.
