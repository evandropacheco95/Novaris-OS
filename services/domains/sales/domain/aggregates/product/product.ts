import { AggregateRoot, Result, ValidationError, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Product — Aggregate Root do Sales Domain (`ADR-0043`), catálogo interno,
 * adaptado do Salesforce Product2. Preço único por Product — sem múltiplos
 * Price Books nomeados (Standard/Regional/etc.), sem evidência de
 * necessidade. Sem Domain Event — mesmo critério de `Party`/`Campaign`/
 * `Dashboard` (objetos de cadastro sem evento de negócio confirmado).
 */

export interface ProductProps {
  organizationId: UniqueEntityId;
  name: string;
  sku?: string;
  unitPrice: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  organizationId: UniqueEntityId;
  name: string;
  sku?: string;
  unitPrice: number;
}

export class Product extends AggregateRoot<ProductProps> implements Timestamped {
  private constructor(props: ProductProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. Nasce sempre `active: true`. */
  static create(input: CreateProductInput): Result<Product, DomainError> {
    if (!input.name || input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }
    if (input.unitPrice < 0) {
      return Result.fail(new ValidationError('"unitPrice" não pode ser negativo'));
    }
    const now = new Date();
    const props: ProductProps = {
      organizationId: input.organizationId,
      name: input.name,
      sku: input.sku,
      unitPrice: input.unitPrice,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Product(props));
  }

  static reconstitute(props: ProductProps, id: UniqueEntityId): Product {
    return new Product(props, id);
  }

  /** Atualiza o preço unitário — não afeta `QuotationLineItem`s já criados (snapshot próprio). */
  updatePrice(newPrice: number): Result<void, DomainError> {
    if (newPrice < 0) {
      return Result.fail(new ValidationError('"unitPrice" não pode ser negativo'));
    }
    this.props.unitPrice = newPrice;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  deactivate(): Result<void, DomainError> {
    if (!this.props.active) {
      return Result.fail(new ConflictError("Product já está inativo"));
    }
    this.props.active = false;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  activate(): Result<void, DomainError> {
    if (this.props.active) {
      return Result.fail(new ConflictError("Product já está ativo"));
    }
    this.props.active = true;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get sku(): string | undefined {
    return this.props.sku;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
