# UserCreated

Primeiro contrato de evento real desta pasta (`packages/contracts/events/`, antes vazia desde `ENG-0000.1`) — escrito para cumprir a regra já existente em [packages/contracts/README.md](../README.md) ("eventos já nomeados oficialmente devem ter contrato correspondente aqui antes de qualquer implementação real"), como parte de `ENG-0139`/`ADR-0037`.

## Nome

`UserCreated`

## Origem

`User.create()` — Identity Domain (`services/kernel/identity/src/domain/aggregates/user/user.ts`), disparado desde a Missão ENG-0002 (`EPIC-002`). Publicado via Event Bus real pela primeira vez em `ENG-0139` — `CreateUserHandler` (`services/kernel/identity/src/application/handlers/create-user/`) publica cada `domainEvent` do `User` recém-criado após `save()` ter sucesso.

## Payload

| Campo | Tipo | Descrição |
|---|---|---|
| `eventId` | `string` (UUID) | Identificador único do evento, gerado em `new UserCreated()` |
| `aggregateId` | `UniqueEntityId` | Id do `User` criado |
| `occurredAt` | `Date` | Timestamp de emissão (momento da criação do `User`, não da publicação) |
| `eventName` | `"UserCreated"` (literal) | Nome do evento — usado como `eventType` em `EventBus.subscribe()` |

Sem payload de negócio adicional (`email`, `organizationId` etc.) nesta versão — `User.create()` só popula os 4 campos já definidos por `DomainEvent` (`domain-event.ts`, Shared Kernel). Ver Nota abaixo.

## Versão

v1 — primeira versão.

## Nota

Payload mínimo por decisão estrutural já existente em `DomainEvent`, não uma limitação introduzida por este contrato. Se um Subscriber futuro precisar de mais campos (ex.: `email`), ele deve recarregar o Aggregate via `UserRepository` usando `aggregateId` — mesmo padrão já usado por Audit (`ADR-0035`) para não duplicar dado através de um evento fino.

## Subscribers Conhecidos

- Subscriber de prova em `apps/api/src/main.ts` — loga o evento via `@novaris/logging` (`ConsoleLogger`). Sem lógica de negócio, só observabilidade.

## Relação com Outros Módulos

- [services/kernel/event-bus/CONTRACT.md](../../../services/kernel/event-bus/CONTRACT.md) — transporte que carrega este evento
- [services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md](../../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md) — origem oficial do evento
- [adr/ADR-0037](../../../adr/ADR-0037-event-bus-mechanism.md) — decisão que autorizou esta primeira integração real

## Status

🟢 Real — primeiro contrato de evento efetivamente escrito e publicado via Event Bus real (`ENG-0139`).
