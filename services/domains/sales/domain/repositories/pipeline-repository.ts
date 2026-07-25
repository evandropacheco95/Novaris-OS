import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Pipeline } from "../aggregates/pipeline/pipeline.js";

/**
 * Contrato de persistência do Aggregate `Pipeline` (Configuration Aggregate,
 * `ADR-0021`) — port da Domain Layer (`ENGINEERING_PLAYBOOK.md § 3`);
 * implementação concreta vive em `infrastructure/`, fora do escopo desta
 * missão.
 *
 * Traceability: [SALES_TECHNICAL_BLUEPRINT.md § 5](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md)
 * ("Repository Interfaces" — `PipelineRepository` identificado
 * conceitualmente, zero método próprio) — [ADR-0021](../../../../../adr/ADR-0021-pipeline-nature.md)
 * (`Pipeline` como Aggregate Root próprio) — [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md)
 * (ENS-0001 § 8).
 *
 * **Verify Before Reimplementing**: mesma composição de
 * `OrganizationRepository`/`UserRepository`/`RoleRepository` — apenas
 * `ReadRepository<Pipeline>` + `WriteRepository<Pipeline>` do Shared Kernel,
 * sem nenhum método próprio. `findByPipeline()` (do lado de `Opportunity`) e
 * qualquer consulta específica **não foram criados** — nenhuma fonte oficial
 * define índices/consultas reais (`SALES_AGGREGATE_DESIGN.md § 13`, `Needs Evidence`).
 *
 * Trabalha exclusivamente com o Aggregate Root `Pipeline` — não existe
 * Repository para `Stage` (Internal Entity, `ADR-0021`), que é persistida
 * apenas como parte do próprio `Pipeline`.
 */
export interface PipelineRepository extends ReadRepository<Pipeline>, WriteRepository<Pipeline> {}
