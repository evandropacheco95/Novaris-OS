import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateProductCommand, CreateProductHandler, UpdateProductPriceCommand, UpdateProductPriceHandler, type ProductRepository } from "@novaris/sales";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface ProductResponse {
  id: string;
  name: string;
  sku?: string;
  unitPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** ProductController — API do `Product` (`ADR-0043`), catálogo do Sales Domain, adaptado do Salesforce Product2. */
@Controller("products")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("sales.products.manage")
export class ProductController {
  constructor(
    private readonly createHandler: CreateProductHandler,
    private readonly updatePriceHandler: UpdateProductPriceHandler,
    @Inject("ProductRepository") private readonly repository: ProductRepository,
  ) {}

  @Post()
  async create(@Body() body: { name: string; sku?: string; unitPrice: number }, @Req() req: AuthenticatedRequest): Promise<ProductResponse> {
    const result = await this.createHandler.execute(
      new CreateProductCommand({ organizationId: req.user.organizationId, name: body.name, sku: body.sku, unitPrice: body.unitPrice }),
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
  async updatePrice(@Param("id") id: string, @Body() body: { unitPrice: number }): Promise<ProductResponse> {
    const result = await this.updatePriceHandler.execute(new UpdateProductPriceCommand({ productId: id, unitPrice: body.unitPrice }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }
}

function toResponse(product: {
  id: { toString(): string };
  name: string;
  sku?: string;
  unitPrice: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ProductResponse {
  return {
    id: product.id.toString(),
    name: product.name,
    sku: product.sku,
    unitPrice: product.unitPrice,
    active: product.active,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
