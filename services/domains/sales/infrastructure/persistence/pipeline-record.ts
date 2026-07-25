/**
 * Forma conceitual de registro persistido de `Stage`, dentro da agregação de
 * `Pipeline` — nunca uma linha/coleção própria fora dela.
 *
 * Traceability: [SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 7, § 12](../../../../../knowledge/architecture/blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md).
 * Campos idênticos a `StageProps` (`stage.ts`) + `id` — nenhum campo novo
 * inventado (ordem/posição permanece `Needs Evidence`, não incluída).
 */
export interface StageRecord {
  id: string;
  name: string;
}

/**
 * Forma conceitual de registro persistido de `Pipeline`, incluindo sua
 * coleção agregada de `StageRecord`.
 *
 * Traceability: [SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 6, § 12](../../../../../knowledge/architecture/blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md).
 * Campos idênticos a `PipelineProps` (`pipeline.ts`) + `id` + `stages` —
 * nenhum campo novo inventado.
 */
export interface PipelineRecord {
  id: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  stages: StageRecord[];
}
