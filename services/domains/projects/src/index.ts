// Project Domain Service — barrel de exportação pública.
// Populado conforme cada camada ganha implementação real — mesmo padrão de
// services/domains/customer/src/index.ts.

export { Project, type ProjectProps, type CreateProjectInput } from "../domain/aggregates/project/project.js";
export { Task, type TaskProps, type TaskStatus, type CreateTaskInput } from "../domain/entities/task/task.js";

export type { ProjectRepository } from "../domain/repositories/project-repository.js";

// Application Layer
export { CreateProjectCommand } from "../application/commands/create-project/create-project.command.js";
export { CreateProjectHandler } from "../application/handlers/create-project/create-project.handler.js";
export { AddTaskCommand } from "../application/commands/add-task/add-task.command.js";
export { AddTaskHandler } from "../application/handlers/add-task/add-task.handler.js";
export { UpdateTaskStatusCommand } from "../application/commands/update-task-status/update-task-status.command.js";
export { UpdateTaskStatusHandler } from "../application/handlers/update-task-status/update-task-status.handler.js";

// Factory de Infrastructure — mantém a implementação concreta de Repository
// privada ao pacote (mesmo padrão de `@novaris/sales`/`@novaris/customer`).
export { createProjectRepository } from "../infrastructure/factories.js";
