# ADR-0035 — Audit: Mecanismo de Enriquecimento pela Application Layer de Origem

## Problema

`AUDIT_DOMAIN_DECISIONS.md § 5` já confirmou, conceitualmente, que a Application Layer do domínio de origem é responsável pelo enriquecimento de um `AuditEntry` (anexar `actorId`/`organizationId`/`changeSet` antes da criação) — mas explicitamente não decidiu o mecanismo concreto ("não define se isso acontece via um wrapper, um Decorator, ou qualquer mecanismo concreto"), e marcou essa necessidade de ADR como "recomendada, ainda não criada" (`AUDIT_IMPLEMENTATION_READINESS.md § 6`). Sem essa decisão, nenhuma integração real entre um domínio de origem e o Audit Domain pode acontecer sem inventar um padrão ad-hoc. Esta ADR decide o mecanismo concreto e autoriza a primeira integração real.

## Contexto

- Event Bus não existe (`KERNEL_MATURITY_ASSESSMENT.md § 9`, Epic futuro, não iniciado) — qualquer mecanismo de acoplamento assíncrono real está fora de alcance hoje.
- `AuditEntry`, `AuditEntryRepository` (Prisma real, tabela `audit_entries`) e `CreateAuditEntryHandler` (Application Layer do próprio Audit Domain) já implementados e testados contra Postgres real (`ENG-0135`) — o Audit Domain já sabe persistir uma entrada; falta apenas quem a alimenta com dado real.
- `AUDIT_IMPLEMENTATION_READINESS.md § 10` já libera explicitamente "qualquer integração real com Identity/Organization como domínios de origem" apenas **depois** desta ADR existir — condição agora satisfeita por este documento.
- `AUDIT_DOMAIN_DECISIONS.md § 9` deixou explicitamente adiado o "tratamento se o enriquecimento falhar (dado de origem incompleto)" para "uma fase de implementação futura, não de modelagem de domínio" — essa fase é agora; esta ADR resolve essa pendência também.

## Decision Drivers

- `AGGREGATE_IMPLEMENTATION_STANDARD.md § 6` (ENS-0001) já estabelece que `createdBy`/`updatedBy` são sempre fornecidos pela Application Layer que executa a operação — o mesmo padrão de Dependency Injection já usado para `Repository` em todo domínio desta engenharia é reaproveitável aqui, sem inventar um mecanismo novo.
- Sem Event Bus, qualquer alternativa que dependa de mensageria assíncrona antecipa uma decisão de infraestrutura que ainda não existe.
- Uma falha ao registrar auditoria não pode ser autorizada a impedir a operação de negócio primária que já foi executada e persistida com sucesso — bloquear um usuário porque a trilha de auditoria falhou seria pior do que a trilha ficar incompleta.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Chamada direta via Dependency Injection** | O Handler do domínio de origem recebe `CreateAuditEntryHandler` injetado no construtor (mesmo padrão já usado para `Repository`) e o chama diretamente após sua própria operação ter sucesso | Escolhida — não exige infraestrutura nova, reaproveita um padrão já congelado |
| B. Decorator/Wrapper genérico | Um decorator envolveria qualquer Handler e chamaria o Audit automaticamente, sem o Handler saber | Rejeitada — exigiria um mecanismo de metadados/reflection não usado em nenhum outro lugar desta engenharia; a chamada direta já é suficientemente simples e explícita |
| C. Event Bus (publish, Audit consome de forma assíncrona) | O Handler de origem publicaria um evento; um consumidor do Audit Domain enriqueceria e persistiria | Rejeitada por ora — Event Bus não existe (`KERNEL_MATURITY_ASSESSMENT.md § 9`); adotar essa opção hoje seria inventar infraestrutura fora do escopo desta ADR. Não descartada para o futuro — quando o Event Bus existir, pode substituir a chamada direta sem mudar a Opção A de "quem enriquece" |

## Decision

**Opção A — Chamada direta via Dependency Injection.**

