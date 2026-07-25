import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Project as PrismaProject, Task as PrismaTask } from "@novaris/database";
import { Project, type ProjectProps } from "../../domain/aggregates/project/project.js";
import { Task, type TaskProps, type TaskStatus } from "../../domain/entities/task/task.js";

type PrismaProjectWithTasks = PrismaProject & { tasks: PrismaTask[] };

/**
 * PrismaProjectMapper — tradução pura Aggregate ↔ linhas reais do Postgres
 * (via Prisma Client), sem I/O próprio. Mesma disciplina de
 * `PrismaOpportunityMapper` (Sales, `ENG-0120`).
 */
export class PrismaProjectMapper {
  static toPersistenceCreate(project: Project) {
    return {
      id: project.id.toString(),
      organizationId: project.organizationId.toString(),
      name: project.name,
    };
  }

  static toDomain(record: PrismaProjectWithTasks): Project {
    const tasks: Task[] = record.tasks.map((taskRecord) => {
      const taskProps: TaskProps = {
        title: taskRecord.title,
        status: taskRecord.status as TaskStatus,
        createdAt: taskRecord.createdAt,
        updatedAt: taskRecord.updatedAt,
      };
      return Task.reconstitute(taskProps, new UniqueEntityId(taskRecord.id));
    });

    const props: ProjectProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Project.reconstitute(props, new UniqueEntityId(record.id), tasks);
  }
}
