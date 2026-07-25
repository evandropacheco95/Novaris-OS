import { AggregateRoot, Result, ConflictError, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { ActivityCreated } from "../../events/activity-created.js";
import { ActivityCompleted } from "../../events/activity-completed.js";

/**
 * Activity — Aggregate Root do Activity Domain.
 *
 * Traceability:
 * - [ACTIVITY_AGGREGATE_DESIGN.md](../../../../../knowledge/architecture/analysis/ACTIVITY_AGGREGATE_DESIGN.md) — confirmado Aggregate Root único (tripla evidência)
 * - [ADR-0032](../../../../../adr/ADR-0032-activity-minimum-fields.md) — `partyId`/`status`/`notes` como campos mínimos
 *
 * Único Aggregate desta engenharia, além de `Invoice`, com 2 Domain Events
 * confirmados desde a primeira implementação (`ActivityCreated`/`ActivityCompleted`,
 * `BOM.md § Activity`, seção `Eventos:`).
 *
 * `create()` valida `type` contra `VALID_ACTIVITY_TYPES` — achado ao vivo
 * (curl contra a API real): sem essa validação, um valor fora da união só é
 * rejeitado pelo CHECK constraint do Postgres, retornando `InfrastructureError`
 * (500) em vez de `ValidationError` (400). Mesmo tipo de lacuna existe hoje em
 * `Relationship.create()` e `Task.updateStatus()` (nenhum dos dois valida o
 * enum em runtime) — não corrigido aqui por estar fora do escopo desta
 * missão (Activity Domain); registrado como achado para Ordem de Missão futura.
 */
export type ActivityType = "ligacao" | "whatsapp" | "email" | "reuniao" | "visita" | "nota";
export type ActivityStatus = "open" | "completed";

const VALID_ACTIVITY_TYPES: readonly ActivityType[] = ["ligacao", "whatsapp", "email", "reuniao", "visita", "nota"];

export interface ActivityProps {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  type: ActivityType;
  status: ActivityStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityInput {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  type: ActivityType;
  notes?: string;
}

export class Activity extends AggregateRoot<ActivityProps> implements Timestamped {
  private constructor(props: ActivityProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. Nasce sempre `"open"` — `complete()` é a única transição possível. */
  static create(input: CreateActivityInput): Result<Activity, DomainError> {
    if (!VALID_ACTIVITY_TYPES.includes(input.type)) {
      return Result.fail(new ValidationError(`"type" inválido: "${input.type}" — valores aceitos: ${VALID_ACTIVITY_TYPES.join(", ")}`));
    }

    const now = new Date();
    const props: ActivityProps = {
      organizationId: input.organizationId,
      partyId: input.partyId,
      type: input.type,
      status: "open",
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    const activity = new Activity(props);
    activity.addDomainEvent(new ActivityCreated(activity.id));
    return Result.ok(activity);
  }

  /** Usado exclusivamente por uma implementação de `ActivityRepository` (reconstituição). */
  static reconstitute(props: ActivityProps, id: UniqueEntityId): Activity {
    return new Activity(props, id);
  }

  /** Transição `"open"` → `"completed"` — única transição confirmada (`ActivityCompleted`). */
  complete(): Result<void, DomainError> {
    if (this.props.status !== "open") {
      return Result.fail(new ConflictError(`Activity no status "${this.props.status}" não pode ser concluída — transição válida só a partir de "open"`));
    }
    this.props.status = "completed";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new ActivityCompleted(this.id));
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get partyId(): UniqueEntityId {
    return this.props.partyId;
  }

  get type(): ActivityType {
    return this.props.type;
  }

  get status(): ActivityStatus {
    return this.props.status;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
