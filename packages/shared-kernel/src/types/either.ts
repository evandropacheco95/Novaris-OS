/**
 * Representa um valor que está em um dos dois lados possíveis (Left ou Right).
 * Sem dependência de Result — primitiva independente. Acesso ao lado ativo é
 * sempre seguro (`L | undefined` / `R | undefined`).
 */
export class Either<L, R> {
  private readonly right: boolean;
  private readonly leftValue: L | undefined;
  private readonly rightValue: R | undefined;

  private constructor(right: boolean, leftValue: L | undefined, rightValue: R | undefined) {
    this.right = right;
    this.leftValue = leftValue;
    this.rightValue = rightValue;
  }

  static left<L, R = never>(value: L): Either<L, R> {
    return new Either<L, R>(false, value, undefined);
  }

  static right<L = never, R = never>(value: R): Either<L, R> {
    return new Either<L, R>(true, undefined, value);
  }

  get isLeft(): boolean {
    return !this.right;
  }

  get isRight(): boolean {
    return this.right;
  }

  getLeft(): L | undefined {
    return this.right ? undefined : this.leftValue;
  }

  getRight(): R | undefined {
    return this.right ? this.rightValue : undefined;
  }
}
