import { ValueObject, Result, ValidationError } from "@novaris/shared-kernel";

interface EmailProps extends Record<string, unknown> {
  value: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Value Object para o email de um `User` — proposto em
 * IDENTITY_TECHNICAL_BLUEPRINT.md § 3 (Missão ENG-0002.2). Normaliza
 * (trim + lowercase) antes de validar, para que dois emails equivalentes por
 * capitalização sejam iguais por valor.
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(value: string): Result<Email, ValidationError> {
    const normalized = value.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      return Result.fail(new ValidationError(`email inválido: "${value}"`));
    }
    return Result.ok(new Email({ value: normalized }));
  }

  get value(): string {
    return this.props.value;
  }
}
