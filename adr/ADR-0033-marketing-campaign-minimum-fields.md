# ADR-0033 — Marketing: Campos Mínimos de Conteúdo (`Campaign`)

## Problema

`MARKETING_AGGREGATE_DESIGN.md` (`ENG-0132`) confirmou `Campaign` como único Aggregate Root do domínio, mas nem `BOM.md` nem `UBIQUITOUS_LANGUAGE.md` definem nenhum campo de conteúdo.

## Contexto

- `BOM.md § Campaign`: "Campanha." — one-liner, sem `Tipos:`/`Estados:`/`Eventos:` (diferente de `Activity`/`Task`).
- `UBIQUITOUS_LANGUAGE.md`: "Para iniciativa de marketing **com início/fim**" — sugere período, mas não confirma formato nem obrigatoriedade.
- `Asset` permanece fora do escopo desta ADR — sua posse (Marketing vs. conceito transversal) não está resolvida (`MARKETING_AGGREGATE_DESIGN.md § 3`), e resolver seus campos antes dessa pergunta estrutural inverteria a ordem de decisão.

## Decision Drivers

- Mesmo raciocínio de `ADR-0025`/`ADR-0030`: um `Campaign` sem nome não é exibível em nenhuma tela.
- Datas de início/fim são sugeridas pela própria definição do conceito ("com início/fim"), mas uma campanha em fase de rascunho pode razoavelmente não ter datas fechadas ainda — mesmo critério de opcionalidade já usado para `Party.document`/`Invoice.subscriptionId`.

## Decision

`Campaign` ganha:
- `organizationId: UniqueEntityId` (obrigatório) — regra transversal.
- `name: string` (obrigatório) — mesmo padrão de `Party.name`/`Project.name`.
- `startDate?: Date` (**opcional**) — sugerido por "com início/fim", não obrigatório por poder ser indefinido em rascunho.
- `endDate?: Date` (**opcional**) — mesma justificativa.

Sem Domain Event — nenhum evento relacionado a `Campaign` está confirmado em `BOM.md` ou `DOMAIN_MODEL.md § EVENT BUS` (`MARKETING_AGGREGATE_DESIGN.md § 5`).

`Asset` **não é resolvido por esta ADR** — permanece bloqueado até decisão de posse.

## Rejected Alternatives

- Tornar `startDate`/`endDate` obrigatórios — rejeitada, "com início/fim" descreve a natureza do conceito, não confirma que ambas as datas sejam conhecidas no momento da criação.
- Resolver campos de `Asset` juntamente com `Campaign` — rejeitada, a pergunta de posse (§ Contexto) precisa ser resolvida primeiro, fora do escopo desta ADR.

## Consequences

- `BOM.md § Campaign` recebe nota de extensão não-destrutiva.
- Implementação do Marketing Domain pode prosseguir com `MARKETING_AGGREGATE_DESIGN.md` (estrutura) + esta ADR (campos de `Campaign`), restrita a `Campaign` — `Asset` continua fora de escopo.

## Responsável

CTO / Arquiteto Chefe, decisão direta ("quero que proponha sim").

## Data

2026-07-24

## Impactos

- `knowledge/core/BOM.md § Campaign` — nota de extensão não-destrutiva.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum — nenhum código do Marketing Domain existe ainda.

## Status

Aceito
