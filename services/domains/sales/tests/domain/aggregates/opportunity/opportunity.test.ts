import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, ConflictError, NotFoundError } from "@novaris/shared-kernel";
import { Opportunity } from "../../../../domain/aggregates/opportunity/opportunity.js";
import { OpportunityCreated } from "../../../../domain/events/opportunity-created.js";
import { OpportunityWon } from "../../../../domain/events/opportunity-won.js";
import { OpportunityLost } from "../../../../domain/events/opportunity-lost.js";
import { ProposalApproved } from "../../../../domain/events/proposal-approved.js";

/**
 * Testes unitários do Aggregate Root `Opportunity` — Ordem de Missão
 * ENG-0053. Segue exatamente o padrão já em uso em
 * `services/kernel/organizations/tests/domain/aggregates/organization/organization.test.ts`
 * e `services/kernel/identity/tests/domain/aggregates/user/user.test.ts`
 * (`describe`/`it` por método, `getValue()!`/`getError()`, checagem de
 * `domainEvents` por `instanceof` + `aggregateId`/`eventName`) — nenhum padrão
 * novo introduzido.
 *
 * Objetivo desta missão: **congelar o comportamento atual**, não expandir o
 * domínio. Além dos "Casos mínimos obrigatórios" da Ordem de Missão, esta
 * suíte também cobre as violações de invariante já implementadas
 * (`markWon`/`markLost`/`advanceStage` em estado fechado,
 * `approveProposal`/`addProposal` duplicados ou inexistentes) — não é regra
 * nova, é o comportamento de `ConflictError`/`NotFoundError` já existente em
 * `opportunity.ts`, exigido pelo checklist de `AGGREGATE_IMPLEMENTATION_STANDARD.md § 11`
 * (ENS-0001: "Testes cobrem... cada invariante violada... cada método de
 * mutação"), citado como leitura obrigatória por esta própria missão.
 *
 * Nenhum método, regra, evento, campo ou validação novo foi criado.
 * `opportunity.ts`, `proposal.ts`, `pipeline.ts`, `stage.ts`, os Repositories,
 * Mappers e a Infrastructure Layer não foram alterados.
 */

function buildCreateInput() {
  return {
    organizationId: new UniqueEntityId(),
    partyId: new UniqueEntityId(),
  };
}

describe("Opportunity.create", () => {
  it("cria uma Opportunity válida no status \"open\"", () => {
    const input = buildCreateInput();
    const result = Opportunity.create(input);
    assert.equal(result.isSuccess, true);

    const opportunity = result.getValue()!;
    assert.equal(opportunity.organizationId.equals(input.organizationId), true);
    assert.equal(opportunity.partyId.equals(input.partyId), true);
    assert.equal(opportunity.status, "open");
    assert.equal(opportunity.pipelineId, undefined);
    assert.equal(opportunity.currentStageId, undefined);
    assert.equal(opportunity.getProposals().length, 0);
  });

  it("aceita pipelineId/currentStageId opcionais quando fornecidos", () => {
    const pipelineId = new UniqueEntityId();
    const currentStageId = new UniqueEntityId();
    const opportunity = Opportunity.create({ ...buildCreateInput(), pipelineId, currentStageId }).getValue()!;

    assert.equal(opportunity.pipelineId?.equals(pipelineId), true);
    assert.equal(opportunity.currentStageId?.equals(currentStageId), true);
  });

  it("dispara exatamente um OpportunityCreated com aggregateId igual ao id da Opportunity", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    assert.equal(opportunity.domainEvents.length, 1);
    const event = opportunity.domainEvents[0]!;
    assert.equal(event instanceof OpportunityCreated, true);
    assert.equal(event.aggregateId.equals(opportunity.id), true);
    assert.equal(event.eventName, "OpportunityCreated");
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Opportunity.create(buildCreateInput()));
  });
});

