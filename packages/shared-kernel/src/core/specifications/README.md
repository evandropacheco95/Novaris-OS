# specifications

## Objetivo

Regras de negócio combináveis e testáveis isoladamente (ex.: "organização pode ativar usuário"). Definição: [ENGINEERING_PLAYBOOK.md § 3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer).

## Conteúdo (Missão ENG-0001.6 — Specification Pattern)

- [specification.ts](specification.ts) — `Specification<T>`: contrato (`isSatisfiedBy`, `and`, `or`, `not`).
- [abstract-specification.ts](abstract-specification.ts) — `AbstractSpecification<T>`: base para Specifications concretas de domínio; só `isSatisfiedBy` é abstrato.
- [and-specification.ts](and-specification.ts), [or-specification.ts](or-specification.ts), [not-specification.ts](not-specification.ts) — `AndSpecification<T>`, `OrSpecification<T>`, `NotSpecification<T>`: composição fluente.

**Detalhe de implementação relevante**: `AndSpecification`/`OrSpecification`/`NotSpecification` implementam `Specification<T>` diretamente — **não estendem** `AbstractSpecification`. Motivo: `AbstractSpecification.and()/or()/not()` precisa importar as 3 classes de composição para construí-las; se essas 3 classes estendessem `AbstractSpecification`, o import circular resultante quebra em runtime (`ReferenceError: Cannot access 'AbstractSpecification' before initialization`, `extends` é avaliado de forma síncrona) — confirmado empiricamente durante esta missão antes de ser corrigido. A composição funcional é idêntica; só a relação de herança das 3 classes concretas de composição muda. Ver comentário completo em `abstract-specification.ts`.

Nenhuma Specification concreta de domínio (ex.: `OrganizationIsActiveSpecification`) foi implementada — apenas a infraestrutura do padrão.

## Status

🟢 5 componentes implementados e testados (Missão ENG-0001.6). Nenhuma Specification concreta implementada.
