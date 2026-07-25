import { Entity, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError } from "@novaris/shared-kernel";

/**
 * QuotationLineItem — Internal Entity do Aggregate `Quotation` (`ADR-0043`),
 * mesmo padrão estrutural de `Proposal`/`Stage`. `unitPrice` é snapshot no
 * momento da adição (resolvido pelo `AddQuotationLineItemHandler` a partir do
 * `Product` real, nunca aceito do cliente HTTP) — mudança futura de preço do
 * Product não altera retroativamente uma Quotation já criada.
 */

export interface QuotationLineItemProps {
  productId: UniqueEntityId;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuotationLineItemInput {
  productId: UniqueEntityId;
  quantity: number;
  unitPrice: number;
}

export class QuotationLineItem extends Entity<QuotationLineItemProps> {
  private constructor(props: QuotationLineItemProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateQuotationLineItemInput): Result<QuotationLineItem, DomainError> {
    if (input.quantity <= 0) {
      return Result.fail(new ValidationError('"quantity" deve ser maior que zero'));
    }
    if (input.unitPrice < 0) {
      return Result.fail(new ValidationError('"unitPrice" não pode ser negativo'));
    }
    return Result.ok(
      new QuotationLineItem({ productId: input.productId, quantity: input.quantity, unitPrice: input.unitPrice }),
    );
  }

  /** Usado exclusivamente por `Quotation` ao reconstituir a partir de persistência. */
  static reconstitute(props: QuotationLineItemProps, id: UniqueEntityId): QuotationLineItem {
    return new QuotationLineItem(props, id);
  }

  get productId(): UniqueEntityId {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  /** Total da linha — computado, nunca persistido diretamente. */
  get lineTotal(): number {
    return this.props.quantity * this.props.unitPrice;
  }
}
