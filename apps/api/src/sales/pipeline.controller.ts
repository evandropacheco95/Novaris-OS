import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreatePipelineCommand,
  CreatePipelineHandler,
  AddStageCommand,
  AddStageHandler,
  ReorderStagesCommand,
  ReorderStagesHandler,
  RenamePipelineCommand,
  RenamePipelineHandler,
  RenameStageCommand,
  RenameStageHandler,
  type PipelineRepository,
} from "@novaris/sales";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface StageResponse {
  id: string;
  name: string;
  order: number;
}

export interface PipelineResponse {
  id: string;
  organizationId: string;
  name: string;
  stages: StageResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * PipelineController — API do `Pipeline` (`ADR-0051`), Sales Domain. Fecha o
 * gap identificado em auditoria de escopo: `Domain`+`Infrastructure` já
 * existiam desde `ENG-0043`, mas nunca ganharam `Application`/`API`/`Frontend`
 * — não havia forma de um usuário criar, nomear ou reordenar um Pipeline.
 */
@Controller("pipelines")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("sales.pipelines.manage")
export class PipelineController {
  constructor(
    private readonly createHandler: CreatePipelineHandler,
    private readonly addStageHandler: AddStageHandler,
    private readonly reorderStagesHandler: ReorderStagesHandler,
    private readonly renamePipelineHandler: RenamePipelineHandler,
    private readonly renameStageHandler: RenameStageHandler,
    @Inject("PipelineRepository") private readonly repository: PipelineRepository,
  ) {}

  @Post()
  async create(@Body() body: { name: string }, @Req() req: AuthenticatedRequest): Promise<PipelineResponse> {
    const result = await this.createHandler.execute(
      new CreatePipelineCommand({ organizationId: req.user.organizationId, name: body.name }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<PipelineResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Pipelines" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((pipeline) => pipeline.organizationId.toString() === req.user.organizationId)
      .map((pipeline) => toResponse(pipeline));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<PipelineResponse> {
    const pipeline = await this.loadAndAssertOwnership(id, req.user);
    return toResponse(pipeline);
  }

  @Patch(":id")
  async rename(@Param("id") id: string, @Body() body: { name: string }, @Req() req: AuthenticatedRequest): Promise<PipelineResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.renamePipelineHandler.execute(new RenamePipelineCommand({ pipelineId: id, name: body.name }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/stages")
  async addStage(@Param("id") id: string, @Body() body: { name: string }, @Req() req: AuthenticatedRequest): Promise<PipelineResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.addStageHandler.execute(new AddStageCommand({ pipelineId: id, name: body.name }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/stages/reorder")
  async reorderStages(
    @Param("id") id: string,
    @Body() body: { orderedStageIds: string[] },
    @Req() req: AuthenticatedRequest,
  ): Promise<PipelineResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.reorderStagesHandler.execute(
      new ReorderStagesCommand({ pipelineId: id, orderedStageIds: body.orderedStageIds }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Patch(":id/stages/:stageId")
  async renameStage(
    @Param("id") id: string,
    @Param("stageId") stageId: string,
    @Body() body: { name: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<PipelineResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.renameStageHandler.execute(new RenameStageCommand({ pipelineId: id, stageId, name: body.name }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Pipeline" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Pipeline "${id}" não encontrada` });
    }
    const pipeline = option.getOrElse(null as never);
    if (pipeline.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Pipeline "${id}" não encontrada` });
    }
    return pipeline;
  }
}

function toResponse(pipeline: {
  id: { toString(): string };
  organizationId: { toString(): string };
  name: string;
  getStages(): ReadonlyArray<{ id: { toString(): string }; name: string; order: number }>;
  createdAt: Date;
  updatedAt: Date;
}): PipelineResponse {
  return {
    id: pipeline.id.toString(),
    organizationId: pipeline.organizationId.toString(),
    name: pipeline.name,
    stages: [...pipeline.getStages()]
      .sort((a, b) => a.order - b.order)
      .map((stage) => ({ id: stage.id.toString(), name: stage.name, order: stage.order })),
    createdAt: pipeline.createdAt.toISOString(),
    updatedAt: pipeline.updatedAt.toISOString(),
  };
}
