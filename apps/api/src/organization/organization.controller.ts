import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  UpdateOrganizationProfileCommand,
  UpdateOrganizationProfileHandler,
  type OrganizationRepository,
  type OrganizationAddress,
} from "@novaris/organizations";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface OrganizationResponse {
  id: string;
  slug: string;
  name: string;
  legalName: string;
  document: string;
  address: OrganizationAddress;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * OrganizationController — API do Organization Domain (`ENG-0128`). Só a
 * própria Organization do usuário autenticado — sem `POST /organizations`
 * (criar um novo tenant não é uma operação de usuário logado nesta fase;
 * hoje só o seed de bootstrap cria Organizations, `apps/api/src/seed.ts`).
 */
@Controller("organizations")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("workspace.profile.manage")
export class OrganizationController {
  constructor(
    private readonly updateHandler: UpdateOrganizationProfileHandler,
    @Inject("OrganizationRepository") private readonly repository: OrganizationRepository,
  ) {}

  @Get("me")
  async me(@Req() req: AuthenticatedRequest): Promise<OrganizationResponse> {
    const organization = await this.loadOwnOrganization(req.user);
    return toResponse(organization);
  }

  @Patch("me")
  async updateMe(
    @Body() body: { name?: string; legalName?: string; document?: string; address?: OrganizationAddress },
    @Req() req: AuthenticatedRequest,
  ): Promise<OrganizationResponse> {
    const command = new UpdateOrganizationProfileCommand({
      organizationId: req.user.organizationId,
      actorId: req.user.userId,
      name: body.name,
      legalName: body.legalName,
      document: body.document,
      address: body.address,
    });
    const result = await this.updateHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadOwnOrganization(user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(user.organizationId));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Organization" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: "Organization não encontrada" });
    }
    return option.getOrElse(null as never);
  }
}

function toResponse(organization: {
  id: { toString(): string };
  slug: string;
  name: string;
  legalName: string;
  document: string;
  address: OrganizationAddress;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): OrganizationResponse {
  return {
    id: organization.id.toString(),
    slug: organization.slug,
    name: organization.name,
    legalName: organization.legalName,
    document: organization.document,
    address: organization.address,
    status: organization.status,
    createdAt: organization.createdAt.toISOString(),
    updatedAt: organization.updatedAt.toISOString(),
  };
}
