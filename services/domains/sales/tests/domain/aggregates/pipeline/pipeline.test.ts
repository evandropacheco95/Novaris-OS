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
 * Objetivo original: **congelar o comportamento** do Aggregate `Pipeline` e
 * da Entity `Stage` que ele possui. `Pipeline` não dispara nenhum Domain
 * Event (nenhuma fonte nomeia `PipelineCreated`) — esta suíte verifica essa
 * ausência, não a inventa.
 *
 * **`name`/`rename()`/`reorderStages()` adicionados por `ADR-0051`** (decisão
 * do CTO: múltiplos Pipelines nomeados + reorder de Stage via
 * drag-and-drop) — cobertos abaixo, únicos comportamentos novos desde então.
 */

function buildCreateInput() {
  return { organizationId: new UniqueEntityId(), name: "Pipeline Padrão" };
}

function buildStage(name = "Qualificação"): Stage {
  return Stage.create({ name, order: 0 }).getValue()!;
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
        name: created.name,
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
        name: created.name,
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
        name: created.name,
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

  it("atribui order sequencialmente (0, 1, 2...) conforme cada Stage é adicionada", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const first = buildStage("Qualificação");
    const second = buildStage("Proposta");

    pipeline.addStage(first);
    pipeline.addStage(second);

    assert.equal(pipeline.findStage(first.id)?.order, 0);
    assert.equal(pipeline.findStage(second.id)?.order, 1);
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

describe("Pipeline.name — adicionado por ADR-0051", () => {
  it("getter name reflete o valor fornecido na criação", () => {
    const pipeline = Pipeline.create({ organizationId: new UniqueEntityId(), name: "Vendas Diretas" }).getValue()!;
    assert.equal(pipeline.name, "Vendas Diretas");
  });

  it("Pipeline.create rejeita name vazio", () => {
    const result = Pipeline.create({ organizationId: new UniqueEntityId(), name: "" });
    assert.equal(result.isFailure, true);
  });
});

describe("Pipeline.rename — adicionado por ADR-0051", () => {
  it("renomeia a Pipeline com sucesso e atualiza updatedAt", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const before = pipeline.updatedAt;

    const result = pipeline.rename("Vendas Parceiros");
    assert.equal(result.isSuccess, true);
    assert.equal(pipeline.name, "Vendas Parceiros");
    assert.equal(pipeline.updatedAt >= before, true);
  });

  it("rejeita rename com name vazio, preservando o name anterior", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const result = pipeline.rename("");
    assert.equal(result.isFailure, true);
    assert.equal(pipeline.name, "Pipeline Padrão");
  });
});

describe("Pipeline.reorderStages — adicionado por ADR-0051", () => {
  it("reatribui order sequencialmente conforme a ordem fornecida", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const first = buildStage("Qualificação");
    const second = buildStage("Proposta");
    const third = buildStage("Fechamento");
    pipeline.addStage(first);
    pipeline.addStage(second);
    pipeline.addStage(third);

    const result = pipeline.reorderStages([third.id, first.id, second.id]);
    assert.equal(result.isSuccess, true);
    assert.equal(pipeline.findStage(third.id)?.order, 0);
    assert.equal(pipeline.findStage(first.id)?.order, 1);
    assert.equal(pipeline.findStage(second.id)?.order, 2);
  });

  it("rejeita lista com quantidade diferente de Stages existentes", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const stage = buildStage();
    pipeline.addStage(stage);

    const result = pipeline.reorderStages([stage.id, new UniqueEntityId()]);
    assert.equal(result.isFailure, true);
  });

  it("rejeita lista com um id que não pertence a esta Pipeline", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const stage = buildStage();
    pipeline.addStage(stage);

    const result = pipeline.reorderStages([new UniqueEntityId()]);
    assert.equal(result.isFailure, true);
  });

  it("rejeita lista com id duplicado", () => {
    const pipeline = Pipeline.create(buildCreateInput()).getValue()!;
    const first = buildStage("Qualificação");
    const second = buildStage("Proposta");
    pipeline.addStage(first);
    pipeline.addStage(second);

    const result = pipeline.reorderStages([first.id, first.id]);
    assert.equal(result.isFailure, true);
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
