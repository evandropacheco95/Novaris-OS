import { Result, UniqueEntityId, ValidationError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Relationship, type RelationshipType } from "../../../domain/aggregates/relationship/relationship.js";
import type { RelationshipRepository } from "../../../domain/repositories/relationship-repository.js";
import type { CreateRelationshipCommand } from "../../commands/create-relationship/create-relationship.command.js";

const VALID_RELATIONSHIP_TYPES: readonly RelationshipType[] = [
  "cliente",
  "fornecedor",
  "parceiro",
  "prospect",
  "investidor",
  "colaborador",
];

/**
 * CreateRelationshipHandler — Application Layer, Customer Domain.
 *
 * Orquestra: `CreateRelationshipCommand` → validação de `type` → conversão
 * `string` → `UniqueEntityId` → `Relationship.create()` (que já valida
 * `partyIdA !== partyIdB`) → `RelationshipRepository.save()` →
 * `Result<Relationship, DomainError | InfrastructureError>`. Não valida se
 * `partyIdA`/`partyIdB` correspondem a `Party`s existentes — essa checagem
 * cruzada de Aggregates pertenceria a um Domain Service (mesmo padrão de
 * `RoleAssignmentDomainService`, Identity), não implementado nesta primeira
 * fatia (`CUSTOMER_TECHNICAL_BLUEPRINT.md § 5`).
 *
 * **Mesmo bug real corrigido em `CreatePartyHandler`** (`ENG-0125`) — o
 * `Result` de `save()` agora é verificado, nunca descartado silenciosamente.
 */
export class CreateRelationshipHandler {
  constructor(private readonly relationshipRepository: RelationshipRepository) {}

  async execute(command: CreateRelationshipCommand): Promise<Result<Relationship, DomainError | InfrastructureError>> {
    if (!VALID_RELATIONSHIP_TYPES.includes(command.type as RelationshipType)) {
      return Result.fail(new ValidationError(`"type" inválido: "${command.type}"`));
    }

    const createResult = Relationship.create({
      organizationId: new UniqueEntityId(command.organizationId),
      partyIdA: new UniqueEntityId(command.partyIdA),
      partyIdB: new UniqueEntityId(command.partyIdB),
      type: command.type as RelationshipType,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const relationship = createResult.getValue()!;
    const saveResult = await this.relationshipRepository.save(relationship);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(relationship);
  }
}
