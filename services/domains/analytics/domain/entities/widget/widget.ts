import { Entity, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError } from "@novaris/shared-kernel";

/**
 * Widget — Internal Entity do Aggregate `Dashboard` (`ADR-0049`), desbloqueia
 * o que `ADR-0034` tinha deixado explicitamente bloqueado ("sem tipos de
 * visualização definidos"). `metricKey` é uma string opaca — só o Frontend a
 * interpreta para escolher quais dados já buscados (mesmos endpoints do
 * Dashboard principal, `ENG-0149`) alimentam este Widget; o Backend nunca
 * valida ou resolve `metricKey` contra dado real de outro domínio, mantendo
 * o Analytics Domain desacoplado de Sales/Activity/etc.
 */

export type WidgetType = "kpi" | "list" | "donut" | "bar";

export interface WidgetProps {
  type: WidgetType;
  title: string;
  metricKey: string;
}

export interface CreateWidgetInput {
  type: WidgetType;
  title: string;
  metricKey: string;
}

export class Widget extends Entity<WidgetProps> {
  private constructor(props: WidgetProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateWidgetInput): Result<Widget, DomainError> {
    if (input.title.trim().length === 0) {
      return Result.fail(new ValidationError('"title" é obrigatório'));
    }
    if (input.metricKey.trim().length === 0) {
      return Result.fail(new ValidationError('"metricKey" é obrigatório'));
    }
    return Result.ok(new Widget({ type: input.type, title: input.title, metricKey: input.metricKey }));
  }

  /** Usado exclusivamente por `Dashboard` ao reconstituir a partir de persistência. */
  static reconstitute(props: WidgetProps, id: UniqueEntityId): Widget {
    return new Widget(props, id);
  }

  get type(): WidgetType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get metricKey(): string {
    return this.props.metricKey;
  }
}
