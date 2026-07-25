import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { Task, type CreateTaskInput } from "../../entities/task/task.js";

/**
 * Project — Aggregate Root do Project Domain.
 *
 * Traceability:
 * - [CUSTOMER_TECHNICAL_BLUEPRINT.md](../../../../../knowledge/architecture/blueprints/CUSTOMER_TECHNICAL_BLUEPRINT.md) — mesmo padrão estrutural de referência
 * - [ADR-0026](../../../../../adr/ADR-0026-project-task-structure.md) — `Project` Aggregate Root, `Task` Internal Entity
 * - [ADR-0030](../../../../../adr/ADR-0030-project-task-minimum-fields.md) — `name` como campo mínimo de conteúdo
 *
 * Sem Domain Event — nenhum `ProjectCreated` está na lista oficial de 10
 * eventos (`DOMAIN_MODEL.md § EVENT BUS`).
 *
 * `Epic`/`Story`/`Sprint`/`Milestone` permanecem `Needs Evidence`
 * (`ADR-0026`) — não incluídos como campo ou coleção.
 */
export interface ProjectProps {
  organizationId: UniqueEntityId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  organizationId: UniqueEntityId;
  name: string;
}

export class Project extends AggregateRoot<ProjectProps> implements Timestamped {
  private readonly tasks: Task[];

  private constructor(props: ProjectProps, tasks: Task[], id?: UniqueEntityId) {
    super(props, id);
    this.tasks = tasks;
  }

  static create(input: CreateProjectInput): Result<Project, DomainError> {
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }

    const now = new Date();
    const props: ProjectProps = {
      organizationId: input.organizationId,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Project(props, []));
  }

  /** Usado exclusivamente por uma implementação de `ProjectRepository` (reconstituição). */
  static reconstitute(props: ProjectProps, id: UniqueEntityId, tasks: Task[]): Project {
    return new Project(props, tasks, id);
  }

  /**
   * Cria e adiciona um `Task` numa única operação atômica — mesmo padrão de
   * `Opportunity.submitProposal()` (`SALES_SUBMIT_PROPOSAL_DESIGN.md`, Option B).
   * `Task.create()` já valida `title` não vazio.
   */
  addTask(input: CreateTaskInput): Result<Task, DomainError> {
    const createResult = Task.create(input);
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const task = createResult.getValue()!;
    this.tasks.push(task);
    this.props.updatedAt = new Date();
    return Result.ok(task);
  }

  findTask(taskId: UniqueEntityId): Task | undefined {
    return this.tasks.find((task) => task.id.equals(taskId));
  }

  getTasks(): ReadonlyArray<Task> {
    return this.tasks;
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
