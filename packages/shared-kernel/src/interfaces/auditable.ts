import type { UniqueEntityId } from "../core/entities/unique-entity-id.js";
import type { Timestamped } from "./timestamped.js";

/**
 * Marca um objeto como auditável: quem criou/atualizou (`createdBy`/`updatedBy`)
 * e quando (`createdAt`/`updatedAt`, herdado de `Timestamped`) — herança real
 * entre contratos, não composição manual dos mesmos dois campos.
 */
export interface Auditable extends Timestamped {
  readonly createdBy: UniqueEntityId;
  readonly updatedBy: UniqueEntityId;
}
