import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { OpportunityRepository } from "../../../domain/repositories/opportunity-repository.js";
import { Opportunity } from "../../../domain/aggregates/opportunity/opportunity.js";
import { InMemoryOpportunityRepository } from "../../../infrastructure/repositories/in-memory-opportunity-repository.js";

/**
 * Suíte de testes do CONTRATO `OpportunityRepository` — Ordem de Missão
 * ENG-0052.
 *
 * **Desvio registrado, não silencioso, do precedente mais próximo**: os dois
 * padrões já existentes no monorepo para testar um contrato de Repository —
 * `organization-repository.contract.test.ts` (Organization, ENG-0003.10,
 * inteiramente em tempo de compilação, Fake proibida explicitamente pela
 * missão) e `user-repository.test.ts`/`role-repository.test.ts`/
 * `repository.test.ts` (Identity/Shared Kernel, ENG-0002.9/ENG-0001.7, via uma
 * classe `InMemory*Repository` **Fake, definida dentro do próprio arquivo de
 * teste**, porque nenhum dos dois pacotes possuía uma implementação real de
 * Infrastructure Layer no momento em que os testes foram escritos) — não se
 * aplicam aqui da mesma forma. `Sales` já possui uma implementação real e
 * funcional de `OpportunityRepository` (`InMemoryOpportunityRepository`,
 * `ENG-0050`, armazenamento em memória, não é um Fake de teste), e a própria
 * Ordem de Missão ENG-0052 instrui explicitamente validar essa infraestrutura
 * já existente ("deve validar a infraestrutura JÁ EXISTENTE"). Por isso esta
 * suíte importa e exercita `InMemoryOpportunityRepository` diretamente — não
 * redefine uma Fake local. Nenhum banco, ORM, Prisma, migration, mock externo,
 * Command, Handler ou Application Layer foi criado (restrição explícita da
 * missão).
 *
 * Nenhuma regra de negócio nova, Entity, Aggregate, Value Object ou Domain
 * Event foi criado por esta suíte — `Opportunity`, `Proposal` e
 * `OpportunityRepository` (interface) permanecem inalterados.
 */

function buildOpportunity(): Opportunity {
  return Opportunity.create({
    organizationId: new UniqueEntityId(),
    partyId: new UniqueEntityId(),
  }).getValue()!;
}

describe("OpportunityRepository — composição de ReadRepository<Opportunity> + WriteRepository<Opportunity>", () => {
  it("InMemoryOpportunityRepository é atribuível a ReadRepository<Opportunity> e WriteRepository<Opportunity> isoladamente", () => {
    const repo: OpportunityRepository = new InMemoryOpportunityRepository();
    const asRead: ReadRepository<Opportunity> = repo;
    const asWrite: WriteRepository<Opportunity> = repo;
    assert.notEqual(asRead, undefined);
    assert.notEqual(asWrite, undefined);
  });
});

describe("OpportunityRepository — save", () => {
  it("save persiste a Opportunity sem lançar exceção e devolve Result de sucesso", async () => {
    const repo = new InMemoryOpportunityRepository();
    const opportunity = buildOpportunity();

    const result = await repo.save(opportunity);
    assert.equal(result.isSuccess, true);
  });
});

describe("OpportunityRepository — findById", () => {
  it("findById devolve Option.none quando a Opportunity não existe", async () => {
    const repo = new InMemoryOpportunityRepository();

    const result = await repo.findById(new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.isNone, true);
  });

  it("findById devolve Option.some com a Opportunity correta após save", async () => {
    const repo = new InMemoryOpportunityRepository();
    const opportunity = buildOpportunity();
    await repo.save(opportunity);

    const result = await repo.findById(opportunity.id);
    const option = result.getValue();
    assert.equal(option?.isSome, true);
    const found = option?.getOrElse(null as never);
    assert.equal(found?.id.equals(opportunity.id), true);
    assert.equal(found?.organizationId.equals(opportunity.organizationId), true);
    assert.equal(found?.partyId.equals(opportunity.partyId), true);
    assert.equal(found?.status, opportunity.status);
  });
});

describe("OpportunityRepository — findAll", () => {
  it("findAll devolve todas as Opportunities salvas", async () => {
    const repo = new InMemoryOpportunityRepository();
    await repo.save(buildOpportunity());
    await repo.save(buildOpportunity());

    const result = await repo.findAll();
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.length, 2);
  });
});

describe("OpportunityRepository — exists", () => {
  it("exists reflete o estado de save/delete", async () => {
    const repo = new InMemoryOpportunityRepository();
    const opportunity = buildOpportunity();

    assert.equal((await repo.exists(opportunity.id)).getValue(), false);
    await repo.save(opportunity);
    assert.equal((await repo.exists(opportunity.id)).getValue(), true);
    await repo.delete(opportunity.id);
    assert.equal((await repo.exists(opportunity.id)).getValue(), false);
  });
});

describe("OpportunityRepository — delete", () => {
  it("delete remove a Opportunity e devolve Result de sucesso", async () => {
    const repo = new InMemoryOpportunityRepository();
    const opportunity = buildOpportunity();
    await repo.save(opportunity);

    const result = await repo.delete(opportunity.id);
    assert.equal(result.isSuccess, true);
    assert.equal((await repo.exists(opportunity.id)).getValue(), false);
  });
});
