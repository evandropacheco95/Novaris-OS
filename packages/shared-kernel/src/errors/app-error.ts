/** Opções comuns a todo AppError — todas opcionais e explicitamente tipadas. */
export interface AppErrorOptions {
  readonly details?: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
  readonly cause?: unknown;
}

/**
 * Raiz da hierarquia de erros da NOVARIS. Estende `Error` nativo (única classe
 * da hierarquia que o faz diretamente — "utilizar Error como base apenas onde
 * necessário"). Abstrata: nunca lançada diretamente, só através de uma subclasse
 * concreta com `code` fixo.
 */
export abstract class AppError extends Error {
  readonly code: string;
  readonly details: Record<string, unknown> | undefined;
  readonly metadata: Record<string, unknown> | undefined;
  readonly cause: unknown;

  protected constructor(code: string, message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.details = options.details;
    this.metadata = options.metadata;
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      metadata: this.metadata,
    };
  }
}
