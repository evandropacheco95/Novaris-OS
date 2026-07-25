/**
 * Classe base para todos os Value Objects. Imutável, sem identidade, sem setters —
 * igualdade é definida por deep equality das propriedades (readonly).
 */
export abstract class ValueObject<T extends Record<string, unknown>> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof ValueObject)) {
      return false;
    }
    return ValueObject.deepEqual(this.props, vo.props);
  }

  private static deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
      return true;
    }
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
      return false;
    }
    const aRecord = a as Record<string, unknown>;
    const bRecord = b as Record<string, unknown>;
    const aKeys = Object.keys(aRecord);
    const bKeys = Object.keys(bRecord);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    return aKeys.every((key) => ValueObject.deepEqual(aRecord[key], bRecord[key]));
  }
}
