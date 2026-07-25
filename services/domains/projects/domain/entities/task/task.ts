import { Entity, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Task — Internal Entity do Aggregate `Project`.
 *
 * Traceability:
 * - [ADR-0026](../../../../../adr/ADR-0026-project-task-structure.md) — confirmado Internal Entity, não Aggregate Root (nenhuma fonte sugere reuso de um `Task` entre múltiplos Projects, mesmo critério de `Pipeline`/`Stage`, `ADR-0021`)
 * - [ADR-0030](../../../../../adr/ADR-0030-project-task-minimum-fields.md) — `title` (campo mínimo) e `status` (4 estados já confirmados em `BOM.md § Task`)
 *
 * Sem Domain Event — nenhum `TaskCreated`/`TaskCompleted` está na lista oficial
 * de 10 eventos (`DOMAIN_MODEL.md § EVENT BUS`).
 *
 * `updateStatus()` aceita qualquer um dos 4 estados, sem tabela de transição —
 * `BOM.md` confirma os 4 valores, mas nenhuma fonte define a ordem/permissão
 * de transição entre eles (`ADR-0030`, "não inventar regra além do que a
 * fonte já autoriza"). Valida, porém, que o valor recebido é um dos 4
 * conhecidos (`ENG-0134`) — achado originalmente identificado ao vivo em
 * `Activity.create()` (`ENG-0133`) e generalizado para este Entity: sem essa
 * validação, um valor fora da união só é rejeitado pelo CHECK constraint do
 * Postgres, retornando `InfrastructureError` (500) em vez de `ValidationError`
 * (400).
 */
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

const VALID_TASK_STATUSES: readonly TaskStatus[] = ["pending", "in_progress", "completed", "cancelled"];

export interface TaskProps {
  title: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
}

export class Task extends Entity<TaskProps> implements Timestamped {
  private constructor(props: TaskProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateTaskInput): Result<Task, DomainError> {
    if (input.title.trim().length === 0) {
      return Result.fail(new ValidationError('"title" é obrigatório'));
    }

    const now = new Date();
    const props: TaskProps = {
      title: input.title,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Task(props));
  }

  /** Usado exclusivamente por `ProjectMapper.toDomain()` (reconstituição). */
  static reconstitute(props: TaskProps, id: UniqueEntityId): Task {
    return new Task(props, id);
  }

  updateStatus(status: TaskStatus): Result<void, DomainError> {
    if (!VALID_TASK_STATUSES.includes(status)) {
      return Result.fail(new ValidationError(`"status" inválido: "${status}" — valores aceitos: ${VALID_TASK_STATUSES.join(", ")}`));
    }
    this.props.status = status;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get title(): string {
    return this.props.title;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
