import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateRelationshipCommand, CreateRelationshipHandler, type RelationshipRepository } from "@novaris/customer";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface RelationshipResponse {
  id: string;
  organizationId: string;
  partyIdA: string;
  partyIdB: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Segundo Controller do Customer Domain (`ENG-0125`) — mesma receita de
 * `PartyController`. Sem rota `GET /:id` nesta primeira fatia (não pedida,
 * mesma disciplina de escopo mínimo já aplicada ao primeiro endpoint de Sales).
 */
@Controller("relationships")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("relationship.relationships.manage")
export class RelationshipController {
  constructor(
    private readonly createHandler: CreateRelationshipHandler,
    @Inject("RelationshipRepository") private readonly repository: RelationshipRepository,
  ) {}

  @Post()
  async create(
    @Body() body: { partyIdA: string; partyIdB: string; type: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<RelationshipResponse> {
    const command = new CreateRelationshipCommand({
      organizationId: req.user.organizationId,
      partyIdA: body.partyIdA,
      partyIdB: body.partyIdB,
      type: body.type,
    });

    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }

    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<RelationshipResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Relationships" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((relationship) => relationship.organizationId.toString() === req.user.organizationId)
      .map((relationship) => toResponse(relationship));
  }
}

function toResponse(relationship: {
  id: { toString(): string };
  organizationId: { toString(): string };
  partyIdA: { toString(): string };
  partyIdB: { toString(): string };
  type: string;
  createdAt: Date;
  updatedAt: Date;
}): RelationshipResponse {
  return {
    id: relationship.id.toString(),
    organizationId: relationship.organizationId.toString(),
    partyIdA: relationship.partyIdA.toString(),
    partyIdB: relationship.partyIdB.toString(),
    type: relationship.type,
    createdAt: relationship.createdAt.toISOString(),
    updatedAt: relationship.updatedAt.toISOString(),
  };
}
