# Contrato de Serviço — event-bus

## Objetivo

Publicação e assinatura de eventos de domínio. Toda alteração relevante em qualquer módulo deve gerar um evento aqui ([NOVARIS_CONSTITUTION.md Article XI](../../../knowledge/core/NOVARIS_CONSTITUTION.md)) — nenhum módulo consome eventos de outro por acesso direto a banco.

## Interface Pública

```typescript
publish(event: DomainEvent): void
subscribe(eventType: string, handler: EventHandler): Subscription
unsubscribe(subscription: Subscription): void
```

Implementado (`ADR-0037`, `ENG-0139`) — `InProcessEventBus`, ver § Status.

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `publish` | `event: DomainEvent` | `void` | **Correção (`ENG-0139`)**: a versão anterior desta linha descrevia `DomainEvent` como "tipo, origem, payload, timestamp", divergente do real — já registrado como pendência em `KERNEL_MATURITY_ASSESSMENT.md § 6`/`EVENT_BUS_EPIC_PLANNING.md § 7`/`KERNEL_BOUNDARY_REVIEW.md § 3`. Forma real (`domain-event.ts`, Shared Kernel): `eventId: string`, `aggregateId: UniqueEntityId`, `occurredAt: Date`, `eventName: string` — sem campo de payload de negócio genérico. `eventName` é usado como `eventType` em `subscribe()`. |
| `subscribe` | `eventType: string`, `handler: EventHandler` | `Subscription` | Um handler por assinatura |
| `unsubscribe` | `subscription: Subscription` | `void` | Idempotente |

## Erros

Resolvido por `ADR-0037`: uma exceção lançada por um Subscriber é isolada (`try/catch` por handler, dentro de `publish()`) — não interrompe os demais Subscribers do mesmo evento, nem propaga para quem chamou `publish()`. Fallback de diagnóstico via `console.error` direto (sem depender de `@novaris/logging` — ver § Dependências). "Event-bus indisponível" não se aplica ao mecanismo in-process escolhido (não há rede, não há processo externo a ficar indisponível).

## Eventos Emitidos

Não aplicável no sentido usual — este módulo é o transporte de eventos, não a origem deles. Os eventos que ele transporta (já nomeados em outros documentos) incluem, sem se limitar a: `OrganizationCreated`, `OrganizationActivated`, `OrganizationUpdated`, `OrganizationSuspended`, `OrganizationPlanChanged`, `OrganizationBillingFailed`, `OrganizationArchived`, `OrganizationDeleted` ([objects/Organization.md](../../../knowledge/core/objects/Organization.md)), `UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled` ([BOM.md § 4](../../../knowledge/core/BOM.md)).

## Dependências

Nenhuma (Fase A — fundação).

## Object Specification

Não aplicável — `event-bus` é infraestrutura de transporte, não expõe um Business Object do BOM diretamente.

## Status

🟢 Real (`ENG-0139`, `ADR-0037`). `EventBus` (Port) + `InProcessEventBus` (Infrastructure, in-process síncrono, sem broker externo) implementados e testados. Primeira integração real: `CreateUserHandler` (Identity) publica `UserCreated`; um Subscriber de prova em `apps/api/src/main.ts` consome via `@novaris/logging`. Retrofit dos demais Handlers já implementados (28 de 29) explicitamente adiado — ver `ADR-0037 § Decision`.
