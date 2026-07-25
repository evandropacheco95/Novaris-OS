import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateProjectCommand,
  CreateProjectHandler,
  AddTaskCommand,
  AddTaskHandler,
  UpdateTaskStatusCommand,
  UpdateTaskStatusHandler,
  type ProjectRepository,
} from "@novaris/projects";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface TaskResponse {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResponse {
  id: string;
  organizationId: string;
  name: string;
  tasks: TaskResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * ProjectController — API do Project Domain (`ENG-0129`), terceiro domínio
 * de negócio exposto, mesma receita já provada em `PartyController`
 * (Customer) e `OpportunityController` (Sales).
 *
 * Isolamento de tenant reforçado em código (RLS não protege nada nesta API,
 * `DATABASE_ARCHITECTURE.md § 7`).
 */
@Controller("projects")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("project.projects.manage")
export class ProjectController {
  constructor(
    private readonly createHandler: CreateProjectHandler,
    private readonly addTaskHandler: AddTaskHandler,
    private readonly updateTaskStatusHandler: UpdateTaskStatusHandler,
    @Inject("ProjectRepository") private readonly repository: ProjectRepository,
  ) {}

  @Post()
  async create(@Body() body: { name: string }, @Req() req: AuthenticatedRequest): Promise<ProjectResponse> {
    const command = new CreateProjectCommand({ organizationId: req.user.organizationId, name: body.name });
    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<ProjectResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Projects" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((project) => project.organizationId.toString() === req.user.organizationId)
      .map((project) => toResponse(project));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ProjectResponse> {
    const project = await this.loadAndAssertOwnership(id, req.user);
    return toResponse(project);
  }

  @Post(":id/tasks")
  async addTask(@Param("id") id: string, @Body() body: { title: string }, @Req() req: AuthenticatedRequest): Promise<ProjectResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new AddTaskCommand({ projectId: id, title: body.title });
    const result = await this.addTaskHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(await this.loadAndAssertOwnership(id, req.user));
  }

  @Patch(":id/tasks/:taskId")
  async updateTaskStatus(
    @Param("id") id: string,
    @Param("taskId") taskId: string,
    @Body() body: { status: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<ProjectResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new UpdateTaskStatusCommand({ projectId: id, taskId, status: body.status });
    const result = await this.updateTaskStatusHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(await this.loadAndAssertOwnership(id, req.user));
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Project" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Project "${id}" não encontrado` });
    }
    const project = option.getOrElse(null as never);
    if (project.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Project "${id}" não encontrado` });
    }
    return project;
  }
}

function toResponse(project: {
  id: { toString(): string };
  organizationId: { toString(): string };
  name: string;
  getTasks(): ReadonlyArray<{ id: { toString(): string }; title: string; status: string; createdAt: Date; updatedAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}): ProjectResponse {
  return {
    id: project.id.toString(),
    organizationId: project.organizationId.toString(),
    name: project.name,
    tasks: project.getTasks().map((task) => ({
      id: task.id.toString(),
      title: task.title,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
