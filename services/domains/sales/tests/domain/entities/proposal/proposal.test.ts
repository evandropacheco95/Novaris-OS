import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, ConflictError, AggregateRoot, Entity } from "@novaris/shared-kernel";
import { Proposal } from "../../../../domain/entities/proposal/proposal.js";

/**
 * Testes unitários da Internal Entity `Proposal` — Ordem de Missão ENG-0055.
 * Segue exatamente o mesmo padrão já em uso em `opportunity.test.ts`
 * (`ENG-0053`), `pipeline.test.ts` (`ENG-0054`) e nos precedentes de Kernel
 * (`organization.test.ts`, `user.test.ts`): `describe`/`it` por método,
 * `getValue()!`/`getError()`. Nenhum padrão novo introduzido.
 *
 * Objetivo desta missão: **congelar o comportamento atual** de `Proposal` —
 * não expandir o domínio. `Proposal` estende `Entity<T>`, não
 * `AggregateRoot<T>` (`proposal.ts`, linha 62) — não possui `domainEvents`
 * nem `addDomainEvent`; esta suíte confirma essa ausência estrutural, não a
 * inventa. `approve()` já rejeita uma segunda aprovação com `ConflictError`
 * (`proposal.ts` linhas 98-101) — comportamento existente, testado como tal,
 * não uma regra nova.
 *
 * Nenhum método, regra, evento, estado ou Value Object novo foi criado.
 * `opportunity.ts`, `pipeline.ts`, `stage.ts`, Repositories, Mappers,
 * Infrastructure e Contracts não foram alterados.
 */

describe("Proposal.create", () => {
  it("cria uma Proposal válida no estado inicial \"pending\"", () => {
    const result = Proposal.create();
    assert.equal(result.isSuccess, true);

    const proposal = result.getValue()!;
    assert.equal(proposal.status, "pending");
  });

  it("preenche createdAt/updatedAt com o mesmo instante na criação", () => {
    const proposal = Proposal.create().getValue()!;
    assert.equal(proposal.createdAt.getTime(), proposal.updatedAt.getTime());
  });

  it("aceita ser chamado sem argumento — CreateProposalInput é Record<string, never>", () => {
    assert.doesNotThrow(() => Proposal.create());
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Proposal.create({}));
  });
});

describe("Proposal.reconstitute", () => {
  it("restaura uma Proposal sem validar, preservando o id e o status fornecidos", () => {
    const created = Proposal.create().getValue()!;
    const id = new UniqueEntityId();

    const reconstituted = Proposal.reconstitute(
      {
        status: "approved",
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      id,
    );

    assert.equal(reconstituted.id.equals(id), true);
    assert.equal(reconstituted.status, "approved");
    assert.equal(reconstituted.createdAt.getTime(), created.createdAt.getTime());
  });

  it("não possui domainEvents — Entity<T> não implementa coleção de eventos", () => {
    const reconstituted = Proposal.reconstitute(
      { status: "pending", createdAt: new Date(), updatedAt: new Date() },
      new UniqueEntityId(),
    );
    assert.equal((reconstituted as unknown as { domainEvents?: unknown }).domainEvents, undefined);
  });
});

describe("Proposal.approve", () => {
  it("transiciona \"pending\" para \"approved\"", () => {
    const proposal = Proposal.create().getValue()!;
    const result = proposal.approve();
    assert.equal(result.isSuccess, true);
    assert.equal(proposal.status, "approved");
  });

  it("atualiza updatedAt em caso de sucesso", () => {
    const proposal = Proposal.create().getValue()!;
    const firstUpdatedAt = proposal.updatedAt;
    proposal.approve();
    assert.equal(proposal.updatedAt.getTime() >= firstUpdatedAt.getTime(), true);
  });

  it("rejeita aprovar uma Proposal já aprovada — comportamento atual, não regra nova", () => {
    const proposal = Proposal.create().getValue()!;
    proposal.approve();

    const result = proposal.approve();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
    assert.equal(proposal.status, "approved");
  });

  it("nunca lança exceção", () => {
    const proposal = Proposal.create().getValue()!;
    proposal.approve();
    assert.doesNotThrow(() => proposal.approve());
  });
});

describe("Proposal — estrutura (Entity, não AggregateRoot, sem eventos, sem setters)", () => {
  it("Proposal continua sendo Entity — estende Entity<ProposalProps>", () => {
    const proposal = Proposal.create().getValue()!;
    assert.equal(proposal instanceof Entity, true);
  });

  it("Proposal NÃO é AggregateRoot", () => {
    const proposal = Proposal.create().getValue()!;
    assert.equal(proposal instanceof AggregateRoot, false);
  });

  it("Proposal não publica Domain Events — sem domainEvents/addDomainEvent, mesmo após approve()", () => {
    const proposal = Proposal.create().getValue()!;
    proposal.approve();
    const asAny = proposal as unknown as { domainEvents?: unknown; addDomainEvent?: unknown };
    assert.equal(asAny.domainEvents, undefined);
    assert.equal(asAny.addDomainEvent, undefined);
  });

  it("nenhum setter público existe — status/createdAt/updatedAt são getters puros", () => {
    for (const prop of ["status", "createdAt", "updatedAt"]) {
      const descriptor = Object.getOwnPropertyDescriptor(Proposal.prototype, prop);
      assert.notEqual(descriptor, undefined, `getter "${prop}" deveria existir no protótipo`);
      assert.equal(typeof descriptor?.get, "function");
      assert.equal(descriptor?.set, undefined);
    }
  });

  it("integridade dos getters — refletem exatamente o estado interno após approve()", () => {
    const proposal = Proposal.create().getValue()!;
    proposal.approve();
    assert.equal(proposal.status, "approved");
    assert.equal(proposal.updatedAt instanceof Date, true);
  });

  it("encapsulamento do estado — não há forma pública de mutar status sem approve()", () => {
    const proposal = Proposal.create().getValue()!;
    assert.equal(Object.keys(proposal).includes("status"), false);
    assert.equal((proposal as unknown as Record<string, unknown>)["setStatus"], undefined);
  });
});
