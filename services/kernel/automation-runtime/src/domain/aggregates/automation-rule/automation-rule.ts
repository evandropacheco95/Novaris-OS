import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError } from "@novaris/shared-kernel";

/**
 * `AutomationAction` — inspirado nas ações do Salesforce Flow, reduzido a 3
 * tipos que não exigem nenhuma credencial externa (`ADR-0041`): `log`
 * (`@novaris/logging`), `notify` (`@novaris/notifications`, canal ainda
 * console) e `webhook` (`fetch` real para uma URL escolhida por quem cria a
 * regra — mesma filosofia de Zapier/Make/n8n, `NOVARIS_OS.md § 7`).
 */
export type AutomationAction =
  | { readonly type: "log"; readonly message: string }
  | { readonly type: "notify"; readonly recipientUserId: string; readonly message: string }
  | { readonly type: "webhook"; readonly url: string };

/**
 * AutomationRule — Aggregate Root do Kernel `automation-runtime` (Fase F,
 * `ADR-0041`). `triggerEventName` referencia o `eventName` de um
 * `DomainEvent` já publicado no Event Bus (`ADR-0037`) — não um catálogo
 * fechado, qualquer nome de evento existente pode ser usado.
 *
 * **Sem `conditions`** — `DomainEvent` não carrega payload de negócio
 * (`eventId`/`aggregateId`/`occurredAt`/`eventName` apenas), então não há
 * campo para avaliar uma condição real contra ele. Toda regra dispara
 * incondicionalmente ao evento gatilho. Limitação estrutural registrada em
 * `ADR-0041`, não um corte arbitrário.
 */
export interface AutomationRuleProps {
  organizationId: UniqueEntityId;
  name: string;
  triggerEventName: string;
  actions: AutomationAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAutomationRuleInput {
  organizationId: UniqueEntityId;
  name: string;
  triggerEventName: string;
  actions: AutomationAction[];
  enabled?: boolean;
}

export class AutomationRule extends AggregateRoot<AutomationRuleProps> {
  private constructor(props: AutomationRuleProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateAutomationRuleInput): Result<AutomationRule, DomainError> {
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" não pode ser vazio'));
    }
    if (input.triggerEventName.trim().length === 0) {
      return Result.fail(new ValidationError('"triggerEventName" não pode ser vazio'));
    }
    if (input.actions.length === 0) {
      return Result.fail(new ValidationError('"actions" precisa de ao menos 1 ação'));
    }
    for (const action of input.actions) {
      const validation = validateAction(action);
      if (validation.isFailure) {
        return Result.fail(validation.getError()!);
      }
    }
    const now = new Date();
    return Result.ok(
      new AutomationRule({
        organizationId: input.organizationId,
        name: input.name,
        triggerEventName: input.triggerEventName,
        actions: input.actions,
        enabled: input.enabled ?? true,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static reconstitute(props: AutomationRuleProps, id: UniqueEntityId): AutomationRule {
    return new AutomationRule(props, id);
  }

  setEnabled(enabled: boolean): void {
    this.props.enabled = enabled;
    this.props.updatedAt = new Date();
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get triggerEventName(): string {
    return this.props.triggerEventName;
  }

  get actions(): ReadonlyArray<AutomationAction> {
    return this.props.actions;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

function validateAction(action: AutomationAction): Result<void, DomainError> {
  switch (action.type) {
    case "log":
      if (!action.message || action.message.trim().length === 0) {
        return Result.fail(new ValidationError('Ação "log" precisa de "message"'));
      }
      return Result.ok(undefined);
    case "notify":
      if (!action.recipientUserId || action.recipientUserId.trim().length === 0) {
        return Result.fail(new ValidationError('Ação "notify" precisa de "recipientUserId"'));
      }
      if (!action.message || action.message.trim().length === 0) {
        return Result.fail(new ValidationError('Ação "notify" precisa de "message"'));
      }
      return Result.ok(undefined);
    case "webhook":
      if (!action.url || action.url.trim().length === 0) {
        return Result.fail(new ValidationError('Ação "webhook" precisa de "url"'));
      }
      try {
        // eslint-disable-next-line no-new
        new URL(action.url);
      } catch {
        return Result.fail(new ValidationError(`"url" inválida: "${action.url}"`));
      }
      return Result.ok(undefined);
    default:
      return Result.fail(new ValidationError(`Tipo de ação desconhecido: "${(action as { type: string }).type}"`));
  }
}
