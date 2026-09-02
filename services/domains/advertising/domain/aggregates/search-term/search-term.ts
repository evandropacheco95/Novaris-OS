import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Dado de performance por janela sincronizada (`BOM.md § 5B`), distinto de
 * `Keyword` (configuração). Único por
 * `(advertisingAccountId, adGroupId, searchTerm, dateRangeStart, dateRangeEnd)`
 * — resincronizar a mesma janela **substitui** os totais, nunca soma
 * (`objects/SearchTerm.md § 10`). Sem método de atualização: a Application
 * Layer resolve substituição via `SearchTermRepository.findByNaturalKey()` +
 * `delete()`/`save()` do novo, nunca mutação in-place — cada linha é o
 * resultado imutável de uma sincronização.
 */
export interface SearchTermProps {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  adGroupId: UniqueEntityId;
  syncRunId: UniqueEntityId;
  searchTerm: string;
  dateRangeStart: Date;
  dateRangeEnd: Date;
  clicks: number;
  impressions: number;
  conversions: number;
  costMicros: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSearchTermInput {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  adGroupId: UniqueEntityId;
  syncRunId: UniqueEntityId;
  searchTerm: string;
  dateRangeStart: Date;
  dateRangeEnd: Date;
  clicks: number;
  impressions: number;
  conversions: number;
  costMicros: number;
}

export class SearchTerm extends AggregateRoot<SearchTermProps> implements Timestamped {
  private constructor(props: SearchTermProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateSearchTermInput): Result<SearchTerm, DomainError> {
    if (input.searchTerm.trim().length === 0) {
      return Result.fail(new ValidationError('"searchTerm" é obrigatório'));
    }
    if (input.dateRangeStart > input.dateRangeEnd) {
      return Result.fail(new ValidationError('"dateRangeStart" não pode ser posterior a "dateRangeEnd"'));
    }

    const now = new Date();
    const props: SearchTermProps = {
      organizationId: input.organizationId,
      advertisingAccountId: input.advertisingAccountId,
      adGroupId: input.adGroupId,
      syncRunId: input.syncRunId,
      searchTerm: input.searchTerm,
      dateRangeStart: input.dateRangeStart,
      dateRangeEnd: input.dateRangeEnd,
      clicks: input.clicks,
      impressions: input.impressions,
      conversions: input.conversions,
      costMicros: input.costMicros,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new SearchTerm(props));
  }

  /** Usado exclusivamente por uma implementação de `SearchTermRepository` (ENS-0001 § 8). */
  static reconstitute(props: SearchTermProps, id: UniqueEntityId): SearchTerm {
    return new SearchTerm(props, id);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get advertisingAccountId(): UniqueEntityId {
    return this.props.advertisingAccountId;
  }

  get adGroupId(): UniqueEntityId {
    return this.props.adGroupId;
  }

  get syncRunId(): UniqueEntityId {
    return this.props.syncRunId;
  }

  get searchTerm(): string {
    return this.props.searchTerm;
  }

  get dateRangeStart(): Date {
    return this.props.dateRangeStart;
  }

  get dateRangeEnd(): Date {
    return this.props.dateRangeEnd;
  }

  get clicks(): number {
    return this.props.clicks;
  }

  get impressions(): number {
    return this.props.impressions;
  }

  get conversions(): number {
    return this.props.conversions;
  }

  get costMicros(): number {
    return this.props.costMicros;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
