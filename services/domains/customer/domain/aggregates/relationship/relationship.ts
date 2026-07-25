import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { RelationshipCreated } from "../../events/relationship-created.js";

/**
 * Relationship — Aggregate Root do Customer Domain.
 *
 * Traceability:
 * - [RELATIONSHIP_AGGREGATE_DESIGN.md](../../../../../knowledge/architecture/analysis/RELATIONSHIP_AGGREGATE_DESIGN.md) § 3 — confirmado Aggregate Root próprio, não Entity de `Party` (vínculo simétrico entre duas Parties, `RelationshipCreated` já confirmado em `DOMAIN_MODEL.md § EVENT BUS`)
 * - § 5 — `type`: 6 valores explicitamente nomeados em `BOM.md § Relationship`, nenhum inventado
 * - § 8 — referencia `Party` só por id (`partyIdA`/`partyIdB`), nunca embute a instância — Aggregates irmãos
 * - § 9 — invariante candidata `partyIdA !== partyIdB`, promovida a implementação (mínima, estrutural)
 *
 * `status` não implementado — `Needs Evidence` (§ 6 do design), nenhuma fonte
 * confirma estados além de existir/não existir.
 *
 * `create()` valida `type` contra `VALID_RELATIONSHIP_TYPES` (`ENG-0134`) —
 * achado originalmente identificado ao vivo em `Activity.create()` (`ENG-0133`)
 * e generalizado para este Aggregate: sem essa validação, um valor fora da
 * união só é rejeitado pelo CHECK constraint do Postgres, retornando
 * `InfrastructureError` (500) em vez de `ValidationError` (400).
 */
export type RelationshipType = "cliente" | "fornecedor" | "parceiro" | "prospect" | "investidor" | "colaborador";

const VALID_RELATIONSHIP_TYPES: readonly RelationshipType[] = ["cliente", "fornecedor", "parceiro", "prospect", "investidor", "colaborador"];

export interface RelationshipProps {
  organizationId: UniqueEntityId;
  partyIdA: UniqueEntityId;
  partyIdB: UniqueEntityId;
  type: RelationshipType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRelationshipInput {
  organizationId: UniqueEntityId;
  partyIdA: UniqueEntityId;
  partyIdB: UniqueEntityId;
  type: RelationshipType;
}

export class Relationship extends AggregateRoot<RelationshipProps> implements Timestamped {
  private constructor(props: RelationshipProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /**
   * Único ponto de criação. Rejeita `partyIdA === partyIdB` — um `Relationship`
   * não deveria vincular uma `Party` a ela mesma (`RELATIONSHIP_AGGREGATE_DESIGN.md § 9`,
   * inferência estrutural mínima, não regra de negócio citada por nenhuma fonte).
   */
  static create(input: CreateRelationshipInput): Result<Relationship, DomainError> {
    if (!VALID_RELATIONSHIP_TYPES.includes(input.type)) {
      return Result.fail(new ValidationError(`"type" inválido: "${input.type}" — valores aceitos: ${VALID_RELATIONSHIP_TYPES.join(", ")}`));
    }
    if (input.partyIdA.equals(input.partyIdB)) {
      return Result.fail(new ValidationError("Relationship não pode vincular uma Party a ela mesma"));
    }

    const now = new Date();
    const props: RelationshipProps = {
      organizationId: input.organizationId,
      partyIdA: input.partyIdA,
      partyIdB: input.partyIdB,
      type: input.type,
      createdAt: now,
      updatedAt: now,
    };
    const relationship = new Relationship(props);
    relationship.addDomainEvent(new RelationshipCreated(relationship.id));
    return Result.ok(relationship);
  }

  /** Usado exclusivamente por uma implementação de `RelationshipRepository` (ENS-0001 § 8). */
  static reconstitute(props: RelationshipProps, id: UniqueEntityId): Relationship {
    return new Relationship(props, id);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get partyIdA(): UniqueEntityId {
    return this.props.partyIdA;
  }

  get partyIdB(): UniqueEntityId {
    return this.props.partyIdB;
  }

  get type(): RelationshipType {
    return this.props.type;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
