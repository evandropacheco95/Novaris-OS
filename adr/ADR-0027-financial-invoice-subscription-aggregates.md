# ADR-0027 — Financial Domain: `Invoice` e `Subscription` são dois Aggregate Roots independentes

## Problema

`AGGREGATE_DISCOVERY.md § 4` registra, desde `ENG-0012`: "Reconciliar `Invoice` vs. `Subscription` como um ou dois Aggregates em `Financial`" — nunca resolvida. Adicionalmente, `services/domains/financial/README.md` contém uma nota desatualizada ("Subscription já em `services/kernel/organizations`") que contradiz a decisão já formalizada em `DOMAIN_OWNERSHIP.md`/`ENG-0011` (Owner de `Subscription` = Financial). Esta ADR resolve as duas pendências.

## Contexto

- `DOMAIN_OWNERSHIP.md § 169` já confirma, de forma inequívoca: **"os 4 casos que pareciam ambíguos (`Task`, `Queue`, `Release`, `Subscription`) já foram resolvidos: `Task`, `Release`, `Subscription` por decisão explícita do CTO (`ENG-0011`), cada um com exatamente um Owner de domínio"** — `Subscription` → Financial. Não há ambiguidade de **posse** a resolver aqui; a nota em `services/domains/financial/README.md` está simplesmente desatualizada (escrita antes de `ENG-0011`, nunca corrigida).
- `BOM.md § Invoice`/`§ Subscription` — ambos são one-liners ("Documento financeiro" / "Assinatura"), sem campos, sem relacionamento explícito entre os dois.
- `DOMAIN_MODEL.md § FINANCIAL DOMAIN`: objetos `Invoice`, `Expense`, `Payment`, `Subscription`, `Billing`, `Commission` — nenhuma fonte declara um "contém" o outro.
- **Precedente decisivo**: `Sales` já tem dois Aggregate Roots independentes no mesmo domínio (`Opportunity` e `Pipeline`, `ADR-0021`) — a existência de mais de um Aggregate Root por domínio já é um padrão aceito nesta arquitetura, não uma exceção a evitar.
- Naturezas conceituais distintas: `Invoice` é um documento financeiro pontual, gerado por um evento específico (ex.: fechamento de uma `Opportunity`, cobrança avulsa); `Subscription` é um **acordo recorrente** com ciclo de vida próprio (ativa → cancelada → renovada), que **gera** `Invoice`s ao longo do tempo, mas não é, ela mesma, um documento financeiro. Essa relação ("gera") é a mesma natureza estrutural de `Relationship` referenciando `Party` por id (`RELATIONSHIP_AGGREGATE_DESIGN.md § 8`) — nunca embutido, nunca posse direta.

## Decision Drivers

- Nenhuma fonte trata `Invoice` e `Subscription` como a mesma coisa, nem como um contendo o outro — são conceitos financeiros distintos (documento pontual vs. acordo recorrente).
- O precedente de `Sales` (`Opportunity` + `Pipeline`, dois Aggregate Roots) já valida estruturalmente que um domínio ter múltiplos Aggregate Roots não viola nenhum princípio já estabelecido nesta engenharia.
- Forçar os dois a serem um único Aggregate (ex.: `Subscription` com uma coleção interna de `Invoice`) inventaria uma relação de posse não sustentada por nenhuma fonte, e contradiria a natureza temporal de `Invoice` (documentos financeiros tipicamente precisam de auditoria/imutabilidade próprias, incompatíveis com viver só como sub-item de outro Aggregate).

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Dois Aggregate Roots independentes** | `Invoice` e `Subscription`, cada um com identidade e Repository próprios; `Invoice` pode referenciar `Subscription` por id quando gerado a partir de uma (campo opcional), nunca o inverso | Escolhida — reflete a natureza conceitual real dos dois objetos, mesmo padrão de múltiplos Aggregate Roots já usado em `Sales` |
| B. `Subscription` como Aggregate Root, `Invoice` como Entity interna | `Invoice`s só existiriam dentro de uma `Subscription` | Rejeitada — `Invoice` avulsa (não gerada por assinatura, ex.: cobrança pontual de uma `Opportunity` fechada) não teria onde existir; nenhuma fonte restringe `Invoice` a nascer sempre de uma `Subscription` |
| C. `Invoice` como Aggregate Root, `Subscription` como Entity interna | Inverso de B | Rejeitada — mesma objeção inversa: uma `Subscription` sem nenhuma `Invoice` ainda gerada (recém-criada) precisa existir e ser consultável independentemente |

## Decision

**Opção A.** `Invoice` e `Subscription` são **dois Aggregate Roots independentes** do Financial Domain. `Invoice.subscriptionId?: UniqueEntityId` (opcional) é o único ponto de referência entre os dois — nunca embutido, mesmo padrão de `Opportunity.partyId`.

**Resolução adicional (posse de `Subscription`)**: confirmado, **sem nova decisão** — `Subscription` pertence ao Financial Domain, já decidido por `ENG-0011`/`DOMAIN_OWNERSHIP.md`. A nota conflitante em `services/domains/financial/README.md` é anotada como não-destrutiva (texto original preservado, resolução citada).

`Payment`/`Expense`/`Billing`/`Commission` permanecem **`Needs Evidence`** — nenhum tem campo, forma ou relação com `Invoice`/`Subscription` definida em nenhuma fonte; não resolvidos por esta ADR.

## Rejected Alternatives

Ver Opções B e C acima.

## Consequences

- `AGGREGATE_DISCOVERY.md § 4` — item "Reconciliar `Invoice` vs. `Subscription`" pode ser marcado resolvido, citando esta ADR.
- `services/domains/financial/README.md` recebe nota de resolução não-destrutiva.
- Uma futura implementação do Financial Domain começa por `Invoice`/`Subscription` como dois Aggregates irmãos, mesmo padrão de `Opportunity`/`Pipeline`.

## Responsável

CTO / Arquiteto Chefe — decisão explícita ("pode resolver as pendências").

## Data

2026-07-23

## Impactos

- `services/domains/financial/README.md` — nota de resolução não-destrutiva.
- `knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md § 4` — nota de resolução não-destrutiva.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum — nenhum código do Financial Domain existe ainda.

## Status

Aceito
