import { Controller, Get, HttpException, HttpStatus, Inject, Param, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import type { AuditEntryRepository } from "@novaris/audit";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface AuditEntryResponse {
  id: string;
  actorId: string;
  organizationId: string;
  targetId: string;
  targetType: string;
  action: string;
  occurredAt: string;
  origin: string;
  changeSet?: Record<string, unknown>;
}

/**
 * AuditEntryController — API do Audit Domain (`ADR-0035`, `ENG-0135`), único
 * fragmento real do System Domain (`ADR-0029`). **Somente leitura** — sem
 * `POST` — nenhuma fonte autoriza um usuário autenticado a fabricar
 * manualmente uma entrada de auditoria; entradas nascem exclusivamente do
 * enriquecimento feito pela Application Layer de cada domínio de origem
 * (`ADR-0035`), nunca de uma chamada HTTP direta.
 */
@Controller("audit-entries")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("system.audit-entries.read")
export class AuditEntryController {
  constructor(@Inject("AuditEntryRepository") private readonly repository: AuditEntryRepository) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<AuditEntryResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar AuditEntries" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((entry) => entry.organizationId.toString() === req.user.organizationId)
      .map((entry) => toResponse(entry));
  }

  @Get("target/:targetType/:targetId")
  async findByTarget(
    @Param("targetType") targetType: string,
    @Param("targetId") targetId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<AuditEntryResponse[]> {
    const findResult = await this.repository.findByTarget(new UniqueEntityId(targetId), targetType);
    if (findResult.isFailure) {
      throw new HttpException(
        { code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar trilha de auditoria" },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return findResult
      .getValue()!
      .filter((entry) => entry.organizationId.toString() === req.user.organizationId)
      .map((entry) => toResponse(entry));
  }
}

function toResponse(entry: {
  id: { toString(): string };
  actorId: { toString(): string };
  organizationId: { toString(): string };
  targetId: { toString(): string };
  targetType: string;
  action: string;
  occurredAt: Date;
  origin: string;
  changeSet?: Record<string, unknown>;
}): AuditEntryResponse {
  return {
    id: entry.id.toString(),
    actorId: entry.actorId.toString(),
    organizationId: entry.organizationId.toString(),
    targetId: entry.targetId.toString(),
    targetType: entry.targetType,
    action: entry.action,
    occurredAt: entry.occurredAt.toISOString(),
    origin: entry.origin,
    changeSet: entry.changeSet,
  };
}
