/**
 * CreateAuditEntryCommand — Application Layer, Audit Domain.
 *
 * Todo campo já deve chegar enriquecido — `actorId`/`organizationId`/
 * `changeSet` são responsabilidade da Application Layer do domínio de origem
 * (Identity, Organization, futuros), nunca deste Command ou do Audit Domain
 * (`AUDIT_DOMAIN_DECISIONS.md § 5`). Este Command não enriquece nada.
 */
export interface CreateAuditEntryCommandInput {
  readonly actorId: string;
  readonly organizationId: string;
  readonly targetId: string;
  readonly targetType: string;
  readonly action: string;
  readonly occurredAt: Date;
  readonly origin: string;
  readonly changeSet?: Record<string, unknown>;
}

export class CreateAuditEntryCommand {
  readonly actorId: string;
  readonly organizationId: string;
  readonly targetId: string;
  readonly targetType: string;
  readonly action: string;
  readonly occurredAt: Date;
  readonly origin: string;
  readonly changeSet?: Record<string, unknown>;

  constructor(input: CreateAuditEntryCommandInput) {
    this.actorId = input.actorId;
    this.organizationId = input.organizationId;
    this.targetId = input.targetId;
    this.targetType = input.targetType;
    this.action = input.action;
    this.occurredAt = input.occurredAt;
    this.origin = input.origin;
    this.changeSet = input.changeSet;
    Object.freeze(this);
  }
}
