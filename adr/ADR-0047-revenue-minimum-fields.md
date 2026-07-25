# ADR-0047: Revenue — campos mínimos e origem

## Status

Aceita.

## Contexto

`Revenue` (`BOM.md § Revenue`, "Receita.") é o último objeto oficial do Sales Domain sem forma definida — `ADR-0044` já sinalizava isso explicitamente ("último objeto oficial do Sales Domain com posição resolvida — só `Revenue` permanece sem forma definida"). Nenhuma fonte (`BOM.md`, `DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`) define campos, ciclo de vida ou origem para `Revenue`.

Perguntado diretamente, o CTO confirmou uma proposta mínima, no mesmo padrão de composição já usado por `Contract` (`ADR-0044`): Revenue nasce de um `Contract` `active`, com campos `amount`/`currency`/`recognizedAt`/`contractId` (rastreabilidade).

## Decision Drivers

- Mesma disciplina de todo campo mínimo desta sessão: só o que o CTO confirmou, nada inventado além disso.
- `Contract` já é o objeto que representa o acordo formal e ativo — `Revenue` como "valor reconhecido a partir de um Contract" é consistente com o papel de `Contract` no funil (`Opportunity → Quotation → Contract → Revenue`).
- Diferente de `Contract` (gerado uma única vez por Quotation aceita, com estados `draft`/`active`/`terminated`), `Revenue` não tem estados — é um registro pontual de reconhecimento. Múltiplos registros de `Revenue` podem existir para o mesmo `Contract` (reconhecimento incremental de valor ao longo do tempo — ex.: um Contract anual reconhecido mês a mês), portanto **não há verificação de unicidade** entre `Contract` e `Revenue` (mesmo espírito de `Invoice`/`Subscription`, onde múltiplas Invoices podem referenciar a mesma Subscription).
- Sem Domain Event — nenhuma fonte confirma um evento para `Revenue`, mesmo critério já aplicado a `Product`/`CalendarEvent`/`Reminder`/`Checklist` (`ADR-0043`/`0045`).

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `Revenue` gerado a partir de `Contract` `active`, campos `amount`/`currency`/`recognizedAt`/`contractId`, sem estados** | Confirma a proposta do CTO — registro pontual de reconhecimento, mesma composição intra-domínio de `Contract`-a-partir-de-`Quotation` | Escolhida |
| B. `Revenue` como Value Object dentro de `Contract` (não Aggregate próprio) | Mais simples, mas impede consultar/listar Revenue independentemente do Contract, e um Contract pode ter múltiplos reconhecimentos ao longo do tempo | Rejeitada — Revenue precisa de identidade e listagem própria |
| C. `Revenue` derivado automaticamente (100% do valor da Quotation na ativação do Contract) | Elimina a necessidade de input manual de `amount` | Rejeitada — contradiz a proposta explícita do CTO (`amount` como campo próprio) e não reflete reconhecimento incremental real |

## Decision

**Opção A.**

- `Revenue` (Aggregate Root, Sales Domain): `organizationId`, `contractId` (rastreabilidade), `amount`, `currency`, `recognizedAt`, `createdAt`, `updatedAt`.
- Único ponto de criação: `GenerateRevenueFromContractHandler` — exige `Contract.status === "active"` (`ConflictError` caso contrário), copia `organizationId`/`contractId` do Contract, recebe `amount`/`currency`/`recognizedAt` (opcional, default `now()`) como input explícito.
- Sem mutadores além de `create()` — registro imutável.
- Sem Domain Event.
- API: sem `POST /revenues` direto (mesmo princípio de `Contract` não ter `POST /contracts` avulso) — só `POST /contracts/:id/generate-revenue`, `GET /revenues`, `GET /revenues/:id`.

## Consequences

- Nova tabela `revenues` (Postgres), migration manual (nunca `migrate diff` contra produção, lição de `ENG-0125`).
- Novo código de Permission (`sales.revenues.manage`).
- `BOM.md § Revenue` recebe Nota de Extensão não-destrutiva.
- `ContractController` ganha a rota `POST /contracts/:id/generate-revenue`, mesmo padrão de `QuotationController`'s `POST /quotations/:id/generate-contract`.

## Responsável

CTO / Arquiteto Chefe — decisão explícita, confirmando a proposta apresentada.

## Data

2026-07-25

## Plano de Migração

Nenhum — objeto novo, sem dado existente para migrar.

## Status

Aceito
