import { Entity, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError } from "@novaris/shared-kernel";

/** ChecklistItem — Internal Entity do Aggregate `Checklist` (`ADR-0045`), mesmo padrão de `Proposal`/`Stage`/`QuotationLineItem`. */

export interface ChecklistItemProps {
  label: string;
  completed: boolean;
}

export interface CreateChecklistItemInput {
  label: string;
}

export class ChecklistItem extends Entity<ChecklistItemProps> {
  private constructor(props: ChecklistItemProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateChecklistItemInput): Result<ChecklistItem, DomainError> {
    if (!input.label || input.label.trim().length === 0) {
      return Result.fail(new ValidationError('"label" é obrigatório'));
    }
    return Result.ok(new ChecklistItem({ label: input.label, completed: false }));
  }

  static reconstitute(props: ChecklistItemProps, id: UniqueEntityId): ChecklistItem {
    return new ChecklistItem(props, id);
  }

  toggle(): void {
    this.props.completed = !this.props.completed;
  }

  get label(): string {
    return this.props.label;
  }

  get completed(): boolean {
    return this.props.completed;
  }
}
