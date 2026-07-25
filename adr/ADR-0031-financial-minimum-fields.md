# ADR-0031 — Financial: Campos Mínimos de Conteúdo (`Invoice`, `Subscription`)

## Problema

`ADR-0027` confirmou a estrutura (`Invoice` e `Subscription` como dois Aggregate Roots independentes), mas nem `BOM.md § Invoice` nem `§ Subscription` definem campos de conteúdo além do conceito — mesma classe de bloqueio já resolvida para `Party` (`ADR-0025`) e `Project`/`Task` (`ADR-0030`).

## Contexto

- `BOM.md § Invoice`: "Documento financeiro." — one-liner.
- `UBIQUITOUS_LANGUAGE.md § Domínio: Financial`: `Invoice` — "Para cobrança formal emitida"; Objetos Relacionados: `Payment`; **Eventos Relacionados: `InvoicePaid`**. Este é o único objeto do Financial Domain com um evento oficial já confirmado (`DOMAIN_MODEL.md § EVENT BUS`, um dos 10 eventos da plataforma) — evidência real de que `Invoice` tem, no mínimo, uma transição para um estado "paga".
- `Payment`: "Para o recebimento/liquidação de um Invoice... Payment é o evento financeiro, Revenue é o reconhecimento contábil" — descrito como o **mecanismo** que liquida um `Invoice`, não como um registro com campos próprios documentados em nenhum lugar.
- `BOM.md § Subscription`: "Assinatura." — one-liner, sem estados, sem campos — diferente de `Task` (`ADR-0030`), que tinha uma lista real de `Estados:`. Nenhuma fonte define ciclo de vida de `Subscription`.

## Decision Drivers

- Mesmo raciocínio de `ADR-0025`/`ADR-0030`: um `Invoice`/`Subscription` sem nenhum campo de identificação/valor não serve ao propósito documentado.
- `InvoicePaid` já being um evento oficial da plataforma é evidência real e suficiente para justificar **um campo de status mínimo de 2 valores** (`pending`/`paid`) — não uma tabela de estados inventada, apenas o par mínimo necessário para representar a transição já confirmada.
- `Payment` não tem nenhum campo, relação ou forma própria documentada — modelá-lo como Entity/Aggregate agora inventaria uma estrutura sem evidência. A ação de liquidação é representada diretamente por um método no próprio `Invoice` (`markPaid()`), mesmo padrão de `Opportunity.markWon()`/`markLost()` não exigirem um objeto "Resultado" separado.
- `Subscription` não tem nenhuma evidência de estado — diferente de `Task`, não recebe um campo `status` nesta ADR.

## Decision

- **`Invoice`**: `amount: number` (obrigatório — valor monetário, sem Value Object `Money` próprio, nenhuma fonte define precisão/moeda como conceito estruturado), `currency: string` (obrigatório — código, sem validação de formato, mesmo padrão de `Organization.document`), `status: "pending" | "paid"` (obrigatório, nasce `"pending"`; `markPaid()` transiciona para `"paid"` e dispara `InvoicePaid` — único Domain Event do Financial Domain com confirmação oficial), `subscriptionId?: UniqueEntityId` (opcional, referência já decidida em `ADR-0027`).
- **`Subscription`**: `name: string` (obrigatório — mesmo padrão de `Party.name`/`Project.name`). Sem campo de status — `Needs Evidence`, não inventado.
- **`Payment`** permanece **não implementado como objeto próprio** — representado pela ação `Invoice.markPaid()`. Se uma necessidade real de rastrear múltiplos pagamentos parciais por Invoice surgir, isso exigirá uma ADR própria (fora do escopo aqui).
- `Expense`/`Billing`/`Commission` permanecem `Needs Evidence`, não implementados.

## Rejected Alternatives

- Modelar `Payment` como Entity interna de `Invoice` — rejeitada, nenhuma fonte define seus campos, e a única ação documentada (liquidar um Invoice) já é coberta por `Invoice.markPaid()`.
- Inventar um Value Object `Money` (amount + currency estruturados) — rejeitada nesta ADR; `amount`/`currency` como campos primitivos são suficientes para o escopo mínimo, mesma disciplina de não introduzir abstração sem necessidade concreta (`Revenue`, Sales, já registrou a mesma pendência sem resolver).
- Adicionar `status` a `Subscription` (ex.: `"active"`/`"cancelled"`) — rejeitada, nenhuma fonte confirma esses valores, diferente do caso real de `Task.status` (`BOM.md` já listava os 4 estados).

## Consequences

- `BOM.md § Invoice`/`§ Subscription` recebem nota de extensão não-destrutiva, citando esta ADR.
- Implementação do Financial Domain pode prosseguir com `ADR-0027` (estrutura) + esta ADR (campos).

## Responsável

CTO / Arquiteto Chefe, decisão direta ("siga com o Financial").

## Data

2026-07-24

## Impactos

- `knowledge/core/BOM.md § Invoice`/`§ Subscription` — nota de extensão não-destrutiva.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum — nenhum código do Financial Domain existe ainda.

## Status

Aceito
