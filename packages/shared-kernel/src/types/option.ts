/**
 * Representa presença ou ausência de valor através de dois estados explícitos
 * (Some/None) — nunca usa `null` como sinalização de ausência. Some/None não são
 * exportados: o único ponto de entrada público é `Option<T>` (`Option.some`/`Option.none`).
 */
export abstract class Option<T> {
  abstract readonly isSome: boolean;
  abstract readonly isNone: boolean;

  static some<T>(value: T): Option<T> {
    return new Some<T>(value);
  }

  static none<T>(): Option<T> {
    return new None<T>();
  }

  abstract getOrElse(fallback: T): T;
}

class Some<T> extends Option<T> {
  readonly isSome = true;
  readonly isNone = false;

  constructor(private readonly value: T) {
    super();
  }

  getOrElse(_fallback: T): T {
    return this.value;
  }
}

class None<T> extends Option<T> {
  readonly isSome = false;
  readonly isNone = true;

  getOrElse(fallback: T): T {
    return fallback;
  }
}
