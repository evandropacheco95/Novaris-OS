import { UniqueEntityId } from "./unique-entity-id.js";

/**
 * Classe base para todas as Entities da plataforma. Sem conhecimento de banco,
 * ORM, decorators ou framework — igualdade é definida exclusivamente pela identidade.
 */
export abstract class Entity<T> {
  protected readonly _id: UniqueEntityId;
  protected readonly props: T;

  protected constructor(props: T, id?: UniqueEntityId) {
    this._id = id ?? new UniqueEntityId();
    this.props = props;
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }
    if (this === entity) {
      return true;
    }
    if (!(entity instanceof Entity)) {
      return false;
    }
    return this._id.equals(entity._id);
  }
}
