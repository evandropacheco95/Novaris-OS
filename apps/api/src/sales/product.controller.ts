import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateProductCommand,
  CreateProductHandler,
  UpdateProductPriceCommand,
  UpdateProductPriceHandler,
  DeactivateProductCommand,
  DeactivateProductHandler,
  ActivateProductCommand,
  ActivateProductHandler,
  UpdateFiscalLogisticsProfileCommand,
  UpdateFiscalLogisticsProfileHandler,
  type ProductRepository,
} from "@novaris/sales";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { PlanGuard } from "../auth/plan.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { RequireDomain } from "../auth/require-domain.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface ProductResponse {
  id: string;
  name: string;
  sku?: string;
  unitPrice: number;
  active: boolean;
  ncm?: string;
  cfop?: string;
  unit?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  parentProductId?: string;
  variantLabel?: string;
  externalId?: string;
  createdAt: string;
  updatedAt: string;
}

/** ProductController — API do `Product` (`ADR-0043`), catálogo do Sales Domain, adaptado do Salesforce Product2. */
@Controller("products")
@UseGuards(JwtAuthGuard, PermissionGuard, PlanGuard)
@RequirePermission("sales.products.manage")
@RequireDomain("Sales")
export class ProductController {
  constructor(
    private readonly createHandler: CreateProductHandler,
    private readonly updatePriceHandler: UpdateProductPriceHandler,
    private readonly deactivateHandler: DeactivateProductHandler,
    private readonly activateHandler: ActivateProductHandler,
    private readonly updateFiscalLogisticsProfileHandler: UpdateFiscalLogisticsProfileHandler,
    @Inject("ProductRepository") private readonly repository: ProductRepository,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      sku?: string;
      unitPrice: number;
      ncm?: string;
      cfop?: string;
      unit?: string;
      weightKg?: number;
      lengthCm?: number;
      widthCm?: number;
      heightCm?: number;
      parentProductId?: string;
      variantLabel?: string;
      externalId?: string;
    },
    @Req() req: AuthenticatedRequest,
  ): Promise<ProductResponse> {
    const result = await this.createHandler.execute(
      new CreateProductCommand({
        organizationId: req.user.organizationId,
        name: body.name,
        sku: body.sku,
        unitPrice: body.unitPrice,
        ncm: body.ncm,
        cfop: body.cfop,
        unit: body.unit,
        weightKg: body.weightKg,
        lengthCm: body.lengthCm,
        widthCm: body.widthCm,
        heightCm: body.heightCm,
        parentProductId: body.parentProductId,
        variantLabel: body.variantLabel,
        externalId: body.externalId,
      }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<ProductResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Products" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((product) => product.organizationId.toString() === req.user.organizationId)
      .map((product) => toResponse(product));
  }

  @Post(":id/price")
  async updatePrice(@Param("id") id: string, @Body() body: { unitPrice: number }, @Req() req: AuthenticatedRequest): Promise<ProductResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.updatePriceHandler.execute(new UpdateProductPriceCommand({ productId: id, unitPrice: body.unitPrice }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  /** Achado real (`ENG-0155`): `Product.deactivate()` existia no Domain desde `ENG-0144` mas nunca tinha rota. */
  @Post(":id/deactivate")
  async deactivate(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ProductResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.deactivateHandler.execute(new DeactivateProductCommand({ productId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  /** Achado real (`ENG-0155`): `Product.activate()` existia junto de `deactivate()` desde `ENG-0144`, mesma lacuna — sem isso "Desativar" seria um beco sem saída. */
  @Post(":id/activate")
  async activate(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ProductResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.activateHandler.execute(new ActivateProductCommand({ productId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  /** `ENG-0166` — perfil fiscal-logístico, `null` remove o valor, `undefined` não mexe. */
  @Post(":id/fiscal-logistics-profile")
  async updateFiscalLogisticsProfile(
    @Param("id") id: string,
    @Body()
    body: {
      ncm?: string | null;
      cfop?: string | null;
      unit?: string | null;
      weightKg?: number | null;
      lengthCm?: number | null;
      widthCm?: number | null;
      heightCm?: number | null;
      parentProductId?: string | null;
      variantLabel?: string | null;
      externalId?: string | null;
    },
    @Req() req: AuthenticatedRequest,
  ): Promise<ProductResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.updateFiscalLogisticsProfileHandler.execute(
      new UpdateFiscalLogisticsProfileCommand({ productId: id, ...body }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  /** Achado real (`ENG-0155`): `updatePrice` nunca verificava organizationId antes desta missão — qualquer usuário autenticado de qualquer Organization podia alterar o preço de um Product de outra empresa. */
  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Product" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Product "${id}" não encontrado` });
    }
    const product = option.getOrElse(null as never);
    if (product.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Product "${id}" não encontrado` });
    }
    return product;
  }
}

function toResponse(product: {
  id: { toString(): string };
  name: string;
  sku?: string;
  unitPrice: number;
  active: boolean;
  ncm?: string;
  cfop?: string;
  unit?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  parentProductId?: { toString(): string };
  variantLabel?: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}): ProductResponse {
  return {
    id: product.id.toString(),
    name: product.name,
    sku: product.sku,
    unitPrice: product.unitPrice,
    active: product.active,
    ncm: product.ncm,
    cfop: product.cfop,
    unit: product.unit,
    weightKg: product.weightKg,
    lengthCm: product.lengthCm,
    widthCm: product.widthCm,
    heightCm: product.heightCm,
    parentProductId: product.parentProductId?.toString(),
    variantLabel: product.variantLabel,
    externalId: product.externalId,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
