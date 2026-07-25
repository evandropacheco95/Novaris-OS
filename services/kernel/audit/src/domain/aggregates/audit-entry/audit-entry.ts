import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError } from "@novaris/shared-kernel";

/**
 * Estado interno — campos definitivos de
 * [AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 4-6](../../../../AUDIT_AGGREGATE_DESIGN_FREEZE.md).
 * `changeSet` é opcional e de forma livre — nenhuma fonte define sua estrutura
 * interna (Freeze § 6-7).
 */
export interface AuditEntryProps {
  actorId: UniqueEntityId;
  organizationId: UniqueEntityId;
  targetId: UniqueEntityId;
  targetType: string;
  action: string;
  occurredAt: Date;
  origin: string;
  changeSet?: Record<string, unknown>;
}

export interface CreateAuditEntryInput {
  actorId: UniqueEntityId;
  organizationId: UniqueEntityId;
  targetId: UniqueEntityId;
  targetType: string;
  action: string;
  occurredAt: Date;
  origin: string;
  changeSet?: Record<string, unknown>;
}

/**
 * Aggregate Root do Audit Domain — congelado em
 * [AUDIT_AGGREGATE_DESIGN_FREEZE.md](../../../../AUDIT_AGGREGATE_DESIGN_FREEZE.md),
 * assinatura técnica em
 * [AUDIT_TECHNICAL_BLUEPRINT.md](../../../../AUDIT_TECHNICAL_BLUEPRINT.md).
 * Segue [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md)
 * (ENS-0001).
 *
 * **Sem `implements Auditable`/`Versionable`/`Timestamped`/`HasMetadata`** —
 * nenhuma fonte associa esses contratos a `AuditEntry` (Freeze § 15); `updatedAt`
 * de `Timestamped` não teria significado para um registro que nunca muda
 * (Freeze § 8).
 *
 * **Não possui nenhum método de mutação** — a única operação além de `create()`
 * é `reconstitute()`. Isto não é uma omissão: é a expressão estrutural direta
 * da invariante de imutabilidade (Freeze §§ 7-8) — o primeiro Aggregate do
 * Kernel sem nenhum método de mutação além da criação.
 *
 * **`create()` nunca enriquece dados** — recebe `actorId`/`organizationId`/
 * `changeSet` já prontos; quem produz esses valores é a Application Layer do
 * domínio de origem, nunca este Aggregate nem o Audit Domain
 * (`AUDIT_DOMAIN_DECISIONS.md § 5`).
 *
 * **Não dispara nenhum Domain Event** — `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 11`
 * deixa isso explicitamente não decidido; na ausência de decisão, nenhum
 * evento é inventado aqui.
 */
export class AuditEntry extends AggregateRoot<AuditEntryProps> {
  private constructor(props: AuditEntryProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateAuditEntryInput): Result<AuditEntry, DomainError> {
    if (input.targetType.trim().length === 0) {
      return Result.fail(new ValidationError('"targetType" é obrigatório'));
    }
    if (input.action.trim().length === 0) {
      return Result.fail(new ValidationError('"action" é obrigatório'));
    }
    if (input.origin.trim().length === 0) {
      return Result.fail(new ValidationError('"origin" é obrigatório'));
    }

    const props: AuditEntryProps = {
      actorId: input.actorId,
      organizationId: input.organizationId,
      targetId: input.targetId,
      targetType: input.targetType,
      action: input.action,
      occurredAt: input.occurredAt,
      origin: input.origin,
      changeSet: input.changeSet,
    };
    return Result.ok(new AuditEntry(props));
  }

  /** Usado exclusivamente por uma futura implementação de Repository (ENS-0001 § 8). */
  static reconstitute(props: AuditEntryProps, id: UniqueEntityId): AuditEntry {
    return new AuditEntry(props, id);
  }

  get actorId(): UniqueEntityId {
    return this.props.actorId;
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get targetId(): UniqueEntityId {
    return this.props.targetId;
  }

  get targetType(): string {
    return this.props.targetType;
  }

  get action(): string {
    return this.props.action;
  }

  get occurredAt(): Date {
    return this.props.occurredAt;
  }

  get origin(): string {
    return this.props.origin;
  }

  get changeSet(): Record<string, unknown> | undefined {
    return this.props.changeSet;
  }
}
