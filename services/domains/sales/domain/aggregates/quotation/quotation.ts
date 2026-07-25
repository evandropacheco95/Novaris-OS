import { AggregateRoot, Result, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { QuotationCreated } from "../../events/quotation-created.js";
import { QuotationAccepted } from "../../events/quotation-accepted.js";
import { QuotationRejected } from "../../events/quotation-rejected.js";
import { QuotationLineItem, type CreateQuotationLineItemInput } from "../../entities/quotation-line-item/quotation-line-item.js";

/**
 * Quotation — Aggregate Root do Sales Domain (`ADR-0043`), preenche a lacuna
 * estrutural que `Quotation` já tinha reservada desde `ADR-0020` ("distinto
 * de Proposal, não sinônimo"). Adaptado do Salesforce Quote. Não é Internal
 * Entity de `Opportunity` — uma Opportunity pode ter múltiplas Quotations
 * (revisões de preço), referência por id (`opportunityId`), mesmo padrão de
 * `Opportunity.partyId`.
 */

export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected";

export interface QuotationProps {
  organizationId: UniqueEntityId;
  opportunityId: UniqueEntityId;
  status: QuotationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuotationInput {
  organizationId: UniqueEntityId;
  opportunityId: UniqueEntityId;
}

export class Quotation extends AggregateRoot<QuotationProps> implements Timestamped {
  private readonly lineItems: QuotationLineItem[];

  private constructor(props: QuotationProps, lineItems: QuotationLineItem[], id?: UniqueEntityId) {
    super(props, id);
    this.lineItems = lineItems;
  }

  /** Único ponto de criação. Nasce sempre `"draft"`, sem itens. */
  static create(input: CreateQuotationInput): Result<Quotation, DomainError> {
    const now = new Date();
    const props: QuotationProps = {
      organizationId: input.organizationId,
      opportunityId: input.opportunityId,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    const quotation = new Quotation(props, []);
    quotation.addDomainEvent(new QuotationCreated(quotation.id));
    return Result.ok(quotation);
  }

  static reconstitute(props: QuotationProps, id: UniqueEntityId, lineItems: QuotationLineItem[] = []): Quotation {
    return new Quotation(props, lineItems, id);
  }

  /**
   * Adiciona uma linha de item — só permitido em `"draft"`. `unitPrice` deve
   * já vir resolvido pelo chamador (`AddQuotationLineItemHandler`, a partir
   * do `Product` real) — o Domain nunca busca `Product` por conta própria.
   */
  addLineItem(input: CreateQuotationLineItemInput): Result<QuotationLineItem, DomainError> {
    if (this.props.status !== "draft") {
      return Result.fail(new ConflictError(`Quotation não pode receber itens a partir do estado "${this.props.status}"`));
    }
    const lineItemResult = QuotationLineItem.create(input);
    if (lineItemResult.isFailure) {
      return Result.fail(lineItemResult.getError()!);
    }
    const lineItem = lineItemResult.getValue()!;
    this.lineItems.push(lineItem);
    this.props.updatedAt = new Date();
    return Result.ok(lineItem);
  }

  /** Retorna uma cópia defensiva da coleção — mesmo padrão de `Opportunity.getProposals()`. */
  getLineItems(): ReadonlyArray<QuotationLineItem> {
    return [...this.lineItems];
  }

  /** Soma de todos os `lineTotal` — computado, nunca persistido diretamente. */
  get total(): number {
    return this.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }

  /** Transição `draft → sent`. Sem Domain Event — transição administrativa, mesmo critério de `Lead.updateStatus()`. */
  send(): Result<void, DomainError> {
    if (this.props.status !== "draft") {
      return Result.fail(new ConflictError(`Quotation não pode ser enviada a partir do estado "${this.props.status}"`));
    }
    this.props.status = "sent";
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /**
   * Transição terminal `sent → accepted`. Não fecha a `Opportunity`
   * associada automaticamente (`ADR-0043` — ação manual separada no
   * Salesforce, não inventada aqui).
   */
  accept(): Result<void, DomainError> {
    if (this.props.status !== "sent") {
      return Result.fail(new ConflictError(`Quotation não pode ser aceita a partir do estado "${this.props.status}"`));
    }
    this.props.status = "accepted";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new QuotationAccepted(this.id));
    return Result.ok(undefined);
  }

  /** Transição terminal `sent → rejected`. */
  reject(): Result<void, DomainError> {
    if (this.props.status !== "sent") {
      return Result.fail(new ConflictError(`Quotation não pode ser rejeitada a partir do estado "${this.props.status}"`));
    }
    this.props.status = "rejected";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new QuotationRejected(this.id));
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get opportunityId(): UniqueEntityId {
    return this.props.opportunityId;
  }

  get status(): QuotationStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
