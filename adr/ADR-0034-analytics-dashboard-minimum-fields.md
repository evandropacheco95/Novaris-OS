# ADR-0034 — Analytics: Campo Mínimo de Conteúdo (`Dashboard.name`)

## Problema

`ANALYTICS_AGGREGATE_DESIGN.md` (`ENG-0132`) confirmou `Dashboard` como Aggregate Root e `Widget` como sua Internal Entity, mas nenhum campo de conteúdo foi definido para nenhum dos dois.

## Contexto

- `BOM.md § Dashboard`: "Painel." — one-liner.
- `Widget` não tem nenhuma evidência de campo além de sua existência estrutural — nem tipo de visualização (gráfico/número/tabela), nem layout/posição. Diferente de `Task.status` (4 valores prontos em `BOM.md`) ou `Activity.type` (6 valores prontos), não há nenhuma enumeração documentada para o que um `Widget` poderia exibir.
- Decisão explícita do CTO: avançar apenas com `Dashboard.name` nesta rodada, deixando `Widget` bloqueado até um caso de uso de negócio real (ex.: um pedido concreto de dashboard) justificar a decisão de quais tipos de visualização suportar — decisão de produto, não de arquitetura, que não deve ser antecipada sem necessidade.

## Decision Drivers

- Mesmo raciocínio de `ADR-0025`/`ADR-0030`/`ADR-0033`: um `Dashboard` sem nome não é exibível em nenhuma lista.
- Inventar um enum de tipos de `Widget` sem nenhuma evidência ou caso de uso real repetiria o erro que esta engenharia evita desde o início (`ENGINEERING_PLAYBOOK.md`, "Verify Before Reimplementing" / disciplina de não fabricar regra de negócio) — a própria pergunta ("que tipos de Widget existem?") é uma decisão de produto, não uma lacuna a preencher com suposição.

## Decision

`Dashboard` ganha:
- `organizationId: UniqueEntityId` (obrigatório) — regra transversal.
- `name: string` (obrigatório) — mesmo padrão de `Party.name`/`Project.name`/`Campaign.name`.

`Widget` **permanece bloqueado** — sem campos definidos além de `id` (`ANALYTICS_AGGREGATE_DESIGN.md § 5`). Uma implementação real de `Dashboard` pode existir sem nenhum `Widget` funcional ainda (Aggregate criável e nomeável, coleção de Widgets vazia por enquanto) — mesma disciplina de escopo mínimo já aplicada em toda missão desta engenharia.

Sem Domain Event — nenhum evento relacionado a `Dashboard`/`Widget` está confirmado em nenhuma fonte.

## Rejected Alternatives

- Definir 2-3 tipos de `Widget` agora (ex.: número/gráfico/tabela) — rejeitada nesta rodada por decisão explícita do CTO; adiada até um caso de uso real.
- Não implementar nem `Dashboard.name` — rejeitada; `name` tem o mesmo nível de evidência trivial já aceito para todo outro domínio (`Party`, `Project`, `Campaign`).

## Consequences

- `BOM.md § Dashboard` recebe nota de extensão não-destrutiva.
- Implementação do Analytics Domain fica restrita a `Dashboard` (criar, nomear, listar) — sem nenhuma funcionalidade real de exibição de dados até `Widget` ser desbloqueado por uma ADR futura.

## Responsável

CTO / Arquiteto Chefe, decisão direta ("Seguir só com Dashboard.name por agora").

## Data

2026-07-24

## Impactos

- `knowledge/core/BOM.md § Dashboard` — nota de extensão não-destrutiva.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum — nenhum código do Analytics Domain existe ainda.

## Status

Aceito
