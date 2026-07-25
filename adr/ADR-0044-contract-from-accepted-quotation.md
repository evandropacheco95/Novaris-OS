# ADR-0044 — Contract: Gerado a partir de uma Quotation Aceita

## Problema

`ADR-0043` já sinalizou `Contract` como "o próximo passo natural (Quotation aceita → gera Contract)", mas o deixou fora de escopo (não era um dos 3 candidatos nomeados pelo CTO). Com "Case"/"Product"/"Comment" concluídos (`ENG-0144`) e instrução direta do CTO para continuar a construção sem pausar, esta ADR fecha esse próximo passo — `Contract` é o último objeto oficial do Sales Domain (`DOMAIN_MODEL.md § SALES DOMAIN`) ainda não implementado (`Quotation`, resolvido em `ADR-0043`; `Revenue`, ainda sem evidência de forma, permanece fora de escopo).

## Contexto

- `BOM.md § Contract`: "Contrato." — um-liner, mesmo estado que `Quotation` tinha antes de `ADR-0043`.
- Salesforce real: `Contract` é gerado a partir de uma `Opportunity`/`Quote` já fechada (ação manual "Generate Contract" no Quote aceito), com ciclo `Draft → Activated → Terminated`.
- `Quotation.accept()` (`ADR-0043`) **não** gera Contract automaticamente — decisão já registrada (ação manual separada no Salesforce, não haveria fonte para inventar o acoplamento automático).

## Decision Drivers

- Mesma disciplina de campo mínimo já usada em toda a sessão.
- Não acoplar `Contract` como efeito colateral automático de `Quotation.accept()` — mantém a mesma decisão já tomada em `ADR-0043` (ação explícita, não implícita).
- Reaproveitar o mesmo padrão de composição intra-domínio já provado em `AddQuotationLineItemHandler` (`ADR-0043`).

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `Contract` como novo Aggregate Root em `services/domains/sales`, criado via Handler dedicado a partir de uma Quotation `accepted`** | Mesmo pacote, mesmo padrão de `Quotation` | Escolhida — único objeto do Sales Domain ainda sem posição, mesmo domínio dos demais. |
| B. `Contract.generate()` dentro do próprio Aggregate `Quotation` | Menos um Handler | Rejeitada — violaria a fronteira de Aggregate (`Quotation` não deveria construir e devolver um `Contract` completo, que é seu próprio Aggregate Root com Repository próprio); mesmo princípio que impede `Opportunity` de criar `Party` diretamente (`ADR-0042` usa Handler, não o Aggregate). |
| C. Geração automática ao aceitar a Quotation | Menos uma chamada de API | Rejeitada — nenhuma fonte confirma esse acoplamento automático; contradiria a decisão já registrada em `ADR-0043` ("ação manual separada no Salesforce, não inventada aqui"). |

## Decision

**Opção A.**

- **`Contract`** (Aggregate Root, `services/domains/sales/domain/aggregates/contract/contract.ts`): `organizationId`, `opportunityId`, `quotationId` (rastreabilidade — de qual Quotation este Contract se origina), `status: ContractStatus`, `startDate?`, `endDate?`.
- **`ContractStatus`**: `"draft" | "active" | "terminated"` — mesma forma do Salesforce (Draft/Activated/Terminated), 3 estados mínimos para os eventos confirmados abaixo.
- **`GenerateContractFromQuotationHandler`** (Application, Sales→Sales, mesmo padrão intra-domínio de `AddQuotationLineItemHandler`): recebe `quotationId`, busca a `Quotation` real, falha com `ConflictError` se `status !== "accepted"`, cria o `Contract` em `"draft"` copiando `organizationId`/`opportunityId` da Quotation, persiste.
- **`activate()`**: `draft → active`, dispara `ContractActivated`. **`terminate()`**: `active → terminated`, dispara `ContractTerminated`. Ambas terminais quanto a reversão (sem `reactivate()` — não confirmado por nenhuma fonte).
- **Domain Events**: `ContractCreated`, `ContractActivated`, `ContractTerminated` — mesma forma mínima de `QuotationCreated`/`QuotationAccepted`/`QuotationRejected`.

## Rejected Alternatives

Ver Opções B e C acima.

## Consequences

- `services/domains/sales`: 1 novo Aggregate Root (`Contract`), sem nova dependência de pacote (Sales→Sales, mesmo domínio).
- 1 nova tabela Postgres (`contracts`).
- API real: `POST /quotations/:id/generate-contract`, `POST/GET /contracts`, `POST /contracts/:id/activate`, `POST /contracts/:id/terminate`.
- Frontend: botão "Gerar Contract" em `/quotations` (quando `status: "accepted"`) + nova tela `/contracts`.
- `Revenue` permanece o único objeto do Sales Domain ainda sem forma definida — fora de escopo, sem evidência.

## Responsável

CTO / Arquiteto Chefe — "faça os 3 e já engate no restante da construção", continuação direta e autônoma após `ENG-0144`, usando o próximo passo já sinalizado pela própria `ADR-0043`.

## Data

2026-07-24

## Impactos

- `services/domains/sales/domain/aggregates/contract/**`, `domain/events/contract-*.ts`, `domain/repositories/contract-repository.ts`.
- `services/domains/sales/application/{commands,handlers}/{generate-contract-from-quotation,activate-contract,terminate-contract}/**`.
- `services/domains/sales/infrastructure/{mappers,repositories}/*contract*`.
- `packages/database/prisma/schema.prisma` — model `Contract` + migration.
- `apps/api/src/sales/contract.controller.ts`, atualização de `quotation.controller.ts`/`sales.module.ts`.
- `apps/web/app/contracts/page.tsx` (novo), atualização de `apps/web/app/quotations/page.tsx`.
- `apps/api/src/seed.ts` — novo código de Permission.
- `knowledge/core/BOM.md`, `services/domains/sales/README.md`, `NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md`.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente é migrado — tabela nova, vazia. Aditivo, sem afetar `Quotation`/`Opportunity` existentes.

## Status

Aceito
