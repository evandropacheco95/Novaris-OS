import { AggregateRoot, Result, ConflictError, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { CaseCreated } from "../../events/case-created.js";
import { CaseClosed } from "../../events/case-closed.js";

/**
 * Case — Aggregate Root do Activity Domain (`ADR-0043`), inspirado no
 * Salesforce Service Cloud (Case). Owner de domínio decidido por analogia
 * estrutural com `Activity` (registro com ciclo de status referenciando um
 * Party) — `ADR-0043 § Case`.
 */

export type CaseStatus = "new" | "in_progress" | "closed";
export type CasePriority = "low" | "medium" | "high";

const VALID_CASE_PRIORITIES: readonly CasePriority[] = ["low", "medium", "high"];

export interface CaseProps {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  subject: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCaseInput {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  subject: string;
  description?: string;
  priority: CasePriority;
}

export class Case extends AggregateRoot<CaseProps> implements Timestamped {
  private constructor(props: CaseProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. Nasce sempre `"new"`. */
  static create(input: CreateCaseInput): Result<Case, DomainError> {
    if (!input.subject || input.subject.trim().length === 0) {
      return Result.fail(new ValidationError('"subject" é obrigatório'));
    }
    if (!VALID_CASE_PRIORITIES.includes(input.priority)) {
      return Result.fail(
        new ValidationError(`"priority" inválida: "${input.priority}" — valores aceitos: ${VALID_CASE_PRIORITIES.join(", ")}`),
      );
    }
    const now = new Date();
    const props: CaseProps = {
      organizationId: input.organizationId,
      partyId: input.partyId,
      subject: input.subject,
      description: input.description,
      status: "new",
      priority: input.priority,
      createdAt: now,
      updatedAt: now,
    };
    const caseInstance = new Case(props);
    caseInstance.addDomainEvent(new CaseCreated(caseInstance.id));
    return Result.ok(caseInstance);
  }

  static reconstitute(props: CaseProps, id: UniqueEntityId): Case {
    return new Case(props, id);
  }

  /** Transição `"new" → "in_progress"`. Sem Domain Event — mesmo critério de `Lead.updateStatus()`. */
  start(): Result<void, DomainError> {
    if (this.props.status !== "new") {
      return Result.fail(new ConflictError(`Case não pode iniciar atendimento a partir do estado "${this.props.status}"`));
    }
    this.props.status = "in_progress";
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /**
   * Transição terminal para `"closed"` — permitida a partir de `"new"` **ou**
   * `"in_progress"` (um caso pode ser fechado sem passar por atendimento,
   * ex.: duplicado). Dispara `CaseClosed`.
   */
  close(): Result<void, DomainError> {
    if (this.props.status === "closed") {
      return Result.fail(new ConflictError("Case já está fechado"));
    }
    this.props.status = "closed";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new CaseClosed(this.id));
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get partyId(): UniqueEntityId {
    return this.props.partyId;
  }

  get subject(): string {
    return this.props.subject;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): CaseStatus {
    return this.props.status;
  }

  get priority(): CasePriority {
    return this.props.priority;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
