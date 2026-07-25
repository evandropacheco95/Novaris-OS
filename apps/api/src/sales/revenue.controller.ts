import { Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import type { RevenueRepository } from "@novaris/sales";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface RevenueResponse {
  id: string;
  contractId: string;
  amount: number;
  currency: string;
  recognizedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * RevenueController — API do `Revenue` (`ADR-0047`), Sales Domain. Não expõe
 * `POST /revenues` diretamente — Revenue só nasce via
 * `POST /contracts/:id/generate-revenue` (`ContractController`), mesmo
 * princípio de `Contract` não ter criação avulsa.
 */
@Controller("revenues")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("sales.revenues.manage")
export class RevenueController {
  constructor(@Inject("RevenueRepository") private readonly repository: RevenueRepository) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<RevenueResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Revenues" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((revenue) => revenue.organizationId.toString() === req.user.organizationId)
      .map((revenue) => toResponse(revenue));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<RevenueResponse> {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Revenue" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Revenue "${id}" não encontrado` });
    }
    const revenue = option.getOrElse(null as never);
    if (revenue.organizationId.toString() !== req.user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Revenue "${id}" não encontrado` });
    }
    return toResponse(revenue);
  }
}

export function toResponse(revenue: {
  id: { toString(): string };
  contractId: { toString(): string };
  amount: number;
  currency: string;
  recognizedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): RevenueResponse {
  return {
    id: revenue.id.toString(),
    contractId: revenue.contractId.toString(),
    amount: revenue.amount,
    currency: revenue.currency,
    recognizedAt: revenue.recognizedAt.toISOString(),
    createdAt: revenue.createdAt.toISOString(),
    updatedAt: revenue.updatedAt.toISOString(),
  };
}
