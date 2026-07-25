import type { Specification } from "./specification.js";
import { AndSpecification } from "./and-specification.js";
import { OrSpecification } from "./or-specification.js";

/**
 * Satisfeita quando a Specification composta NÃO é satisfeita (negação).
 *
 * Implementa `Specification<T>` diretamente (não estende `AbstractSpecification`)
 * — ver nota em `abstract-specification.ts` sobre o import circular que essa
 * escolha evita.
 */
export class NotSpecification<T> implements Specification<T> {
  constructor(private readonly spec: Specification<T>) {}

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification<T>(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification<T>(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification<T>(this);
  }
}
