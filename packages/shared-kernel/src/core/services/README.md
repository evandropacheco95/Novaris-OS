# services

## Objetivo

Domain Services — lógica de domínio que não pertence naturalmente a uma única Entity. Definição: [ENGINEERING_PLAYBOOK.md § 3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer).

## Conteúdo (Missão ENG-0001.8 — Domain Service Contracts)

- [domain-service-result.ts](domain-service-result.ts) — `DomainServiceResult<T>`: type alias sobre [`Result<T, E>`](../../types/README.md) (ENG-0001.3), com `E` fixado em `DomainError | InfrastructureError`.
- [domain-service.ts](domain-service.ts) — `DomainService<TInput, TOutput>`: contrato base; `execute` devolve `DomainServiceResult<TOutput> | Promise<DomainServiceResult<TOutput>>` (união).
- [async-domain-service.ts](async-domain-service.ts) — `AsyncDomainService<TInput, TOutput>`: **estende** `DomainService<TInput, TOutput>`, estreitando `execute` para sempre devolver `Promise<DomainServiceResult<TOutput>>` — narrowing válido em TypeScript, já que `Promise<X>` é um dos membros da união declarada na interface base. Essa união no retorno de `DomainService` existe exatamente para permitir essa relação de herança real entre as duas interfaces (uma alternativa com assinaturas incompatíveis — retorno síncrono vs. `Promise` — não poderia usar `extends`).

Nenhum Domain Service concreto (`PasswordHasher`, `TokenGenerator`, `EmailSender`, `Clock`, etc.) foi implementado — apenas a infraestrutura de contrato.

## Status

🟢 3 componentes implementados e testados (Missão ENG-0001.8). Nenhum Domain Service concreto.
