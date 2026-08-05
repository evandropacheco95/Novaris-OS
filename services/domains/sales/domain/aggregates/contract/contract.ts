import { AggregateRoot, Result, ValidationError, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { ContractCreated } from "../../events/contract-created.js";
import { ContractActivated } from "../../events/contract-activated.js";
import { ContractTerminated } from "../../events/contract-terminated.js";

/**
 * Contract — Aggregate Root do Sales Domain (`ADR-0044`), gerado a partir de
 * uma `Quotation` `accepted` (nunca automático — ação explícita via
 * `GenerateContractFromQuotationHandler`). `quotationId` é rastreabilidade
 * (de qual Quotation este Contract se origina); `opportunityId` é referência
 * direta, mesmo padrão de `Quotation.opportunityId`.
 *
 * **Documento Fiscal** (`ENG-0169`, `ADR-0053`) — `fiscalDocumentNumber` a
 * `fiscalDocumentIssuedAt` são opcionais, input manual (sem integração real
 * com API fiscal/Bling — decisão explícita do CTO, estrutura primeiro). Por
 * decisão do CTO, escopo deliberadamente contido ao Contract: sem
 * reconciliação automática com o Financial Domain (`Invoice` não referencia
 * `Contract` hoje) — o dado fica disponível para consulta manual do time
 * financeiro.
 */

export type ContractStatus = "draft" | "active" | "terminated";

export interface ContractProps {
  organizationId: UniqueEntityId;
  opportunityId: UniqueEntityId;
  quotationId: UniqueEntityId;
  status: ContractStatus;
  startDate?: Date;
  endDate?: Date;
  /** Número da Nota Fiscal Eletrônica associada a este Contract. */
  fiscalDocumentNumber?: string;
  /** Chave de acesso da NFe — 44 dígitos, padrão nacional (SEFAZ). */
  fiscalDocumentAccessKey?: string;
  fiscalDocumentIssuedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContractInput {
  organizationId: UniqueEntityId;
  opportunityId: UniqueEntityId;
  quotationId: UniqueEntityId;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Todos os campos opcionais — `PATCH` parcial, mesmo padrão de
 * `Product.updateFiscalLogisticsProfile()` (`ENG-0166`). `undefined` = não
 * mexer; `null` = remover o valor explicitamente.
 */
export interface UpdateFiscalDocumentInput {
  fiscalDocumentNumber?: string | null;
  fiscalDocumentAccessKey?: string | null;
  fiscalDocumentIssuedAt?: Date | null;
}

const FISCAL_DOCUMENT_ACCESS_KEY_PATTERN = /^\d{44}$/;

/** Chave de acesso de NFe tem exatamente 44 dígitos — padrão nacional (SEFAZ), fato técnico estável. */
function validateFiscalDocument(input: { fiscalDocumentAccessKey?: string }): ValidationError | undefined {
  if (input.fiscalDocumentAccessKey !== undefined && !FISCAL_DOCUMENT_ACCESS_KEY_PATTERN.test(input.fiscalDocumentAccessKey)) {
    return new ValidationError('"fiscalDocumentAccessKey" deve ter exatamente 44 dígitos');
  }
  return undefined;
}

export class Contract extends AggregateRoot<ContractProps> implements Timestamped {
  private constructor(props: ContractProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. Nasce sempre `"draft"`. Não valida a Quotation de origem — responsabilidade do Handler que a chama. */
  static create(input: CreateContractInput): Result<Contract, DomainError> {
    const now = new Date();
    const props: ContractProps = {
      organizationId: input.organizationId,
      opportunityId: input.opportunityId,
      quotationId: input.quotationId,
      status: "draft",
      startDate: input.startDate,
      endDate: input.endDate,
      createdAt: now,
      updatedAt: now,
    };
    const contract = new Contract(props);
    contract.addDomainEvent(new ContractCreated(contract.id));
    return Result.ok(contract);
  }

  static reconstitute(props: ContractProps, id: UniqueEntityId): Contract {
    return new Contract(props, id);
  }

  /** Transição `draft → active`. */
  activate(): Result<void, DomainError> {
    if (this.props.status !== "draft") {
      return Result.fail(new ConflictError(`Contract não pode ser ativado a partir do estado "${this.props.status}"`));
    }
    this.props.status = "active";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new ContractActivated(this.id));
    return Result.ok(undefined);
  }

  /** Transição terminal `active → terminated`. Sem `reactivate()` — não confirmado por nenhuma fonte. */
  terminate(): Result<void, DomainError> {
    if (this.props.status !== "active") {
      return Result.fail(new ConflictError(`Contract não pode ser encerrado a partir do estado "${this.props.status}"`));
    }
    this.props.status = "terminated";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new ContractTerminated(this.id));
    return Result.ok(undefined);
  }

  /** `ENG-0169` — ver nota de topo do arquivo. `null` remove o valor, `undefined` não mexe. Sem Domain Event — mesmo critério de `Product.updateFiscalLogisticsProfile()`. */
  updateFiscalDocument(input: UpdateFiscalDocumentInput): Result<void, DomainError> {
    const validationError = validateFiscalDocument({
      fiscalDocumentAccessKey: input.fiscalDocumentAccessKey ?? undefined,
    });
    if (validationError) {
      return Result.fail(validationError);
    }

    if (input.fiscalDocumentNumber !== undefined) this.props.fiscalDocumentNumber = input.fiscalDocumentNumber ?? undefined;
    if (input.fiscalDocumentAccessKey !== undefined) this.props.fiscalDocumentAccessKey = input.fiscalDocumentAccessKey ?? undefined;
    if (input.fiscalDocumentIssuedAt !== undefined) this.props.fiscalDocumentIssuedAt = input.fiscalDocumentIssuedAt ?? undefined;

    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get opportunityId(): UniqueEntityId {
    return this.props.opportunityId;
  }

  get quotationId(): UniqueEntityId {
    return this.props.quotationId;
  }

  get status(): ContractStatus {
    return this.props.status;
  }

  get startDate(): Date | undefined {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get fiscalDocumentNumber(): string | undefined {
    return this.props.fiscalDocumentNumber;
  }

  get fiscalDocumentAccessKey(): string | undefined {
    return this.props.fiscalDocumentAccessKey;
  }

  get fiscalDocumentIssuedAt(): Date | undefined {
    return this.props.fiscalDocumentIssuedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
