import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, ConflictError, AggregateRoot, Entity } from "@novaris/shared-kernel";
import { Pipeline } from "../../../../domain/aggregates/pipeline/pipeline.js";
import { Stage } from "../../../../domain/entities/stage/stage.js";

/**
 * Testes unitários do Aggregate Root `Pipeline` — Ordem de Missão ENG-0054.
 * Segue exatamente o mesmo padrão já em uso em
 * `opportunity.test.ts` (`ENG-0053`) e nos precedentes de Kernel
 * (`organization.test.ts`, `user.test.ts`): `describe`/`it` por método,
 * `getValue()!`/`getError()`, checagem de `domainEvents` diretamente sobre a
 * instância. Nenhum padrão novo introduzido.
 *
 * Objetivo desta missão: **congelar o comportamento atual** do Aggregate
 * `Pipeline` e da Entity `Stage` que ele possui — não expandir o domínio.
 * `Pipeline` não dispara nenhum Domain Event (nenhuma fonte nomeia
 * `PipelineCreated`, `pipeline.ts` linha ~76-81) — esta suíte verifica essa
 * ausência, não a inventa. `Stage` não tem método de mutação além de
 * `create()`/`reconstitute()` (`stage.ts`) — não testado além disso, por não
 * existir comportamento a testar.
 *
 * Nenhum método, regra, evento, campo, Aggregate, Entity ou Value Object novo
 * foi criado. `opportunity.ts`, `proposal.ts`, `stage.ts`, Repositories,
 * Mappers, Infrastructure e Contracts não foram alterados.
 */

function buildCreateInput() {
  return { organizationId: new UniqueEntityId() };
}

function buildStage(name = "Qualificação"): Stage {
  return Stage.create({ name }).getValue()!;
}

describe("Pipeline.create", () => {
  it("cria uma Pipeline válida com coleção de Stages inicialmente vazia", () => {
    const input = buildCreateInput();
    const result = Pipeline.create(input);
    assert.equal(result.isSuccess, true);

    const pipeline = result.getValue()!;
    assert.equal(pipeline.organizationId.equals(input.organizationId), true);
    assert.equal(pipeline.getStages().length, 0);
  });

  it("não dispara nenhum Domain Event — nenhuma fonte nomeia PipelineCreated", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    assert.equal(pipeline.domainEvents.length, 0);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Pipeline.create(buildCreateInput()));
  });
});

describe("Pipeline.reconstitute", () => {
  it("restaura uma Pipeline sem validar e sem disparar eventos", () => {
    const created = Pipeline.create(buildCreateInput()).getValue()!;
    const id = new UniqueEntityId();

    const reconstituted = Pipeline.reconstitute(
      {
        organizationId: created.organizationId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      id,
    );

    assert.equal(reconstituted.id.equals(id), true);
    assert.equal(reconstituted.organizationId.equals(created.organizationId), true);
    assert.equal(reconstituted.domainEvents.length, 0);
  });

  it("restaura a coleção de Stages fornecida", () => {
    const created = Pipeline.create(buildCreateInput()).getValue()!;
    const stage = buildStage();
    const id = new UniqueEntityId();

    const reconstituted = Pipeline.reconstitute(
      {
        organizationId: created.organizationId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      id,
      [stage],
    );

    assert.equal(reconstituted.getStages().length, 1);
    assert.equal(reconstituted.findStage(stage.id)?.id.equals(stage.id), true);
  });

  it("default de Stages é vazio quando omitido", () => {
    const created = Pipeline.create(buildCreateInput()).getValue()!;
    const reconstituted = Pipeline.reconstitute(
      {
        organizationId: created.organizationId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      new UniqueEntityId(),
    );
    assert.equal(reconstituted.getStages().length, 0);
  });
});

describe("Pipeline.addStage", () => {
  it("adiciona uma Stage à coleção", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const stage = buildStage();

    const result = pipeline.addStage(stage);
    assert.equal(result.isSuccess, true);
    assert.equal(pipeline.getStages().length, 1);
    assert.equal(pipeline.getStages()[0]!.id.equals(stage.id), true);
  });

  it("adiciona múltiplas Stages, preservando todas", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const first = buildStage("Qualificação");
    const second = buildStage("Proposta");
    const third = buildStage("Fechamento");

    pipeline.addStage(first);
    pipeline.addStage(second);
    pipeline.addStage(third);

    assert.equal(pipeline.getStages().length, 3);
    assert.equal(pipeline.findStage(first.id)?.name, "Qualificação");
    assert.equal(pipeline.findStage(second.id)?.name, "Proposta");
    assert.equal(pipeline.findStage(third.id)?.name, "Fechamento");
  });

  it("rejeita adicionar uma Stage com id já existente na coleção", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const stage = buildStage();
    pipeline.addStage(stage);

    const result = pipeline.addStage(stage);
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
    assert.equal(pipeline.getStages().length, 1);
  });

  it("não dispara nenhum Domain Event — restrição explícita de ENG-0043", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    pipeline.addStage(buildStage());
    assert.equal(pipeline.domainEvents.length, 0);
  });
});

describe("Pipeline.findStage", () => {
  it("localiza uma Stage existente pelo id", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const stage = buildStage();
    pipeline.addStage(stage);

    const found = pipeline.findStage(stage.id);
    assert.notEqual(found, undefined);
    assert.equal(found?.id.equals(stage.id), true);
  });

  it("devolve undefined para uma Stage inexistente", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const found = pipeline.findStage(new UniqueEntityId());
    assert.equal(found, undefined);
  });
});

describe("Pipeline.getStages", () => {
  it("devolve coleção vazia para uma Pipeline recém-criada", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    assert.deepEqual(pipeline.getStages(), []);
  });

  it("devolve uma cópia defensiva — mutar o array retornado não afeta o estado interno", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    pipeline.addStage(buildStage());

    const stages = pipeline.getStages() as Stage[];
    stages.push(buildStage("Etapa Externa"));

    assert.equal(pipeline.getStages().length, 1);
  });

  it("cada chamada devolve uma nova referência de array", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    pipeline.addStage(buildStage());

    assert.notEqual(pipeline.getStages(), pipeline.getStages());
  });
});

describe("Pipeline — estrutura (Aggregate Root / Internal Entity / sem setters)", () => {
  it("Pipeline permanece Aggregate Root — estende AggregateRoot<PipelineProps>", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    assert.equal(pipeline instanceof AggregateRoot, true);
  });

  it("Stage permanece Internal Entity — estende Entity<StageProps>, nunca AggregateRoot", () => {
    const stage = buildStage();
    assert.equal(stage instanceof Entity, true);
    assert.equal(stage instanceof AggregateRoot, false);
  });

  it("nenhum setter público existe em Pipeline — organizationId/createdAt/updatedAt são getters puros", () => {
    for (const prop of ["organizationId", "createdAt", "updatedAt"]) {
      const descriptor = Object.getOwnPropertyDescriptor(Pipeline.prototype, prop);
      assert.notEqual(descriptor, undefined, `getter "${prop}" deveria existir no protótipo`);
      assert.equal(typeof descriptor?.get, "function");
      assert.equal(descriptor?.set, undefined);
    }
  });

  it("nenhum setter público existe em Stage — name é getter puro", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Stage.prototype, "name");
    assert.notEqual(descriptor, undefined);
    assert.equal(typeof descriptor?.get, "function");
    assert.equal(descriptor?.set, undefined);
  });
});
