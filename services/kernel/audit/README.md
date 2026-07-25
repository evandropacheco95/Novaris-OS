# audit

## Objetivo

Trilha de auditoria imutável de todas as alterações — único fragmento real confirmado do System Domain (`ADR-0029`).

## Fase

Fase C — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Escopo

**Décimo e último domínio de negócio implementado de ponta a ponta (`ENG-0135`)**, fechando o ciclo iniciado em `ENG-0120`: `AuditEntry` (Aggregate Root único, congelado desde o EPIC-005 — 12 missões, `AUDIT_AGGREGATE_DESIGN_FREEZE.md`) → Application (`CreateAuditEntryHandler`) → Infrastructure (Prisma real, tabela `audit_entries`) → API (`apps/api`, `AuditModule`, somente leitura) → Frontend (`apps/web`, `/system`).

8 campos obrigatórios (`actorId`, `organizationId`, `targetId`, `targetType`, `action`, `occurredAt`, `origin`) + 1 opcional (`changeSet`), todos já congelados por `AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 3-4`. `AuditEntry` é **write-once** — sem `updatedAt`, sem `delete` no Repository (`AuditEntryRepository` diverge deliberadamente do padrão `ReadRepository`+`WriteRepository`, ver `src/domain/repositories/audit-entry-repository.ts`): a tensão entre imutabilidade e uma futura política de retenção/expurgo (LGPD/GDPR) segue **não resolvida**.

**Mecanismo de enriquecimento (`ADR-0035`)**: a Application Layer do domínio de origem é responsável por enriquecer (`actorId`/`organizationId`/`changeSet`) antes de chamar `CreateAuditEntryHandler`, injetado via Dependency Injection — mesmo padrão já usado para `Repository`. Falha ao registrar auditoria nunca reverte a operação primária. Primeira integração real: `UpdateOrganizationProfileHandler` (Organization Domain).

API somente leitura (`GET /audit-entries`, `GET /audit-entries/target/:targetType/:targetId`) — **sem `POST`**, decisão explícita: uma trilha de auditoria não deve ser fabricável manualmente por um usuário autenticado.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md) (histórico) e `src/index.ts` (barrel real).

## Dependências

Identity, Organizations (como domínios de origem que podem gerar `AuditEntry`, não como dependências de código — `AuditEntry` nunca importa tipos concretos de outro domínio, `AUDIT_BOUNDED_CONTEXT.md § 9`).

## Eventos

Nenhum — `AuditEntry` não dispara nenhum Domain Event (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 11` deixa isso explicitamente não decidido; nenhum foi inventado).

## Relação com Outros Módulos

- [adr/ADR-0029](../../../adr/ADR-0029-system-domain-scope-closure.md) — `Audit` confirmado único fragmento real do System Domain
- [adr/ADR-0035](../../../adr/ADR-0035-audit-enrichment-mechanism.md) — mecanismo de enriquecimento e primeira integração real
- `AUDIT_IMPLEMENTATION_READINESS.md` — auditoria de prontidão (`READY WITH CONDITIONS`) que autorizou esta implementação

## Status

🟢 Domain/Application/Infrastructure/API/Frontend completos e testados contra Postgres real (Supabase). 14 testes (10 unitários + 4 de integração real). Bloqueado, por decisão explícita (não esquecido): `delete`, Value Objects reais para `Target`/`Actor`, Domain Events, integração com Event Bus (ainda não existe).
