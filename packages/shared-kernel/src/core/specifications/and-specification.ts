import type { Specification } from "./specification.js";
import { OrSpecification } from "./or-specification.js";
import { NotSpecification } from "./not-specification.js";

/**
 * Satisfeita quando ambas as Specifications compostas são satisfeitas.
 *
 * Implementa `Specification<T>` diretamente (não estende `AbstractSpecification`)
 * — ver nota em `abstract-specification.ts` sobre o import circular que essa
 * escolha evita.
 */
export class AndSpecification<T> implements Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {}

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
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
