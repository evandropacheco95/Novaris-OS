/**
 * Contrato do Specification Pattern — regra de negócio combinável e testável
 * isoladamente (ver ENGINEERING_PLAYBOOK.md § 3). Composição fluente via
 * and/or/not: cada método retorna uma nova Specification, nunca muta `this`.
 */
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}
