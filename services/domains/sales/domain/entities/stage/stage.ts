import { Entity, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError } from "@novaris/shared-kernel";

/**
 * Stage — Internal Entity do Aggregate `Pipeline`.
 *
 * **Owner Aggregate**: `Pipeline`.
 *
 * **Aggregate Type** (do Aggregate que a possui): Configuration Aggregate —
 * `Stage` herda essa natureza de `Pipeline` (`ADR-0021`), não tem ciclo de
 * vida transacional próprio.
 *
 * Architectural Sources:
 * - [ADR-0021](../../../../../../adr/ADR-0021-pipeline-nature.md) — decisão formal: `Stage` é Entity interna de `Pipeline`, nunca de `Opportunity`; `Opportunity` só mantém referência (`currentStageId`) à etapa corrente
 * - [SALES_AGGREGATE_DESIGN.md § 3-4](../../../../../../knowledge/architecture/analysis/SALES_AGGREGATE_DESIGN.md) — pendência original (Entity de `Opportunity` ou de `Pipeline`?), resolvida por `ADR-0021`
 * - [SALES_TECHNICAL_BLUEPRINT.md § 3](../../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) — `Stage` como Internal Entity de `Pipeline`
 * - [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — forma estrutural seguida (adaptada de Aggregate para Entity)
 *
 * **Não existe independentemente** — sem Repository, sem Factory Method
 * pensado para uso fora de `Pipeline` (que ainda não implementa nenhuma
 * coleção de `Stage`s — `pipeline.ts`, Missão ENG-0041 — esse wiring é
 * trabalho futuro, fora do escopo desta missão).
 *
 * **Nunca publica evento** — `Stage` estende `Entity<T>`, não `AggregateRoot<T>`;
 * nenhuma fonte nomeia um evento próprio de `Stage` em nenhum documento.
 *
 * **Estado deliberadamente mínimo** — único campo confirmado por fonte
 * textual direta: `name` ("etapa **nomeada** dentro de um Pipeline",
 * `UBIQUITOUS_LANGUAGE.md § Domínio: Sales`). Campos não incluídos:
 * - Ordem/posição dentro do `Pipeline` — `Pipeline` é descrito como "a
 *   sequência de Stages que uma Opportunity percorre" (`UBIQUITOUS_LANGUAGE.md`,
 *   entrada de `Pipeline`), o que implica alguma noção de ordem, mas nenhuma
 *   fonte confirma se é um campo próprio de `Stage` (`order`/`position`) ou
 *   apenas a posição no array de `Pipeline`. Não inventado aqui — TODO:
 *   `SALES_AGGREGATE_DESIGN.md § 13`, `ADR-0021 § Consequências`.
 * - `createdAt`/`updatedAt` — deliberadamente omitidos, diferente de
 *   `Proposal` (ENG-0040): nenhuma fonte confirma timestamps para `Stage`, e
 *   sem nenhum método de mutação aprovado (só criação), um `updatedAt` nunca
 *   mudaria — incluí-lo seria um campo morto. TODO: reavaliar se um método de
 *   mutação (ex.: renomear) for aprovado no futuro.
 * - Referência a `Pipeline` (`pipelineId`) — mesmo padrão já aplicado a
 *   `Proposal`/`Opportunity` (ENG-0040): uma Entity interna não guarda
 *   backreference ao Aggregate que a contém, é apenas contida em sua coleção.
 */
export interface StageProps {
  name: string;
}

export interface CreateStageInput {
  name: string;
}

export class Stage extends Entity<StageProps> {
  private constructor(props: StageProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /**
   * Único ponto de criação. Valida apenas que `name` não é vazio — "etapa
   * **nomeada**" (`UBIQUITOUS_LANGUAGE.md`) implica um nome não-vazio como
   * condição definicional, não uma regra de negócio inventada. Não dispara
   * nenhum Domain Event — `Stage` nunca publica evento diretamente
   * (restrição explícita desta missão), e nenhuma fonte nomeia um evento de
   * criação de `Stage`.
   */
  static create(input: CreateStageInput): Result<Stage, DomainError> {
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório para uma Stage'));
    }
    const props: StageProps = { name: input.name };
    return Result.ok(new Stage(props));
  }

  /** Usado exclusivamente por `Pipeline` ao reconstituir seu próprio estado a partir de persistência futura (ENS-0001 § 8, adaptado). */
  static reconstitute(props: StageProps, id: UniqueEntityId): Stage {
    return new Stage(props, id);
  }

  /**
   * Nenhum método de mutação é implementado — renomear ou reordenar uma
   * `Stage` não é comportamento confirmado por nenhuma fonte
   * (`SALES_AGGREGATE_DESIGN.md § 7`, "Allowed State Transitions — Não
   * coberto"). Implementá-lo agora seria assumir uma regra de negócio.
   */

  get name(): string {
    return this.props.name;
  }
}
