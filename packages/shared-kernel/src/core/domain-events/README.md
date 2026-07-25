# domain-events

## Objetivo

Eventos que representam algo que já aconteceu no domínio, nomeados no passado (ex.: `OrganizationCreated`), já catalogados parcialmente em [BOM.md](../../../../../knowledge/core/BOM.md)/[objects/](../../../../../knowledge/core/objects/README.md). Definição: [ENGINEERING_PLAYBOOK.md § 3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer).

## Conteúdo (Missão ENG-0001.5 — Domain Event Contracts)

- [domain-event.ts](domain-event.ts) — contrato `DomainEvent` (`interface`, não classe): `eventId: string`, `aggregateId: UniqueEntityId`, `occurredAt: Date`, `eventName: string`. Substitui o placeholder `unknown` que `AggregateRoot` usava desde a Missão ENG-0001.2.

**Por que `interface` e não classe (abstrata ou não)**: mesma convenção de Ports já registrada em [ENGINEERING_PLAYBOOK.md § 9](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#9-padrões-de-código) ("toda Port é uma interface TypeScript, nunca uma classe abstrata, para permitir múltiplos adapters") — tipagem estrutural permite que qualquer evento concreto definido futuramente em `services/domains/<dominio>/` satisfaça o contrato sem depender em runtime de uma classe do Shared Kernel, mantendo `AggregateRoot` (e o próprio contrato) desacoplado de qualquer mecanismo de publicação, Event Bus ou biblioteca externa.

Nenhum evento de domínio concreto (ex.: `OrganizationCreated`) foi implementado — apenas o contrato.

## Status

🟢 Contrato implementado e testado (Missão ENG-0001.5). Eventos de domínio concretos ainda não existem.
