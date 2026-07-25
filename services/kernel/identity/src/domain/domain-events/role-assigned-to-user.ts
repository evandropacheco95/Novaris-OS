import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `User.assignRole()`. Proposto em IDENTITY_DOMAIN_MODEL.md § 7,
 * listado em IDENTITY_TECHNICAL_BLUEPRINT.md § 7. Tecnicamente um evento do
 * Aggregate `User` — nomeia o `Role` envolvido, mas a operação é transacional
 * só sobre `User` (IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 5, 12, nota de rodapé).
 * `aggregateId` é o `id` do `User`, não do `Role`.
 */
export class RoleAssignedToUser implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "RoleAssignedToUser";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
