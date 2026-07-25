import { AggregateRoot, Result, NotFoundError, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { ChecklistItem } from "../../entities/checklist-item/checklist-item.js";

/** Checklist — Aggregate Root do Activity Domain (`ADR-0045`). Sem Domain Event — nenhuma fonte confirma um. */

export interface ChecklistProps {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChecklistInput {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  title: string;
}

export class Checklist extends AggregateRoot<ChecklistProps> implements Timestamped {
  private readonly items: ChecklistItem[];

  private constructor(props: ChecklistProps, items: ChecklistItem[], id?: UniqueEntityId) {
    super(props, id);
    this.items = items;
  }

  static create(input: CreateChecklistInput): Result<Checklist, DomainError> {
    if (!input.title || input.title.trim().length === 0) {
      return Result.fail(new ValidationError('"title" é obrigatório'));
    }
    const now = new Date();
    const props: ChecklistProps = {
      organizationId: input.organizationId,
      partyId: input.partyId,
      title: input.title,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Checklist(props, []));
  }

  static reconstitute(props: ChecklistProps, id: UniqueEntityId, items: ChecklistItem[] = []): Checklist {
    return new Checklist(props, items, id);
  }

  addItem(label: string): Result<ChecklistItem, DomainError> {
    const itemResult = ChecklistItem.create({ label });
    if (itemResult.isFailure) {
      return Result.fail(itemResult.getError()!);
    }
    const item = itemResult.getValue()!;
    this.items.push(item);
    this.props.updatedAt = new Date();
    return Result.ok(item);
  }

  toggleItem(itemId: UniqueEntityId): Result<void, DomainError> {
    const item = this.items.find((candidate) => candidate.id.equals(itemId));
    if (!item) {
      return Result.fail(new NotFoundError(`Item "${itemId.toString()}" não pertence a este Checklist`));
    }
    item.toggle();
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  getItems(): ReadonlyArray<ChecklistItem> {
    return [...this.items];
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get partyId(): UniqueEntityId {
    return this.props.partyId;
  }

  get title(): string {
    return this.props.title;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
