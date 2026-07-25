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
 * Objetivo desta missão: **congelar o comportamento atual** de `Stage` — não
 * expandir o domínio. `Stage` estende `Entity<T>`, não `AggregateRoot<T>`
 * (`stage.ts`, linha 53) — não possui `domainEvents` nem `addDomainEvent`.
 * Diferente de `Proposal`, `Stage` **não implementa `Timestamped`** — sem
 * `createdAt`/`updatedAt` (`stage.ts`, comentário "Estado deliberadamente
 * mínimo", linhas 36-40) — esta suíte não testa esses campos, por não
 * existirem. `Stage` não tem nenhum método de mutação além de
 * `create()`/`reconstitute()` (`stage.ts`, linhas 79-84) — nenhum teste de
 * transição de estado é possível ou inventado aqui. `create()` já valida que
 * `name` não é vazio (`stage.ts`, linhas 66-69) — comportamento existente,
 * testado como tal, não uma regra nova.
 *
 * Nenhum método, regra, evento, estado ou Value Object novo foi criado.
 * `opportunity.ts`, `pipeline.ts`, `proposal.ts`, Repositories, Mappers,
 * Infrastructure e Contracts não foram alterados.
 */

describe("Stage.create", () => {
  it("cria uma Stage válida com o name fornecido", () => {
    const result = Stage.create({ name: "Qualificação" });
    assert.equal(result.isSuccess, true);

    const stage = result.getValue()!;
    assert.equal(stage.name, "Qualificação");
  });

  it("rejeita name vazio — comportamento existente, não regra nova", () => {
    const result = Stage.create({ name: "" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita name composto só de espaços", () => {
    const result = Stage.create({ name: "   " });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Stage.create({ name: "" }));
  });
});

describe("Stage.reconstitute", () => {
  it("restaura uma Stage preservando o id fornecido", () => {
    const id = new UniqueEntityId();
    const reconstituted = Stage.reconstitute({ name: "Proposta" }, id);
    assert.equal(reconstituted.id.equals(id), true);
  });

  it("restaura uma Stage preservando o estado (name) fornecido, sem validar", () => {
    const reconstituted = Stage.reconstitute({ name: "" }, new UniqueEntityId());
    assert.equal(reconstituted.name, "");
  });

  it("não possui domainEvents — Entity<T> não implementa coleção de eventos", () => {
    const reconstituted = Stage.reconstitute({ name: "Fechamento" }, new UniqueEntityId());
    assert.equal((reconstituted as unknown as { domainEvents?: unknown }).domainEvents, undefined);
  });
});

describe("Stage.name", () => {
  it("getter name reflete exatamente o valor fornecido na criação", () => {
    const stage = Stage.create({ name: "Negociação" }).getValue()!;
    assert.equal(stage.name, "Negociação");
  });

  it("getter name reflete exatamente o valor fornecido na reconstituição", () => {
    const stage = Stage.reconstitute({ name: "Fechamento" }, new UniqueEntityId());
    assert.equal(stage.name, "Fechamento");
  });
});

describe("Stage — estrutura (Entity, não AggregateRoot, sem eventos, sem setters)", () => {
  it("Stage continua sendo Entity — estende Entity<StageProps>", () => {
    const stage = Stage.create({ name: "Qualificação" }).getValue()!;
    assert.equal(stage instanceof Entity, true);
  });

  it("Stage NÃO é AggregateRoot", () => {
    const stage = Stage.create({ name: "Qualificação" }).getValue()!;
    assert.equal(stage instanceof AggregateRoot, false);
  });

  it("Stage não publica Domain Events — sem domainEvents/addDomainEvent", () => {
    const stage = Stage.create({ name: "Qualificação" }).getValue()!;
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
    const stage = Stage.create({ name: "Qualificação" }).getValue()!;
    assert.equal(stage.name, stage.name);
  });

  it("encapsulamento do estado — não há forma pública de mutar name", () => {
    const stage = Stage.create({ name: "Qualificação" }).getValue()!;
    assert.equal(Object.keys(stage).includes("name"), false);
    assert.equal((stage as unknown as Record<string, unknown>)["setName"], undefined);
  });
});
