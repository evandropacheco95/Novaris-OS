# audit-entry

Testes de `AuditEntry` (Missão ENG-0005.7).

## Conteúdo

- [audit-entry.test.ts](audit-entry.test.ts) — 10 testes: criação válida, `changeSet` opcional, cada invariante violada (`targetType`/`action`/`origin` vazios), ausência de exceção, ausência de Domain Event, reconstituição sem validação/eventos, `id` estável, e a ausência de método de mutação (verificada por reflexão sobre `AuditEntry.prototype` — todo membro próprio deve ser um getter, nenhum setter).

## Status

🟢 10 testes implementados e passando (Missão ENG-0005.7).
