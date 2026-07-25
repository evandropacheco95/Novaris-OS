import type { UniqueEntityId } from "../core/entities/unique-entity-id.js";

/**
 * Marca um objeto como possuidor de identidade única. `Entity`/`AggregateRoot`
 * (ENG-0001.2) já satisfazem esta interface estruturalmente via seu getter
 * `id` — nenhuma alteração nelas foi necessária para isso.
 */
export interface HasIdentity {
  readonly id: UniqueEntityId;
}
