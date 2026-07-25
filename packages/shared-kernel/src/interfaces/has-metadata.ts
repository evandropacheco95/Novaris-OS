/**
 * Marca um objeto como possuidor de metadados adicionais — genérico sobre a
 * forma do metadado (`T`), com um default estrutural quando o chamador não
 * precisa de um formato específico.
 */
export interface HasMetadata<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly metadata: T;
}
