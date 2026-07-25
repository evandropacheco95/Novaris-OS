# ADR-0032 — Activity: Campos Mínimos de Conteúdo

## Problema

`ACTIVITY_AGGREGATE_DESIGN.md` (`ENG-0132`) confirmou `Activity` como Aggregate Root único do domínio, mas deixou em aberto o campo de conteúdo e os valores exatos do estado implícito pelos 2 eventos já confirmados (`ActivityCreated`/`ActivityCompleted`). Sem essa resolução, `Activity` não pode ser implementado.

## Contexto

- `BOM.md § Activity`: "Registro de interação", com `Tipos:` (`Ligação`, `WhatsApp`, `E-mail`, `Reunião`, `Visita`, `Nota`) e `Eventos:` (`ActivityCreated`, `ActivityCompleted`) — ambos já confirmados, sem decisão pendente.
- `UBIQUITOUS_LANGUAGE.md`: "Para qualquer interação registrada **com um Party**" — `partyId` já evidenciado.
- Nenhuma fonte nomeia um campo de conteúdo textual (nota/descrição da interação) nem os valores exatos do campo de estado — apenas os 2 eventos-limite (criação/conclusão) são confirmados.

## Decision Drivers

- `type`/`partyId`/`organizationId` já têm evidência direta — não são decisão desta ADR, só consolidados aqui.
- `status`: os 2 eventos confirmados (`ActivityCreated`, `ActivityCompleted`) implicam necessariamente uma transição entre 2 estados — o mínimo estrutural para representá-los é um campo de 2 valores, mesmo raciocínio já usado para `Invoice.status` (`ADR-0031`, derivado do evento `InvoicePaid`).
- `notes`: diferente de `Party.name` (sem o qual o objeto é irreconhecível), uma `Activity` já é identificável por `partyId`+`type`+`createdAt` mesmo sem texto livre — por isso, opcional, não obrigatório.

## Decision

`Activity` ganha:
- `organizationId: UniqueEntityId` (obrigatório) — regra transversal.
- `partyId: UniqueEntityId` (obrigatório) — evidenciado em `UBIQUITOUS_LANGUAGE.md`.
- `type: "ligacao" | "whatsapp" | "email" | "reuniao" | "visita" | "nota"` (obrigatório) — 6 valores já nomeados em `BOM.md § Activity`, nenhum inventado.
- `status: "open" | "completed"` (obrigatório, nasce `"open"`) — derivado diretamente dos 2 eventos já confirmados; `complete()` transiciona para `"completed"` e dispara `ActivityCompleted`.
- `notes?: string` (**opcional**) — texto livre da interação; não incluído como obrigatório por não haver evidência de que uma Activity sem conteúdo textual seja inválida.

`ActivityCreated` disparado por `create()`, `ActivityCompleted` disparado por `complete()` — ambos já confirmados em `BOM.md § Activity` (seção `Eventos:`), não em `DOMAIN_MODEL.md § EVENT BUS` (achado já registrado em `ACTIVITY_AGGREGATE_DESIGN.md § 6`, tratado como evidência suficiente pela mesma fonte primária).

## Rejected Alternatives

- Tornar `notes` obrigatório — rejeitada, nenhuma evidência sustenta essa obrigatoriedade, e o objeto permanece identificável sem ele.
- Inventar valores intermediários de status (ex.: `"in_progress"`) — rejeitada, só 2 eventos são confirmados, nenhum terceiro estado tem qualquer evidência.

## Consequences

- `BOM.md § Activity` recebe nota de extensão não-destrutiva.
- Implementação do Activity Domain pode prosseguir com `ACTIVITY_AGGREGATE_DESIGN.md` (estrutura) + esta ADR (campos).

## Responsável

CTO / Arquiteto Chefe, decisão direta ("quero que proponha sim").

## Data

2026-07-24

## Impactos

- `knowledge/core/BOM.md § Activity` — nota de extensão não-destrutiva.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum — nenhum código do Activity Domain existe ainda.

## Status

Aceito
