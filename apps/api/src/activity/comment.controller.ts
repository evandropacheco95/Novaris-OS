import { Body, Controller, Delete, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateCommentCommand,
  CreateCommentHandler,
  UpdateCommentCommand,
  UpdateCommentHandler,
  DeleteCommentCommand,
  DeleteCommentHandler,
  type CommentRepository,
} from "@novaris/activity";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface CommentResponse {
  id: string;
  targetType: string;
  targetId: string;
  authorUserId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * CommentController — API do `Comment` (`ADR-0043`), Activity Domain,
 * adaptado do Salesforce Chatter. `authorUserId` vem sempre de `req.user`
 * (JWT), nunca do corpo da requisição — não é possível criar um comentário
 * em nome de outro usuário.
 */
@Controller("comments")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("activity.comments.manage")
export class CommentController {
  constructor(
    private readonly createHandler: CreateCommentHandler,
    private readonly updateHandler: UpdateCommentHandler,
    private readonly deleteHandler: DeleteCommentHandler,
    @Inject("CommentRepository") private readonly repository: CommentRepository,
  ) {}

  @Post()
  async create(@Body() body: { targetType: string; targetId: string; body: string }, @Req() req: AuthenticatedRequest): Promise<CommentResponse> {
    const result = await this.createHandler.execute(
      new CreateCommentCommand({
        organizationId: req.user.organizationId,
        targetType: body.targetType,
        targetId: body.targetId,
        authorUserId: req.user.userId,
        body: body.body,
      }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest, @Query("targetType") targetType?: string, @Query("targetId") targetId?: string): Promise<CommentResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Comments" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((comment) => comment.organizationId.toString() === req.user.organizationId)
      .filter((comment) => !targetType || comment.targetType === targetType)
      .filter((comment) => !targetId || comment.targetId.toString() === targetId)
      .map((comment) => toResponse(comment));
  }

  @Post(":id")
  async update(@Param("id") id: string, @Body() body: { body: string }, @Req() req: AuthenticatedRequest): Promise<CommentResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.updateHandler.execute(new UpdateCommentCommand({ commentId: id, body: body.body }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<{ deleted: true }> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.deleteHandler.execute(new DeleteCommentCommand({ commentId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return { deleted: true };
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Comment" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Comment "${id}" não encontrado` });
    }
    const comment = option.getOrElse(null as never);
    if (comment.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Comment "${id}" não encontrado` });
    }
    return comment;
  }
}

function toResponse(comment: {
  id: { toString(): string };
  targetType: string;
  targetId: { toString(): string };
  authorUserId: { toString(): string };
  body: string;
  createdAt: Date;
  updatedAt: Date;
}): CommentResponse {
  return {
    id: comment.id.toString(),
    targetType: comment.targetType,
    targetId: comment.targetId.toString(),
    authorUserId: comment.authorUserId.toString(),
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}
