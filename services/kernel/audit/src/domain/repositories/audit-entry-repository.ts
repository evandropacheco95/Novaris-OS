import type { ReadRepository, Result, InfrastructureError, UniqueEntityId } from "@novaris/shared-kernel";
import type { AuditEntry } from "../aggregates/audit-entry/audit-entry.js";

/**
 * Contrato de persistência do Aggregate `AuditEntry` — port da Domain Layer.
 *
 * Diverge deliberadamente do padrão `extends ReadRepository<T>, WriteRepository<T>`
 * já usado por `OrganizationRepository`/`UserRepository`/`RoleRepository`:
 *
 * - **Sem `delete`**: `WriteRepository<T>` (Shared Kernel) bundla `save`+`delete`
 *   — não há como herdar só `save`. `AuditEntry` é write-once por design
 *   (imutável, `AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 7-8`); a tensão entre essa
 *   invariante e uma futura política de retenção/expurgo permanece
 *   **não resolvida** (`AUDIT_REPOSITORY_CONTRACT.md §§ 6, 8`,
 *   `AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md § 10`) — implementar `delete` hoje
 *   contradiria a invariante confirmada (`BOM.md § 8`, "Registro imutável")
 *   sem nenhuma decisão que o autorize.
 * - **`findByTarget` própria**: consulta especializada por `Target`
 *   (`targetId`+`targetType`), já confirmada como responsabilidade primária do
 *   domínio, não conveniência antecipada (`AUDIT_DOMAIN_DECISIONS.md § 8`,
 *   `AUDIT_REPOSITORY_CONTRACT.md §§ 4, 7`) — nome/assinatura eram
 *   explicitamente deixados para esta missão de implementação real.
 *   Devolve em ordem cronológica (`AUDIT_REPOSITORY_CONTRACT.md § 7`).
 */
export interface AuditEntryRepository extends ReadRepository<AuditEntry> {
  save(entry: AuditEntry): Promise<Result<void, InfrastructureError>>;
  findByTarget(targetId: UniqueEntityId, targetType: string): Promise<Result<AuditEntry[], InfrastructureError>>;
}
