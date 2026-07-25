import { randomUUID } from "node:crypto";

/**
 * Identidade única de uma Entity. Gera o valor via `node:crypto` (built-in do runtime,
 * não uma biblioteca de UUID) quando nenhum valor é fornecido — preparada para que um
 * futuro provider de identidade substitua a geração sem alterar esta API pública.
 */
export class UniqueEntityId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id ?? randomUUID();
  }

  toString(): string {
    return this.value;
  }

  toValue(): string {
    return this.value;
  }

  equals(id?: UniqueEntityId): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    if (!(id instanceof UniqueEntityId)) {
      return false;
    }
    return this.value === id.value;
  }
}
