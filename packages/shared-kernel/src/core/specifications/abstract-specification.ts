import type { Specification } from "./specification.js";
import { AndSpecification } from "./and-specification.js";
import { OrSpecification } from "./or-specification.js";
import { NotSpecification } from "./not-specification.js";

/**
 * Base para toda Specification concreta de domínio — só `isSatisfiedBy` é
 * abstrato; `and`/`or`/`not` já vêm implementados via composição fluente.
 *
 * `AndSpecification`/`OrSpecification`/`NotSpecification` **não estendem esta
 * classe** — implementam `Specification<T>` diretamente. Motivo: esta classe
 * precisa importar as 3 classes de composição (para construí-las em `and`/
 * `or`/`not`); se elas por sua vez estendessem `AbstractSpecification`
 * (`extends` é avaliado de forma síncrona na declaração da classe), o import
 * circular resultante quebra em runtime com `ReferenceError: Cannot access
 * 'AbstractSpecification' before initialization` (confirmado empiricamente
 * durante esta missão). Composição concreta funcionalmente equivalente, sem o
 * ciclo — ver `and-specification.ts`/`or-specification.ts`/`not-specification.ts`.
 */
export abstract class AbstractSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

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
