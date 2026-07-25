/**
 * Representa sucesso ou falha de uma operação, sem lançar exceção como fluxo normal.
 * Acesso ao valor/erro é sempre seguro (`T | undefined` / `E | undefined`) — o chamador
 * consulta `isSuccess`/`isFailure` antes de decidir o que fazer com o resultado.
 */
export class Result<T, E> {
  private readonly success: boolean;
  private readonly value: T | undefined;
  private readonly error: E | undefined;

  private constructor(success: boolean, value: T | undefined, error: E | undefined) {
    this.success = success;
    this.value = value;
    this.error = error;
  }

  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  static fail<T = never, E = unknown>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this.success;
  }

  get isFailure(): boolean {
    return !this.success;
  }

  getValue(): T | undefined {
    return this.success ? this.value : undefined;
  }

  getError(): E | undefined {
    return this.success ? undefined : this.error;
  }
}
