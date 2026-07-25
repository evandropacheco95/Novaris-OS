import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Relationship } from "../aggregates/relationship/relationship.js";

/**
 * Contrato de persistência do Aggregate `Relationship` — port da Domain Layer.
 * Mesmo padrão de `PartyRepository`/`OpportunityRepository`.
 */
export interface RelationshipRepository extends ReadRepository<Relationship>, WriteRepository<Relationship> {}
