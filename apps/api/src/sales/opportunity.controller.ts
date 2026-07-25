import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateOpportunityCommand,
  CreateOpportunityHandler,
  AdvanceOpportunityStageCommand,
  AdvanceOpportunityStageHandler,
  SubmitProposalCommand,
  SubmitProposalHandler,
  ApproveProposalCommand,
  ApproveProposalHandler,
  MarkOpportunityWonCommand,
  MarkOpportunityWonHandler,
  MarkOpportunityLostCommand,
  MarkOpportunityLostHandler,
  type CreateOpportunityRequest,
  type CreateOpportunityResponse,
  type AdvanceOpportunityStageRequest,
  type AdvanceOpportunityStageResponse,
  type SubmitProposalResponse,
  type ApproveProposalResponse,
  type MarkOpportunityWonResponse,
  type MarkOpportunityLostResponse,
  type OpportunityRepository,
} from "@novaris/sales";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

/**
 * Primeiro Controller real da NOVARIS — prova a arquitetura de ponta a ponta:
 * HTTP → Contracts → Application (Command/Handler) → `Opportunity`/`Proposal`
 * (Domain) → `PrismaOpportunityRepository` (Infrastructure) → Postgres real
 * (Supabase) → Contracts → HTTP.
 *
 * Expõe os 6 casos de uso do Sales Domain: `POST /opportunities` (criar),
 * `GET /opportunities/:id` (buscar), `POST /opportunities/:id/stage`
 * (avançar etapa), `POST /opportunities/:id/proposals` (submeter Proposal),
 * `POST /opportunities/:id/proposals/:proposalId/approve` (aprovar Proposal),
 * `POST /opportunities/:id/won` e `POST /opportunities/:id/lost` (fechar).
 * Mesma receita repetida 5x a partir do primeiro endpoint (`ENG-0120`) — um
 * Handler por rota, injetado via construtor, sem lógica de negócio no
 * Controller.
 *
 * **Protegido por `JwtAuthGuard`** (`ENG-0122`, Identity/Auth MVP) — achado
 * real confirmado durante essa missão: o `postgres` role usado pelo Prisma
 * tem `rolbypassrls = true` (confirmado via `SELECT rolbypassrls FROM
 * pg_roles`), então as políticas de RLS já escritas (`init_sales_domain`)
 * **não protegem nada** nesta API — só protegeriam um acesso direto ao
 * Postgres com um role sem esse bypass, caminho que esta API não usa. Por
 * isso, todo isolamento de tenant nas rotas abaixo é reforçado explicitamente
 * em código (`assertSameOrganization`), não delegado ao banco.
 *
 * Tradução de erro: `DomainError`/`InfrastructureError` viram HTTP 400/404/500
 * conforme o `code` do erro — nenhuma regra de negócio é decidida aqui, só
 * tradução de forma (mesmo princípio já aplicado por todo Mapper desta
 * engenharia).
 */
@Controller("opportunities")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("sales.opportunities.manage")
export class OpportunityController {
  constructor(
    private readonly createHandler: CreateOpportunityHandler,
    private readonly advanceStageHandler: AdvanceOpportunityStageHandler,
    private readonly submitProposalHandler: SubmitProposalHandler,
    private readonly approveProposalHandler: ApproveProposalHandler,
    private readonly markWonHandler: MarkOpportunityWonHandler,
    private readonly markLostHandler: MarkOpportunityLostHandler,
    @Inject("OpportunityRepository") private readonly repository: OpportunityRepository,
  ) {}

  @Post()
  async create(@Body() body: CreateOpportunityRequest, @Req() req: AuthenticatedRequest): Promise<CreateOpportunityResponse> {
    if (body.organizationId !== req.user.organizationId) {
      throw new ForbiddenException({ code: "AUTHORIZATION_ERROR", message: "organizationId do corpo não corresponde ao token" });
    }

    const command = new CreateOpportunityCommand({
      organizationId: body.organizationId,
      partyId: body.partyId,
      pipelineId: body.pipelineId,
      currentStageId: body.currentStageId,
    });

    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }

