# ADR-0029 — System Domain: `Audit` é o único fragmento confirmado; demais objetos formalmente adiados; `Release`/`Queue` reconciliados

## Problema

`DOMAIN_OWNERSHIP.md § 144` registra, desde `ENG-0012`: **"`System Domain` nunca teve Bounded Context próprio confirmado além de `Audit` (fragmento)"** — `Event Log`, `Integration`, `Webhook`, `Job`, `Migration`, `Feature Flag`, `Health Check` permanecem `Ownership Pending CTO Decision` indefinidamente. Adicionalmente, `DOMAIN_MODEL.md § SYSTEM DOMAIN` ainda lista `Release` e `Queue` como objetos deste domínio, embora ambos já tenham Owner definitivo resolvido em outro lugar (`ENG-0011`/`ADR-0012`/`ADR-0013`) — divergência nunca reconciliada. Esta ADR fecha as duas pendências.

## Contexto

- `Audit Log` → Owner `Audit` (Kernel), já **implementado de ponta a ponta** (`AuditEntry` Aggregate, Repository, Mapper — `services/kernel/audit/`) — único fragmento real do System Domain hoje.
- `Event Log`, `Integration`, `Webhook`, `Job`, `Migration`, `Feature Flag`, `Health Check` — `DOMAIN_OWNERSHIP.md § 144` já observa que são "candidatos de Infrastructure Capability já existente no Kernel" (`integration-hub`, `scheduler`, `feature-flags`, todos README-only, sem código) — não objetos de negócio com regras próprias, e sim capacidades técnicas transversais. Nenhum tem campo, ciclo de vida ou evento definido em nenhuma fonte.
- `Release` — `DOMAIN_OWNERSHIP.md § 93/150` já confirma Owner **Platform/Engineering** (decisão CTO, `ENG-0011` item 10), não System. `DOMAIN_MODEL.md § SYSTEM DOMAIN` ainda o lista como objeto do domínio — texto desatualizado, nunca corrigido.
- `Queue` — `DOMAIN_OWNERSHIP.md § 169` confirma: percorreu `ENG-0011` (Owner CRM) → `ADR-0012` (Owner Automation) → `ADR-0013` (`Automation` reclassificado Platform Capability, não domínio) — resultado final: **`Queue` não tem Owner de Domain Layer**, é conceito de Infrastructure. `DOMAIN_MODEL.md § SYSTEM DOMAIN` também o lista como objeto — mesma divergência de `Release`.
- Esta ADR **não reclassifica `System` para fora da lista de 10 Business Domains** (`ADR-0024`, já congelada) — trata apenas do conteúdo interno do domínio, não de sua existência como Business Domain.

## Decision Drivers

- Mesma disciplina já aplicada em `ADR-0028` (Workspace): sem caso de uso de negócio concreto, adiar é mais honesto do que inventar estrutura.
- `Release`/`Queue` já têm resolução formal registrada em outro documento (`DOMAIN_OWNERSHIP.md`) — a divergência é de **reconciliação de texto**, não de decisão nova.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Confirmar `Audit` como único fragmento; adiar os 7 demais; reconciliar `Release`/`Queue`** | Fecha a pendência sem inventar nenhuma estrutura nova | Escolhida |
| B. Inventar estrutura mínima para os 7 objetos candidatos | Ex.: `Webhook { url, event }`, `Job { status }` | Rejeitada — nenhuma fonte sustenta esses campos; seriam capacidades de Infrastructure genéricas (fila de eventos, agendador), não objetos de negócio com regra própria — modelá-los como Aggregates de Domain Layer inventaria uma fronteira que não existe |
| C. Remover `Release`/`Queue` do texto de `DOMAIN_MODEL.md § SYSTEM DOMAIN` | Apagaria a menção em vez de anotar | Rejeitada — viola a disciplina de não-destrutividade já usada em toda esta engenharia (texto original de documentos "Oficiais" nunca é apagado, só anotado) |

## Decision

**Opção A.**

- **`Audit`** permanece o único fragmento confirmado e implementado do System Domain.
- **`Event Log`, `Integration`, `Webhook`, `Job`, `Migration`, `Feature Flag`, `Health Check`** — formalmente **adiados**, mesma disciplina de `ADR-0028`: sem Owner de Domain Layer, sem campo, sem implementação, até que uma necessidade de negócio concreta os justifique. Continuam existindo como pastas de Kernel (`integration-hub`, `scheduler`, `feature-flags` etc.) na capacidade de Infrastructure/Platform, não como Aggregates de Business Domain.
- **`Release`**: confirmado Owner `Platform/Engineering` (reafirma `ENG-0011` item 10, não uma decisão nova) — `DOMAIN_MODEL.md § SYSTEM DOMAIN` recebe nota de resolução não-destrutiva.
- **`Queue`**: confirmado sem Owner de Domain Layer (reafirma `ADR-0013`) — mesma nota de resolução não-destrutiva.

## Rejected Alternatives

Ver Opções B e C acima.

## Consequences

- `knowledge/core/DOMAIN_MODEL.md § SYSTEM DOMAIN` — nota de resolução não-destrutiva sobre `Release`/`Queue`.
- `DOMAIN_OWNERSHIP.md § 144` — nota de resolução não-destrutiva sobre os 7 objetos adiados.
- Nenhuma mudança de código — `Audit` já implementado permanece como está.
- `System` permanece um dos 10 Business Domains confirmados (`ADR-0024`), agora com escopo interno honesto: um fragmento real (`Audit`), sete candidatos adiados.

## Responsável

CTO / Arquiteto Chefe — decisão explícita ("pode resolver as pendências").

## Data

2026-07-23

## Impactos

- `knowledge/core/DOMAIN_MODEL.md § SYSTEM DOMAIN` — nota de resolução não-destrutiva.
- `knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md § 144` — nota de resolução não-destrutiva.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum.

## Status

Aceito