- **Mecanismo**: o Handler do domínio de origem (ex.: `UpdateOrganizationProfileHandler`) recebe `CreateAuditEntryHandler` (Audit Domain) injetado no construtor — mesma forma de Dependency Injection já usada para `Repository` em todo Handler desta engenharia. Depois de sua própria operação de negócio ter sucesso (Aggregate mutado + persistido), o Handler monta o `CreateAuditEntryCommand` com os dados que já possui (não precisa consultar nenhum outro domínio) e chama `createAuditEntryHandler.execute()`.
- **Origem de cada campo**: `actorId` vem do usuário autenticado (`req.user.userId`, já disponível em todo Controller protegido por `JwtAuthGuard`), propagado até o Handler via um novo campo no Command de origem (ex.: `UpdateOrganizationProfileCommand.actorId`); `organizationId` já é conhecido pelo Handler (é o próprio tenant da operação); `targetId`/`targetType` identificam o Aggregate mutado; `action` é uma string descritiva do caso de uso (ex.: `"OrganizationProfileUpdated"`); `occurredAt` é `new Date()` no momento da chamada; `origin` é a string literal `"api"` por enquanto — nenhuma captura de IP/user-agent real é inventada sem necessidade concreta; `changeSet`, quando aplicável, é `{ before, after }` montado pelo próprio Handler a partir dos valores que ele já lê/muta.
- **Falha no enriquecimento não reverte nem falha a operação primária**: se `createAuditEntryHandler.execute()` devolver falha, o Handler de origem **ainda devolve sucesso** para sua própria operação (que já foi persistida) — a trilha de auditoria é uma preocupação secundária/observacional, não um invariante de negócio da operação primária. A chamada é `await`ada (para garantir que ao menos foi tentada antes do Handler retornar), mas seu `Result` não é propagado como falha do Handler de origem. Nenhum mecanismo de log estruturado é criado por esta ADR — ausência de log de erro aqui é escopo explicitamente não resolvido (requer infraestrutura de observabilidade própria, fora de alcance).
- **Primeira integração real**: `UpdateOrganizationProfileHandler` (Organization Domain) — escolhido por já ter dado real de "antes"/"depois" (é uma atualização, não uma criação), permitindo popular `changeSet` com evidência real em vez de um valor sempre vazio.

## Rejected Alternatives

Ver Opções B e C acima.

## Consequences

- `UpdateOrganizationProfileCommand` ganha `actorId: string` (obrigatório).
- `UpdateOrganizationProfileHandler` ganha uma segunda dependência de construtor (`CreateAuditEntryHandler`), quebrando sua assinatura atual — toda instanciação (produção via `OrganizationModule`, testes) precisa ser atualizada.
- `@novaris/organizations` ganha dependência de `@novaris/database`... na verdade de `@novaris/audit` (novo).
- Todo domínio futuro que quiser ser auditado segue o mesmo padrão: Command ganha `actorId`, Handler ganha `CreateAuditEntryHandler` injetado, chama após sucesso, não propaga falha de auditoria como falha da operação primária.
- Quando o Event Bus existir, a Opção C pode substituir esta chamada direta sem reabrir "quem enriquece" (`AUDIT_DOMAIN_DECISIONS.md § 5` permanece válido) — apenas o "como" muda.

## Responsável

CTO / Arquiteto Chefe, decisão direta ("Escrever a ADR de enriquecimento + integrar 1 domínio real"), ao escolher entre 3 opções de escopo para fechar o Audit/System Domain.

## Data

2026-07-24

## Impactos

- `services/kernel/organizations/src/application/commands/update-organization-profile/update-organization-profile.command.ts` — novo campo `actorId`.
- `services/kernel/organizations/src/application/handlers/update-organization-profile/update-organization-profile.handler.ts` — nova dependência, nova lógica de enriquecimento.
- `apps/api/src/organization/organization.controller.ts`/`organization.module.ts` — propagação de `actorId`, nova injeção de `CreateAuditEntryHandler`.
- `AUDIT_DOMAIN_DECISIONS.md § 5` — nota de resolução não-destrutiva (ADR criada).
- `AUDIT_IMPLEMENTATION_READINESS.md § 10` — nota de resolução não-destrutiva (condição satisfeita, integração liberada).
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente é migrado — `UpdateOrganizationProfileCommand`/`Handler` não têm estado persistido próprio; a mudança de assinatura afeta apenas código, não dados já gravados.

## Status

Aceito