    return toResponse(result.getValue()!);
  }

  /**
   * Lista as Opportunities da Organization do token autenticado — não fazia
   * parte dos 6 casos de uso originalmente congelados (`SALES_TECHNICAL_BLUEPRINT.md`),
   * acrescentada nesta missão (`ENG-0123`, Frontend Web #1) porque nenhuma
   * tela real pode existir sem uma forma de listar. Filtra em código
   * (`findAll()` do Repository não é escopado por Organization, mesmo
   * achado já registrado para `loadAndAssertOwnership` — RLS não protege
   * nada nesta API) — não usa nenhum Handler/Command (leitura pura, sem
   * mutação, sem regra de negócio).
   */
  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<CreateOpportunityResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Opportunities" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((opportunity) => opportunity.organizationId.toString() === req.user.organizationId)
      .map((opportunity) => toResponse(opportunity));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<CreateOpportunityResponse> {
    const opportunity = await this.loadAndAssertOwnership(id, req.user);
    return toResponse(opportunity);
  }

  @Post(":id/stage")
  async advanceStage(
    @Param("id") id: string,
    @Body() body: Omit<AdvanceOpportunityStageRequest, "opportunityId">,
    @Req() req: AuthenticatedRequest,
  ): Promise<AdvanceOpportunityStageResponse> {
    await this.loadAndAssertOwnership(id, req.user);

    const command = new AdvanceOpportunityStageCommand({ opportunityId: id, stageId: body.stageId });
    const result = await this.advanceStageHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!) as AdvanceOpportunityStageResponse;
  }

  @Post(":id/proposals")
  async submitProposal(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<SubmitProposalResponse> {
    await this.loadAndAssertOwnership(id, req.user);

    const command = new SubmitProposalCommand({ opportunityId: id });
    const result = await this.submitProposalHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toProposalResponse(result.getValue()!);
  }

  @Post(":id/proposals/:proposalId/approve")
  async approveProposal(
    @Param("id") id: string,
    @Param("proposalId") proposalId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ApproveProposalResponse> {
    await this.loadAndAssertOwnership(id, req.user);

    const command = new ApproveProposalCommand({ opportunityId: id, proposalId });
    const result = await this.approveProposalHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toProposalResponse(result.getValue()!);
  }

  @Post(":id/won")
  async markWon(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<MarkOpportunityWonResponse> {
    await this.loadAndAssertOwnership(id, req.user);

    const command = new MarkOpportunityWonCommand({ opportunityId: id });
    const result = await this.markWonHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!) as MarkOpportunityWonResponse;
  }

  @Post(":id/lost")
  async markLost(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<MarkOpportunityLostResponse> {
    await this.loadAndAssertOwnership(id, req.user);

    const command = new MarkOpportunityLostCommand({ opportunityId: id });
    const result = await this.markLostHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!) as MarkOpportunityLostResponse;
  }

  /**
   * Carrega a `Opportunity` e confirma que pertence à mesma Organization do
   * token autenticado — a real barreira de tenant isolation desta API (ver
   * nota da classe: RLS não se aplica, `postgres` role tem bypass). Devolve
   * 404 se não existe (nunca revela a existência de uma Opportunity de outra
   * Organization) e 403 se existe mas pertence a outra Organization.
   */
  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Opportunity" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Opportunity "${id}" não encontrada` });
    }
    const opportunity = option.getOrElse(null as never);
    if (opportunity.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Opportunity "${id}" não encontrada` });
    }
    return opportunity;
  }
}

/** Mapeia o Aggregate real para `CreateOpportunityResponse` — mesma tradução já congelada por `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md`. */
function toResponse(opportunity: {
  id: { toString(): string };
  organizationId: { toString(): string };
  partyId: { toString(): string };
  status: string;
  createdAt: Date;
  updatedAt: Date;
  pipelineId?: { toString(): string };
  currentStageId?: { toString(): string };
}): CreateOpportunityResponse {
  return {
    id: opportunity.id.toString(),
    organizationId: opportunity.organizationId.toString(),
    partyId: opportunity.partyId.toString(),
    status: opportunity.status as CreateOpportunityResponse["status"],
    createdAt: opportunity.createdAt.toISOString(),
    updatedAt: opportunity.updatedAt.toISOString(),
    pipelineId: opportunity.pipelineId?.toString(),
    currentStageId: opportunity.currentStageId?.toString(),
  };
}

/** Mapeia a Entity `Proposal` real para `SubmitProposalResponse`/`ApproveProposalResponse` — ambos os Contracts têm a mesma forma. */
function toProposalResponse(proposal: { id: { toString(): string }; status: string; createdAt: Date; updatedAt: Date }): SubmitProposalResponse {
  return {
    id: proposal.id.toString(),
    status: proposal.status as SubmitProposalResponse["status"],
    createdAt: proposal.createdAt.toISOString(),
    updatedAt: proposal.updatedAt.toISOString(),
  };
}
