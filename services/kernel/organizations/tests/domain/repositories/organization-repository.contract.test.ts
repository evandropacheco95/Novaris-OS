import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type {
  ReadRepository,
  WriteRepository,
  AggregateRoot,
  Result,
  Option,
  InfrastructureError,
  UniqueEntityId,
} from "@novaris/shared-kernel";
import type { OrganizationRepository } from "../../../src/domain/repositories/organization-repository.js";
import type { Organization } from "../../../src/domain/aggregates/organization/organization.js";

/**
 * Suíte de testes do CONTRATO `OrganizationRepository` — não de uma
 * implementação. `OrganizationRepository` é uma `interface` TypeScript, sem
 * nenhuma representação em runtime; a Ordem de Missão ENG-0003.10 proíbe
 * explicitamente criar Fake/Mock/banco em memória para testá-la (diferente
 * do precedente usado em `user-repository.test.ts`/`role-repository.test.ts`
 * do Identity Domain, ENG-0002.9, e em `repository.test.ts` do Shared Kernel,
 * ENG-0001.7 — ambos usam um `InMemory*Repository`). Por isso toda checagem
 * real aqui acontece em tempo de compilação (tipos condicionais avaliados
 * por `tsc`, primeiro passo do script `test`) — cada `it()` só existe para
 * relatar, de forma legível, que uma checagem de tipo específica foi
 * satisfeita; a asserção em runtime é sempre sobre um literal (`true`),
 * nunca sobre uma instância, Fake ou Mock.
 */

/** `true` se `T` e `Expected` forem exatamente o mesmo conjunto de chaves, `never` caso contrário. */
type AssertExactKeys<T, Expected> = [T] extends [Expected] ? ([Expected] extends [T] ? true : never) : never;

/** `true` se `T` for estruturalmente atribuível a `Expected`, `never` caso contrário. */
type AssertAssignable<T, Expected> = T extends Expected ? true : never;

type ExpectedMethodNames = "findById" | "findAll" | "exists" | "save" | "delete";

describe("OrganizationRepository — existência e importabilidade do contrato", () => {
  it("é importável como tipo do domínio (provado pela própria compilação deste arquivo)", () => {
    assert.equal(true, true);
  });
});

describe("OrganizationRepository — composição entre ReadRepository e WriteRepository", () => {
  it("é estruturalmente atribuível a ReadRepository<Organization>", () => {
    const check: AssertAssignable<OrganizationRepository, ReadRepository<Organization>> = true;
    assert.equal(check, true);
  });

  it("é estruturalmente atribuível a WriteRepository<Organization>", () => {
    const check: AssertAssignable<OrganizationRepository, WriteRepository<Organization>> = true;
    assert.equal(check, true);
  });
});

describe("OrganizationRepository — tipagem correta para Organization", () => {
  it("findById é tipado para UniqueEntityId → Result<Option<Organization>, InfrastructureError>", () => {
    const check: AssertAssignable<
      OrganizationRepository["findById"],
      (id: UniqueEntityId) => Promise<Result<Option<Organization>, InfrastructureError>>
    > = true;
    assert.equal(check, true);
  });

  it("findAll é tipado para Result<Organization[], InfrastructureError>", () => {
    const check: AssertAssignable<
      OrganizationRepository["findAll"],
      () => Promise<Result<Organization[], InfrastructureError>>
    > = true;
    assert.equal(check, true);
  });

  it("exists é tipado para UniqueEntityId → Result<boolean, InfrastructureError>", () => {
    const check: AssertAssignable<
      OrganizationRepository["exists"],
      (id: UniqueEntityId) => Promise<Result<boolean, InfrastructureError>>
    > = true;
    assert.equal(check, true);
  });

  it("save é tipado para receber uma Organization", () => {
    const check: AssertAssignable<
      OrganizationRepository["save"],
      (entity: Organization) => Promise<Result<void, InfrastructureError>>
    > = true;
    assert.equal(check, true);
  });

  it("delete é tipado para UniqueEntityId → Result<void, InfrastructureError>", () => {
    const check: AssertAssignable<
      OrganizationRepository["delete"],
      (id: UniqueEntityId) => Promise<Result<void, InfrastructureError>>
    > = true;
    assert.equal(check, true);
  });
});

describe("OrganizationRepository — compatibilidade com AggregateRoot", () => {
  it("Organization satisfaz a restrição AggregateRoot<unknown> exigida por Repository<T>", () => {
    const check: AssertAssignable<Organization, AggregateRoot<unknown>> = true;
    assert.equal(check, true);
  });
});

describe("OrganizationRepository — ausência de métodos específicos de negócio", () => {
  it("expõe exatamente findById/findAll/exists/save/delete, nenhum método a mais", () => {
    const check: AssertExactKeys<keyof OrganizationRepository, ExpectedMethodNames> = true;
    assert.equal(check, true);
  });
});

describe("OrganizationRepository — conformidade com o padrão do Identity Domain", () => {
  it("tem exatamente a mesma forma de UserRepository/RoleRepository — ReadRepository + WriteRepository, zero métodos próprios", () => {
    // UserRepository/RoleRepository (services/kernel/identity, ENG-0002.9) têm
    // exatamente esta forma: `extends ReadRepository<T>, WriteRepository<T> {}`,
    // sem nenhum método próprio. Não importado diretamente de @novaris/identity
    // — não é dependência deste pacote, fora do escopo desta missão alterar
    // package.json. A conformidade é verificada contra a mesma base do Shared
    // Kernel que os três contratos compartilham sem nenhuma adição.
    const check: AssertExactKeys<
      keyof OrganizationRepository,
      keyof ReadRepository<Organization> | keyof WriteRepository<Organization>
    > = true;
    assert.equal(check, true);
  });
});
