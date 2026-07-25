import { Entity, Result, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Proposal — Internal Entity do Aggregate `Opportunity`.
 *
 * Derived from:
 * - [SALES_TECHNICAL_BLUEPRINT.md § 3](../../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) — `Proposal` candidata a Internal Entity de `Opportunity`
 * - [SALES_AGGREGATE_DESIGN.md § 4](../../../../../../knowledge/architecture/analysis/SALES_AGGREGATE_DESIGN.md) — "candidata mais confiável (evento próprio nomeado)"
 * - [ADR-0020](../../../../../../adr/ADR-0020-sales-quotation-position.md) — confirma `Proposal` como conceito distinto de `Quotation`, não sinônimo
 * - [ADR-0021](../../../../../../adr/ADR-0021-pipeline-nature.md) — precedente de padrão Aggregate Root vs. Internal Entity aplicado aqui
 * - [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — forma estrutural seguida (adaptada de Aggregate para Entity, ver nota abaixo)
 *
 * **`Proposal` estende `Entity<T>`, não `AggregateRoot<T>`** — não tem coleção
 * própria de Domain Events, nunca publica evento diretamente (restrição
 * explícita da Ordem de Missão `ENG-0040`). `ProposalApproved`
 * (`UBIQUITOUS_LANGUAGE.md § Domínio: Sales`) só pode ser disparado pelo
 * Aggregate Root `Opportunity` que a possui — não implementado nesta missão,
 * que cobre exclusivamente `Proposal` (`opportunity.ts` não foi alterado).
 *
 * **Não existe independentemente** — não há Repository, não há Factory Method
 * público pensado para uso fora de `Opportunity`; `create()`/`reconstitute()`
 * abaixo destinam-se a ser chamados pelo Aggregate Root que a contém, mesmo
 * padrão conceitual de qualquer Entity interna (ENS-0001 § 3, adaptado).
 *
 * **Estado deliberadamente mínimo** — nenhum campo além do estruturalmente
 * necessário para o único evento já confirmado (`ProposalApproved`). Campos
 * não incluídos, por ausência de fonte:
 * - Conteúdo/termos da proposta — nenhuma fonte define atributos de conteúdo
 *   (`BOM.md § Proposal`: só "Proposta comercial", sem campo). TODO: ver
 *   `SALES_AGGREGATE_DESIGN.md § 13` quando uma Object Specification existir.
 * - Valor/preço — não confirmado como campo de `Proposal` (distinto de
 *   `Quotation`, `ADR-0020`, cuja própria forma também não está definida).
 * - Referência a `Party` — `UBIQUITOUS_LANGUAGE.md` descreve o propósito de
 *   `Proposal` como "documento formal de oferta a um Party", mas não confirma
 *   se `Proposal` guarda essa referência própria ou apenas herda a de
 *   `Opportunity` (que já referencia `Party`). TODO: `SALES_AGGREGATE_DESIGN.md § 13`.
 * - Referência a `Quotation` — nenhuma fonte relaciona os dois além de ambos
 *   pertencerem a `Sales` (`ADR-0020`). TODO.
 */

/**
 * Dois estados mínimos necessários para suportar o único evento já aprovado
 * (`ProposalApproved`). Nenhuma fonte define uma tabela de transição completa
 * nem um estado de rejeição/recusa — não inventado aqui.
 */
export type ProposalStatus = "pending" | "approved";

export interface ProposalProps {
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vazio deliberadamente — nenhum campo de conteúdo/valor está congelado
 * (ver nota de Estado acima). `Record<string, never>` em vez de `interface`
 * vazia para não sinalizar um contrato de campos ainda inexistente.
 */
export type CreateProposalInput = Record<string, never>;

export class Proposal extends Entity<ProposalProps> implements Timestamped {
  private constructor(props: ProposalProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /**
   * Único ponto de criação. Não recebe nenhum campo de conteúdo/valor — nenhum
   * está congelado por `SALES_TECHNICAL_BLUEPRINT.md`/`SALES_AGGREGATE_DESIGN.md`.
   * Não dispara nenhum Domain Event — `Proposal` nunca publica evento
   * diretamente (restrição explícita desta missão); a criação de uma
   * `Proposal` não corresponde a nenhum evento já aprovado (só
   * `ProposalApproved` existe, e é disparado na aprovação, não na criação).
   */
  static create(_input: CreateProposalInput = {}): Result<Proposal, DomainError> {
    const now = new Date();
    const props: ProposalProps = {
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Proposal(props));
  }

  /** Usado exclusivamente por `Opportunity` ao reconstituir seu próprio estado a partir de persistência futura (ENS-0001 § 8, adaptado). */
  static reconstitute(props: ProposalProps, id: UniqueEntityId): Proposal {
    return new Proposal(props, id);
  }

  /**
   * Transição `pending → approved`. Invariante: uma `Proposal` já aprovada não
   * pode ser aprovada novamente — inferência estrutural mínima (mesmo padrão
   * de `Opportunity.markWon()`), não uma regra de negócio explícita de nenhuma
   * fonte. **Não dispara `ProposalApproved`** — isso é responsabilidade do
   * Aggregate Root `Opportunity` que possui esta `Proposal` (não implementado
   * nesta missão); esta chamada apenas muta o estado interno da Entity.
   */
  approve(): Result<void, DomainError> {
    if (this.props.status !== "pending") {
      return Result.fail(new ConflictError(`Proposal não pode ser aprovada a partir do estado "${this.props.status}"`));
    }
    this.props.status = "approved";
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get status(): ProposalStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
