/**
 * Forma conceitual de registro persistido de `Stage`, dentro da agregação de
 * `Pipeline` — nunca uma linha/coleção própria fora dela.
 *
 * Traceability: [SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 7, § 12](../../../../../knowledge/architecture/blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md).
 * Campos idênticos a `StageProps` (`stage.ts`) + `id` — `order` adicionado
 * por `ADR-0051`.
 */
export interface StageRecord {
  id: string;
  name: string;
  order: number;
}

/**
 * Forma conceitual de registro persistido de `Pipeline`, incluindo sua
 * coleção agregada de `StageRecord`.
 *
 * Traceability: [SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 6, § 12](../../../../../knowledge/architecture/blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md).
 * Campos idênticos a `PipelineProps` (`pipeline.ts`) + `id` + `stages` —
 * `name` adicionado por `ADR-0051`.
 */
export interface PipelineRecord {
  id: string;
  organizationId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  stages: StageRecord[];
}
