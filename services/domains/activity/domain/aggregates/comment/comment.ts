import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { CommentCreated } from "../../events/comment-created.js";

/**
 * Comment — Aggregate Root do Activity Domain, inspirado no Salesforce
 * Chatter (`ADR-0043`). Owner de domínio já decidido desde a modelagem
 * original (`DOMAIN_MODEL.md § ACTIVITY DOMAIN`); `ENG-0132` já confirmara
 * "polimórfico, fora de escopo" — esta é a implementação real.
 *
 * `targetType` é **deliberadamente** `string` livre, sem enum fechado —
 * Comment precisa anexar a qualquer objeto de qualquer domínio, presente ou
 * futuro; um catálogo fechado contradiria o próprio propósito polimórfico
 * (`BOM.md § Comment`: "Comentário associado a qualquer objeto"). Mesmo
 * tratamento de `Lead.source`.
 *
 * Sem validação de existência do alvo (`targetType`/`targetId`) — validar
 * exigiria depender de todos os domínios comentáveis, contradizendo o
 * desacoplamento que é a razão de existir deste Aggregate.
 *
 * Sem restrição de "só o autor pode editar" — nenhum outro Aggregate desta
 * plataforma aplica posse individual de registro (autorização é sempre por
 * Permission de domínio); manter consistência, não uma lacuna nova.
 */

export interface CommentProps {
  organizationId: UniqueEntityId;
  targetType: string;
  targetId: UniqueEntityId;
  authorUserId: UniqueEntityId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  organizationId: UniqueEntityId;
  targetType: string;
  targetId: UniqueEntityId;
  authorUserId: UniqueEntityId;
  body: string;
}

export class Comment extends AggregateRoot<CommentProps> implements Timestamped {
  private constructor(props: CommentProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. */
  static create(input: CreateCommentInput): Result<Comment, DomainError> {
    if (!input.targetType || input.targetType.trim().length === 0) {
      return Result.fail(new ValidationError('"targetType" é obrigatório'));
    }
    if (!input.body || input.body.trim().length === 0) {
      return Result.fail(new ValidationError('"body" é obrigatório'));
    }
    const now = new Date();
    const props: CommentProps = {
      organizationId: input.organizationId,
      targetType: input.targetType,
      targetId: input.targetId,
      authorUserId: input.authorUserId,
      body: input.body,
      createdAt: now,
      updatedAt: now,
    };
    const comment = new Comment(props);
    comment.addDomainEvent(new CommentCreated(comment.id));
    return Result.ok(comment);
  }

  static reconstitute(props: CommentProps, id: UniqueEntityId): Comment {
    return new Comment(props, id);
  }

  /** Edita o texto — sem Domain Event (mutação administrativa, mesmo critério de `Lead.updateStatus()`). */
  updateBody(newBody: string): Result<void, DomainError> {
    if (!newBody || newBody.trim().length === 0) {
      return Result.fail(new ValidationError('"body" é obrigatório'));
    }
    this.props.body = newBody;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get targetType(): string {
    return this.props.targetType;
  }

  get targetId(): UniqueEntityId {
    return this.props.targetId;
  }

  get authorUserId(): UniqueEntityId {
    return this.props.authorUserId;
  }

  get body(): string {
    return this.props.body;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
