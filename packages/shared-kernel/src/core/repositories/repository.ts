import type { AggregateRoot } from "../aggregate-roots/aggregate-root.js";

/**
 * Contrato base de persistência — raiz comum de `ReadRepository`/`WriteRepository`.
 * Interface vazia por definição: a regra de DDD "só Aggregate Roots têm
 * Repository" é expressa pelo `extends AggregateRoot<unknown>` no parâmetro de
 * tipo, não por operações aqui — as operações vivem nas interfaces segregadas.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- T é usado como marcador de tipo (constraint), ver comentário acima
export interface Repository<T extends AggregateRoot<unknown>> {}