describe("Opportunity.reconstitute", () => {
  it("restaura uma Opportunity sem validar e sem disparar eventos", () => {
    const created = Opportunity.create(buildCreateInput()).getValue()!;
    const id = new UniqueEntityId();

    const reconstituted = Opportunity.reconstitute(
      {
        organizationId: created.organizationId,
        partyId: created.partyId,
        pipelineId: created.pipelineId,
        currentStageId: created.currentStageId,
        status: "won",
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      id,
    );

    assert.equal(reconstituted.id.equals(id), true);
    assert.equal(reconstituted.status, "won");
    assert.equal(reconstituted.organizationId.equals(created.organizationId), true);
    assert.equal(reconstituted.domainEvents.length, 0);
  });

  it("restaura a coleção de proposals fornecida", () => {
    const created = Opportunity.create(buildCreateInput()).getValue()!;
    const proposal = created.submitProposal().getValue()!;
    const id = new UniqueEntityId();

    const reconstituted = Opportunity.reconstitute(
      {
        organizationId: created.organizationId,
        partyId: created.partyId,
        pipelineId: created.pipelineId,
        currentStageId: created.currentStageId,
        status: created.status,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      id,
      [proposal],
    );

    assert.equal(reconstituted.getProposals().length, 1);
    assert.equal(reconstituted.findProposal(proposal.id)?.id.equals(proposal.id), true);
  });

  it("default de proposals é vazio quando omitido", () => {
    const created = Opportunity.create(buildCreateInput()).getValue()!;
    const reconstituted = Opportunity.reconstitute(
      {
        organizationId: created.organizationId,
        partyId: created.partyId,
        status: created.status,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      new UniqueEntityId(),
    );
    assert.equal(reconstituted.getProposals().length, 0);
  });
});

describe("Opportunity.submitProposal", () => {
  it("cria uma Proposal no status \"pending\"", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const result = opportunity.submitProposal();
    assert.equal(result.isSuccess, true);

    const proposal = result.getValue()!;
    assert.equal(proposal.status, "pending");
  });

  it("adiciona a Proposal criada à coleção da Opportunity", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const proposal = opportunity.submitProposal().getValue()!;

    assert.equal(opportunity.getProposals().length, 1);
    assert.equal(opportunity.findProposal(proposal.id)?.id.equals(proposal.id), true);
  });

  it("não dispara nenhum Domain Event novo — só ProposalApproved existe, disparado na aprovação", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    opportunity.submitProposal();
    assert.equal(opportunity.domainEvents.length, 1);
    assert.equal(opportunity.domainEvents[0] instanceof OpportunityCreated, true);
  });

  it("cada chamada cria uma Proposal distinta, sem colidir por id", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const first = opportunity.submitProposal().getValue()!;
    const second = opportunity.submitProposal().getValue()!;

    assert.equal(opportunity.getProposals().length, 2);
    assert.equal(first.id.equals(second.id), false);
  });
});

describe("Opportunity.approveProposal", () => {
  it("aprova uma Proposal existente, transicionando \"pending\" para \"approved\"", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const proposal = opportunity.submitProposal().getValue()!;

    const result = opportunity.approveProposal(proposal.id);
    assert.equal(result.isSuccess, true);
    assert.equal(opportunity.findProposal(proposal.id)?.status, "approved");
  });

  it("dispara ProposalApproved com aggregateId igual ao id da Opportunity", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const proposal = opportunity.submitProposal().getValue()!;

    opportunity.approveProposal(proposal.id);

    const event = opportunity.domainEvents.find((candidate) => candidate instanceof ProposalApproved);
    assert.notEqual(event, undefined);
    assert.equal(event!.aggregateId.equals(opportunity.id), true);
    assert.equal(event!.eventName, "ProposalApproved");
  });

  it("rejeita aprovação de uma Proposal que não pertence à Opportunity", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const result = opportunity.approveProposal(new UniqueEntityId());
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof NotFoundError, true);
  });

  it("rejeita aprovação de uma Proposal já aprovada", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const proposal = opportunity.submitProposal().getValue()!;
    opportunity.approveProposal(proposal.id);

    const result = opportunity.approveProposal(proposal.id);
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
  });
});

describe("Opportunity.advanceStage", () => {
  it("altera currentStageId para o Stage informado", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const stageId = new UniqueEntityId();

    const result = opportunity.advanceStage(stageId);
    assert.equal(result.isSuccess, true);
    assert.equal(opportunity.currentStageId?.equals(stageId), true);
  });

  it("não dispara nenhum Domain Event — nenhuma fonte associa evento a advanceStage", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    opportunity.advanceStage(new UniqueEntityId());
    assert.equal(opportunity.domainEvents.length, 1);
    assert.equal(opportunity.domainEvents[0] instanceof OpportunityCreated, true);
  });

  it("rejeita avanço de etapa de uma Opportunity fechada", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    opportunity.markWon();

    const result = opportunity.advanceStage(new UniqueEntityId());
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
  });
});

describe("Opportunity.markWon", () => {
  it("transiciona \"open\" para \"won\"", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const result = opportunity.markWon();
    assert.equal(result.isSuccess, true);
    assert.equal(opportunity.status, "won");
  });

  it("dispara OpportunityWon com aggregateId igual ao id da Opportunity", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    opportunity.markWon();

    const event = opportunity.domainEvents.find((candidate) => candidate instanceof OpportunityWon);
    assert.notEqual(event, undefined);
    assert.equal(event!.aggregateId.equals(opportunity.id), true);
    assert.equal(event!.eventName, "OpportunityWon");
  });

  it("rejeita marcar como \"won\" uma Opportunity que não está \"open\"", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    opportunity.markWon();

    const result = opportunity.markWon();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
  });

  it("nunca lança exceção", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    opportunity.markWon();
    assert.doesNotThrow(() => opportunity.markWon());
  });
});

describe("Opportunity.markLost", () => {
  it("transiciona \"open\" para \"lost\"", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    const result = opportunity.markLost();
    assert.equal(result.isSuccess, true);
    assert.equal(opportunity.status, "lost");
  });

  it("dispara OpportunityLost com aggregateId igual ao id da Opportunity", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    opportunity.markLost();

    const event = opportunity.domainEvents.find((candidate) => candidate instanceof OpportunityLost);
    assert.notEqual(event, undefined);
    assert.equal(event!.aggregateId.equals(opportunity.id), true);
    assert.equal(event!.eventName, "OpportunityLost");
  });

  it("rejeita marcar como \"lost\" uma Opportunity que não está \"open\"", () => {
    const opportunity = Opportunity.create(buildCreateInput()).getValue()!;
    opportunity.markLost();

    const result = opportunity.markLost();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
  });
});
