import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, ValidationError, AggregateRoot, Entity } from "@novaris/shared-kernel";
import { Stage } from "../../../../domain/entities/stage/stage.js";

/**
 * Testes unitários da Internal Entity `Stage` — Ordem de Missão ENG-0056.
 * Encerra a cobertura unitária isolada do Domain Layer de `Sales` (após
 * `opportunity.test.ts`/`ENG-0053`, `pipeline.test.ts`/`ENG-0054`,
 * `proposal.test.ts`/`ENG-0055`). Segue exatamente o mesmo padrão —
 * `describe`/`it` por método, `getValue()!`/`getError()` — nenhum padrão novo
 * introduzido.
 *
 * Objetivo original desta missão: **congelar o comportamento atual** de
 * `Stage` — não expandir o domínio. `Stage` estende `Entity<T>`, não
 * `AggregateRoot<T>` (`stage.ts`) — não possui `domainEvents` nem
 * `addDomainEvent`. Diferente de `Proposal`, `Stage` **não implementa
 * `Timestamped`** — sem `createdAt`/`updatedAt` — esta suíte não testa esses
 * campos, por não existirem. `create()` já valida que `name` não é vazio —
 * comportamento existente, testado como tal, não uma regra nova.
 *
 * **`order`/`rename()`/`setOrder()` adicionados por `ADR-0051`** (decisão do
 * CTO: reorder de Stage via drag-and-drop) — cobertos abaixo, únicos
 * comportamentos novos desta suíte desde então.
 */

describe("Stage.create", () => {
  it("cria uma Stage válida com o name fornecido", () => {
    const result = Stage.create({ name: "Qualificação", order: 0 });
    assert.equal(result.isSuccess, true);

    const stage = result.getValue()!;
    assert.equal(stage.name, "Qualificação");
  });

  it("rejeita name vazio — comportamento existente, não regra nova", () => {
    const result = Stage.create({ name: "", order: 0 });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita name composto só de espaços", () => {
    const result = Stage.create({ name: "   ", order: 0 });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Stage.create({ name: "", order: 0 }));
  });
});

describe("Stage.reconstitute", () => {
  it("restaura uma Stage preservando o id fornecido", () => {
    const id = new UniqueEntityId();
    const reconstituted = Stage.reconstitute({ name: "Proposta", order: 0 }, id);
    assert.equal(reconstituted.id.equals(id), true);
  });

  it("restaura uma Stage preservando o estado (name) fornecido, sem validar", () => {
    const reconstituted = Stage.reconstitute({ name: "", order: 0 }, new UniqueEntityId());
    assert.equal(reconstituted.name, "");
  });

  it("não possui domainEvents — Entity<T> não implementa coleção de eventos", () => {
    const reconstituted = Stage.reconstitute({ name: "Fechamento", order: 0 }, new UniqueEntityId());
    assert.equal((reconstituted as unknown as { domainEvents?: unknown }).domainEvents, undefined);
  });
});

describe("Stage.name", () => {
  it("getter name reflete exatamente o valor fornecido na criação", () => {
    const stage = Stage.create({ name: "Negociação", order: 0 }).getValue()!;
    assert.equal(stage.name, "Negociação");
  });

  it("getter name reflete exatamente o valor fornecido na reconstituição", () => {
    const stage = Stage.reconstitute({ name: "Fechamento", order: 0 }, new UniqueEntityId());
    assert.equal(stage.name, "Fechamento");
  });
});

describe("Stage — estrutura (Entity, não AggregateRoot, sem eventos, sem setters)", () => {
  it("Stage continua sendo Entity — estende Entity<StageProps>", () => {
    const stage = Stage.create({ name: "Qualificação", order: 0 }).getValue()!;
    assert.equal(stage instanceof Entity, true);
  });

  it("Stage NÃO é AggregateRoot", () => {
    const stage = Stage.create({ name: "Qualificação", order: 0 }).getValue()!;
    assert.equal(stage instanceof AggregateRoot, false);
  });

  it("Stage não publica Domain Events — sem domainEvents/addDomainEvent", () => {
    const stage = Stage.create({ name: "Qualificação", order: 0 }).getValue()!;
    const asAny = stage as unknown as { domainEvents?: unknown; addDomainEvent?: unknown };
    assert.equal(asAny.domainEvents, undefined);
    assert.equal(asAny.addDomainEvent, undefined);
  });

  it("nenhum setter público existe — name é getter puro", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Stage.prototype, "name");
    assert.notEqual(descriptor, undefined);
    assert.equal(typeof descriptor?.get, "function");
    assert.equal(descriptor?.set, undefined);
  });

  it("integridade do getter — não muda entre chamadas sucessivas", () => {
    const stage = Stage.create({ name: "Qualificação", order: 0 }).getValue()!;
    assert.equal(stage.name, stage.name);
  });

  it("encapsulamento do estado — não há forma pública de mutar name diretamente (só via rename())", () => {
    const stage = Stage.create({ name: "Qualificação", order: 0 }).getValue()!;
    assert.equal(Object.keys(stage).includes("name"), false);
    assert.equal((stage as unknown as Record<string, unknown>)["setName"], undefined);
  });
});

describe("Stage.order — adicionado por ADR-0051", () => {
  it("getter order reflete o valor fornecido na criação", () => {
    const stage = Stage.create({ name: "Qualificação", order: 2 }).getValue()!;
    assert.equal(stage.order, 2);
  });

  it("getter order reflete o valor fornecido na reconstituição", () => {
    const stage = Stage.reconstitute({ name: "Fechamento", order: 5 }, new UniqueEntityId());
    assert.equal(stage.order, 5);
  });

  it("setOrder reatribui a ordem — usado exclusivamente por Pipeline", () => {
    const stage = Stage.create({ name: "Qualificação", order: 0 }).getValue()!;
    stage.setOrder(3);
    assert.equal(stage.order, 3);
  });
});

describe("Stage.rename — adicionado por ADR-0051", () => {
  it("renomeia a Stage com sucesso", () => {
    const stage = Stage.create({ name: "Qualificação", order: 0 }).getValue()!;
    const result = stage.rename("Negociação");
    assert.equal(result.isSuccess, true);
    assert.equal(stage.name, "Negociação");
  });

  it("rejeita rename com name vazio, preservando o name anterior", () => {
    const stage = Stage.create({ name: "Qualificação", order: 0 }).getValue()!;
    const result = stage.rename("");
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
    assert.equal(stage.name, "Qualificação");
  });
});
