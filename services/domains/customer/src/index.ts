// Customer Domain Service — barrel de exportação pública.
// Populado conforme cada camada ganha implementação real — mesmo padrão de
// services/domains/sales/src/index.ts.

export { Party, type PartyProps, type PartyType, type CreatePartyInput } from "../domain/aggregates/party/party.js";
export {
  Relationship,
  type RelationshipProps,
  type RelationshipType,
  type CreateRelationshipInput,
} from "../domain/aggregates/relationship/relationship.js";

export { RelationshipCreated } from "../domain/events/relationship-created.js";

export type { PartyRepository } from "../domain/repositories/party-repository.js";
export type { RelationshipRepository } from "../domain/repositories/relationship-repository.js";

// Application Layer
export { CreatePartyCommand } from "../application/commands/create-party/create-party.command.js";
export { CreatePartyHandler } from "../application/handlers/create-party/create-party.handler.js";
export { CreateRelationshipCommand } from "../application/commands/create-relationship/create-relationship.command.js";
export { CreateRelationshipHandler } from "../application/handlers/create-relationship/create-relationship.handler.js";

// Factories de Infrastructure — mantêm as classes concretas privadas ao
// pacote (mesmo padrão de `@novaris/sales`).
export { createPartyRepository, createRelationshipRepository } from "../infrastructure/factories.js";
