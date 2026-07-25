import { AggregateRoot, Result, ConflictError } from "@novaris/shared-kernel";
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
 */

export type ContractStatus = "draft" | "active" | "terminated";

export interface ContractProps {
  organizationId: UniqueEntityId;
  opportunityId: UniqueEntityId;
  quotationId: UniqueEntityId;
  status: ContractStatus;
  startDate?: Date;
  endDate?: Date;
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
