import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Revenue — Aggregate Root do Sales Domain (`ADR-0047`), último objeto
 * oficial sem forma definida desde `ADR-0044`. Gerado exclusivamente a
 * partir de um `Contract` `active` (`GenerateRevenueFromContractHandler`),
 * mesmo princípio de `Contract` nascer só de uma `Quotation` `accepted` —
 * mas sem estados: é um registro pontual e imutável de valor reconhecido,
 * não um Aggregate com ciclo de vida. Múltiplos registros podem existir
 * para o mesmo Contract (reconhecimento incremental ao longo do tempo).
 */
export interface RevenueProps {
  organizationId: UniqueEntityId;
  contractId: UniqueEntityId;
  amount: number;
  currency: string;
  recognizedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRevenueInput {
  organizationId: UniqueEntityId;
  contractId: UniqueEntityId;
  amount: number;
  currency: string;
  recognizedAt?: Date;
}

export class Revenue extends AggregateRoot<RevenueProps> implements Timestamped {
  private constructor(props: RevenueProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação — responsabilidade de validar o Contract de origem é do Handler que chama. */
  static create(input: CreateRevenueInput): Result<Revenue, DomainError> {
    if (input.amount <= 0) {
      return Result.fail(new ValidationError('"amount" deve ser maior que zero'));
    }
    if (input.currency.trim().length === 0) {
      return Result.fail(new ValidationError('"currency" é obrigatório'));
    }

    const now = new Date();
    const props: RevenueProps = {
      organizationId: input.organizationId,
      contractId: input.contractId,
      amount: input.amount,
      currency: input.currency,
      recognizedAt: input.recognizedAt ?? now,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Revenue(props));
  }

  static reconstitute(props: RevenueProps, id: UniqueEntityId): Revenue {
    return new Revenue(props, id);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get contractId(): UniqueEntityId {
    return this.props.contractId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get recognizedAt(): Date {
    return this.props.recognizedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
