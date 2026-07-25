import { AggregateRoot, Result, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import type { Stage } from "../../entities/stage/stage.js";

/**
 * Pipeline — Aggregate Root do Sales Domain.
 *
 * **Aggregate Type**: Configuration Aggregate — não transacional, mesmo padrão
 * estrutural de `Role` (Identity Domain): identidade e persistência próprias,
 * mutação rara (criação/edição administrativa, não por negociação individual),
 * referenciado por id por múltiplas instâncias de `Opportunity` (`Related
 * Aggregate` abaixo), nunca embutido.
 *
 * **Owner Domain**: `Sales` — confirmado, nunca esteve em disputa
 * (`DOMAIN_OWNERSHIP.md § 3`).
 *
 * **Related Aggregate**: `Opportunity` — referencia `Pipeline` **somente por
 * id** (`pipelineId`), nunca o embute. `Pipeline` nunca referencia `Opportunity`
 * de volta — a relação é unidirecional (Opportunity → Pipeline).
 *
 * Architectural Sources:
 * - [ADR-0021](../../../../../../adr/ADR-0021-pipeline-nature.md) — origem da classificação "Configuration Aggregate", decisão de que `Pipeline` é Aggregate Root próprio (não Entity de `Opportunity`, não configuração de `Organization`)
 * - [SALES_AGGREGATE_DESIGN.md § 1, § 3](../../../../../../knowledge/architecture/analysis/SALES_AGGREGATE_DESIGN.md) — `Pipeline` como segundo Aggregate Root de `Sales`
 * - [SALES_TECHNICAL_BLUEPRINT.md § 3](../../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) — Aggregate Structure, `Pipeline` como Aggregate Root de configuração
 * - [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — forma estrutural seguida, `organizationId` obrigatório (§ 7)
 * - [Business Domain Aggregate Extension § 4](../../../../../../knowledge/architecture/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) — regra de Internal Entity vs. Aggregate Root próprio, já aplicada por `ADR-0021` para decidir esta própria classificação
 *
 * **`Stage` — wiring implementado nesta missão (ENG-0043)**: `Pipeline` passa
 * a possuir uma coleção interna `stages: Stage[]` (campo de classe dedicado,
 * fora de `PipelineProps` — `Stage` são instâncias de Entity, não dado
 * plano). `Stage` continua Internal Entity, sem Repository ou Factory Method
 * próprios para uso externo (`ADR-0021`).
 *
 * **Estado deliberadamente mínimo** — nenhum campo além do que já é exigido
 * estruturalmente. Campos não incluídos, por ausência de fonte:
 * - Nome/label do `Pipeline` — nenhuma fonte define um campo de identificação
 *   textual (`BOM.md § Pipeline`: só "Fluxo de trabalho configurável", sem
 *   atributo). TODO: `SALES_AGGREGATE_DESIGN.md § 13`.
 * - Mecanismo de criação/edição (quem pode, quando) — `Needs Evidence`
 *   (`ADR-0021 § Consequências`). TODO.
 * - `organizationId` como campo **incluído** abaixo — não é invenção
 *   específica de `Pipeline`, é a regra transversal já congelada de
 *   `AGGREGATE_IMPLEMENTATION_STANDARD.md § 7` (ENS-0001): "todo `TProps` de
 *   Aggregate que representa dado de negócio inclui `organizationId`". O
 *   próprio `ADR-0021` trata a relação `Pipeline`↔`Organization` como
 *   "candidata, não confirmada por nenhuma fonte explícita" — incluído aqui
 *   por aplicação da regra geral de ENS-0001, não por confirmação específica
 *   de `Sales`.
 * - Ordem/reordenação, remoção, ativação/desativação de `Stage` — nenhuma
 *   dessas regras existe em nenhuma ADR (`ADR-0021 § Consequências`,
 *   `SALES_AGGREGATE_DESIGN.md § 7`, "Allowed State Transitions — Não
 *   coberto") — explicitamente não implementadas por instrução desta missão.
 */
export interface PipelineProps {
  organizationId: UniqueEntityId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePipelineInput {
  organizationId: UniqueEntityId;
}

export class Pipeline extends AggregateRoot<PipelineProps> implements Timestamped {
  private readonly stages: Stage[];

  private constructor(props: PipelineProps, stages: Stage[], id?: UniqueEntityId) {
    super(props, id);
    this.stages = stages;
  }

  /**
   * Único ponto de criação. Começa sempre com `stages` vazio — nenhuma fonte
   * confirma que uma `Pipeline` nasce com etapas pré-definidas
   * (`ADR-0021 § Consequências`, `Needs Evidence`). Não dispara nenhum Domain
   * Event — nenhuma fonte nomeia um evento de `Pipeline` (diferente de
   * `Opportunity`, que tem 3 eventos confirmados) — `SALES_TECHNICAL_BLUEPRINT.md § 7`
   * só lista eventos de `Opportunity`/`Proposal`. `PipelineCreated` não existe
   * em nenhuma fonte e não é criado por esta ou por nenhuma missão — violaria
   * "No Hidden Decisions" (`ARCHITECTURE_GOVERNANCE.md § 2`).
   */
  static create(input: CreatePipelineInput): Result<Pipeline, DomainError> {
    const now = new Date();
    const props: PipelineProps = {
      organizationId: input.organizationId,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Pipeline(props, []));
  }

  /**
   * Usado exclusivamente por uma futura implementação de `PipelineRepository`
   * (ENS-0001 § 8). `stages` default `[]` preserva a assinatura anterior a
   * `ENG-0043` para qualquer chamador que ainda não persista `Stage`s.
   */
  static reconstitute(props: PipelineProps, id: UniqueEntityId, stages: Stage[] = []): Pipeline {
    return new Pipeline(props, stages, id);
  }

  /**
   * Adiciona uma `Stage` já construída (por `Stage.create()`, fora desta
   * classe) à coleção interna. Única invariante aplicada: nenhuma `Stage` com
   * o mesmo id pode ser adicionada duas vezes — integridade estrutural básica
   * de coleção (mesma natureza de "`id` é imutável após a criação"), não uma
   * regra de negócio de `Sales`. Nenhuma validação de nome único, ordem ou
   * limite de etapas — nenhuma fonte confirma essas regras
   * (`SALES_AGGREGATE_DESIGN.md § 7`). Não dispara Domain Event (restrição
   * explícita de `ENG-0043`).
   */
  addStage(stage: Stage): Result<void, DomainError> {
    const alreadyExists = this.stages.some((existing) => existing.id.equals(stage.id));
    if (alreadyExists) {
      return Result.fail(new ConflictError(`Stage "${stage.id.toString()}" já pertence a esta Pipeline`));
    }
    this.stages.push(stage);
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /** Busca uma `Stage` pela sua identidade — leitura pura, sem mutação. */
  findStage(stageId: UniqueEntityId): Stage | undefined {
    return this.stages.find((stage) => stage.id.equals(stageId));
  }

  /**
   * Retorna uma cópia defensiva da coleção — o chamador nunca recebe
   * referência ao array interno, impedindo mutação externa (`push`/`splice`
   * direto) que contornaria `addStage()`.
   */
  getStages(): ReadonlyArray<Stage> {
    return [...this.stages];
  }

  /**
   * Nenhum outro método de mutação é implementado — `reorderStage`,
   * `removeStage`, `activateStage`, `deactivateStage` não existem em nenhuma
   * ADR (`ADR-0021 § Consequências`) — implementá-los inventaria regra de
   * negócio, restrição explícita desta missão (ENG-0043).
   */

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
