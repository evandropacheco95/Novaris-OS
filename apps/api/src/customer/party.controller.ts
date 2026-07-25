import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { CreatePartyCommand, CreatePartyHandler, type PartyRepository } from "@novaris/customer";
import type { SearchIndex, SearchResult } from "@novaris/search";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface PartyResponse {
  id: string;
  organizationId: string;
  partyType: string;
  name: string;
  document?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Primeiro Controller do Customer Domain (`ENG-0125`) — mesma receita já
 * provada em `OpportunityController` (Sales, `ENG-0120`-`0121`): HTTP →
 * Contracts → Application (Command/Handler) → `Party` (Domain) →
 * `PrismaPartyRepository` (Infrastructure) → Postgres real → HTTP.
 *
 * Protegido por `JwtAuthGuard`, mesmo isolamento de tenant reforçado em
 * código (RLS não protege nada nesta API, ver `DATABASE_ARCHITECTURE.md § 7`).
 */
@Controller("parties")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("relationship.parties.manage")
export class PartyController {
  constructor(
    private readonly createHandler: CreatePartyHandler,
    @Inject("PartyRepository") private readonly repository: PartyRepository,
    @Inject("SearchIndex") private readonly searchIndex: SearchIndex,
  ) {}

  @Post()
  async create(@Body() body: { partyType: string; name: string; document?: string }, @Req() req: AuthenticatedRequest): Promise<PartyResponse> {
    const command = new CreatePartyCommand({
      organizationId: req.user.organizationId,
      partyType: body.partyType,
      name: body.name,
      document: body.document,
    });

    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }

    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<PartyResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Parties" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((party) => party.organizationId.toString() === req.user.organizationId)
      .map((party) => toResponse(party));
  }

  /**
   * `GET /parties/search?q=` (`ENG-0140`, `@novaris/search`) — precisa vir
   * ANTES de `@Get(":id")` na ordem de declaração: o NestJS resolve rotas
   * literais e `:id` na ordem em que aparecem na classe, então `:id`
   * casaria "search" como um id se viesse primeiro.
   */
  @Get("search")
  async search(@Query("q") q: string | undefined, @Req() req: AuthenticatedRequest): Promise<SearchResult[]> {
    return this.searchIndex.search(req.user.organizationId, q ?? "");
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<PartyResponse> {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Party" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Party "${id}" não encontrada` });
    }
    const party = option.getOrElse(null as never);
    if (party.organizationId.toString() !== req.user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Party "${id}" não encontrada` });
    }
    return toResponse(party);
  }
}

function toResponse(party: {
  id: { toString(): string };
  organizationId: { toString(): string };
  partyType: string;
  name: string;
  document?: string;
  createdAt: Date;
  updatedAt: Date;
}): PartyResponse {
  return {
    id: party.id.toString(),
    organizationId: party.organizationId.toString(),
    partyType: party.partyType,
    name: party.name,
    document: party.document,
    createdAt: party.createdAt.toISOString(),
    updatedAt: party.updatedAt.toISOString(),
  };
}
