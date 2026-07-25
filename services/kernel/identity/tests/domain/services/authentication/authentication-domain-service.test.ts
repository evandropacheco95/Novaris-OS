import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option, AuthenticationError, InfrastructureError } from "@novaris/shared-kernel";
import type { InfrastructureError as InfrastructureErrorType, Result as ResultType } from "@novaris/shared-kernel";
import { AuthenticationDomainService } from "../../../../src/domain/services/authentication/authentication-domain-service.js";
import type { PasswordVerifier } from "../../../../src/domain/services/authentication/password-verifier.js";
import type { UserRepository } from "../../../../src/domain/repositories/user-repository.js";
import { User } from "../../../../src/domain/aggregates/user/user.js";
import { Email } from "../../../../src/domain/value-objects/email.js";

/**
 * Fakes em memória — existem apenas para testar este Domain Service. Não são
 * entregáveis de produção (nenhuma Infrastructure real), mesmo padrão já
 * usado em user-repository.test.ts/role-repository.test.ts (ENG-0002.9).
 */
class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();
  failNextFindAll = false;

  seed(user: User): void {
    this.store.set(user.id.toValue(), user);
  }

  async findById(id: UniqueEntityId): Promise<ResultType<Option<User>, InfrastructureErrorType>> {
    const found = this.store.get(id.toValue());
    return Result.ok(found ? Option.some(found) : Option.none<User>());
  }

  async findAll(): Promise<ResultType<User[], InfrastructureErrorType>> {
    if (this.failNextFindAll) {
      return Result.fail(new InfrastructureError("falha ao consultar usuários"));
    }
    return Result.ok(Array.from(this.store.values()));
  }

  async exists(id: UniqueEntityId): Promise<ResultType<boolean, InfrastructureErrorType>> {
    return Result.ok(this.store.has(id.toValue()));
  }

  async save(entity: User): Promise<ResultType<void, InfrastructureErrorType>> {
    this.store.set(entity.id.toValue(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<ResultType<void, InfrastructureErrorType>> {
    this.store.delete(id.toValue());
    return Result.ok(undefined);
  }
}

class FakePasswordVerifier implements PasswordVerifier {
  constructor(private readonly outcome: "valid" | "invalid" | "infrastructure-failure") {}

  async verify(): Promise<ResultType<boolean, InfrastructureErrorType>> {
    if (this.outcome === "infrastructure-failure") {
      return Result.fail(new InfrastructureError("serviço de verificação de senha indisponível"));
    }
    return Result.ok(this.outcome === "valid");
  }
}

function buildActiveUser(email: string): User {
  const user = User.create({
    organizationId: new UniqueEntityId(),
    email: Email.create(email).getValue()!,
    createdBy: new UniqueEntityId(),
  }).getValue()!;
  user.activate(new UniqueEntityId());
  return user;
}

const CREDENTIALS_EMAIL = Email.create("user@novaris.dev").getValue()!;

describe("AuthenticationDomainService — fluxo válido", () => {
  it("autentica com sucesso quando usuário existe, está ativo e a senha confere", async () => {
    const repository = new InMemoryUserRepository();
    const user = buildActiveUser("user@novaris.dev");
    repository.seed(user);
    const service = new AuthenticationDomainService(repository, new FakePasswordVerifier("valid"));

    const result = await service.execute({ email: CREDENTIALS_EMAIL, password: "correct-horse" });

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.id.equals(user.id), true);
  });
});

describe("AuthenticationDomainService — usuário inexistente", () => {
  it("devolve AuthenticationError quando nenhum usuário tem esse email", async () => {
    const repository = new InMemoryUserRepository();
    const service = new AuthenticationDomainService(repository, new FakePasswordVerifier("valid"));

    const result = await service.execute({ email: CREDENTIALS_EMAIL, password: "anything" });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof AuthenticationError, true);
  });
});

describe("AuthenticationDomainService — usuário desativado", () => {
  it("devolve AuthenticationError quando o usuário existe mas não está ativo", async () => {
    const repository = new InMemoryUserRepository();
    const user = User.create({
      organizationId: new UniqueEntityId(),
      email: CREDENTIALS_EMAIL,
      createdBy: new UniqueEntityId(),
    }).getValue()!;
    repository.seed(user);
    const service = new AuthenticationDomainService(repository, new FakePasswordVerifier("valid"));

    const result = await service.execute({ email: CREDENTIALS_EMAIL, password: "anything" });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof AuthenticationError, true);
  });
});

describe("AuthenticationDomainService — credencial inválida", () => {
  it("devolve AuthenticationError quando o PasswordVerifier rejeita a senha", async () => {
    const repository = new InMemoryUserRepository();
    const user = buildActiveUser("user@novaris.dev");
    repository.seed(user);
    const service = new AuthenticationDomainService(repository, new FakePasswordVerifier("invalid"));

    const result = await service.execute({ email: CREDENTIALS_EMAIL, password: "wrong-password" });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof AuthenticationError, true);
  });
});

describe("AuthenticationDomainService — falhas de dependência", () => {
  it("propaga InfrastructureError quando o PasswordVerifier falha", async () => {
    const repository = new InMemoryUserRepository();
    const user = buildActiveUser("user@novaris.dev");
    repository.seed(user);
    const service = new AuthenticationDomainService(repository, new FakePasswordVerifier("infrastructure-failure"));

    const result = await service.execute({ email: CREDENTIALS_EMAIL, password: "anything" });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof InfrastructureError, true);
  });

  it("propaga InfrastructureError quando o UserRepository falha", async () => {
    const repository = new InMemoryUserRepository();
    repository.failNextFindAll = true;
    const service = new AuthenticationDomainService(repository, new FakePasswordVerifier("valid"));

    const result = await service.execute({ email: CREDENTIALS_EMAIL, password: "anything" });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof InfrastructureError, true);
  });
});

describe("AuthenticationDomainService — nenhum vazamento de detalhes técnicos", () => {
  it("usuário inexistente, usuário desativado e senha incorreta produzem a mesma mensagem", async () => {
    const notFoundRepository = new InMemoryUserRepository();
    const notFoundResult = await new AuthenticationDomainService(
      notFoundRepository,
      new FakePasswordVerifier("valid"),
    ).execute({ email: CREDENTIALS_EMAIL, password: "x" });

    const inactiveRepository = new InMemoryUserRepository();
    inactiveRepository.seed(
      User.create({
        organizationId: new UniqueEntityId(),
        email: CREDENTIALS_EMAIL,
        createdBy: new UniqueEntityId(),
      }).getValue()!,
    );
    const inactiveResult = await new AuthenticationDomainService(
      inactiveRepository,
      new FakePasswordVerifier("valid"),
    ).execute({ email: CREDENTIALS_EMAIL, password: "x" });

    const wrongPasswordRepository = new InMemoryUserRepository();
    wrongPasswordRepository.seed(buildActiveUser("user@novaris.dev"));
    const wrongPasswordResult = await new AuthenticationDomainService(
      wrongPasswordRepository,
      new FakePasswordVerifier("invalid"),
    ).execute({ email: CREDENTIALS_EMAIL, password: "x" });

    const messages = [notFoundResult, inactiveResult, wrongPasswordResult].map(
      (result) => result.getError()?.message,
    );
    assert.equal(messages[0], messages[1]);
    assert.equal(messages[1], messages[2]);
  });

  it("o erro de domínio não carrega details/metadata distinguindo a causa", async () => {
    const repository = new InMemoryUserRepository();
    const result = await new AuthenticationDomainService(repository, new FakePasswordVerifier("valid")).execute({
      email: CREDENTIALS_EMAIL,
      password: "x",
    });
    const error = result.getError() as AuthenticationError;
    assert.equal(error.details, undefined);
  });

  it("nunca lança exceção", async () => {
    const repository = new InMemoryUserRepository();
    await assert.doesNotReject(() =>
      new AuthenticationDomainService(repository, new FakePasswordVerifier("valid")).execute({
        email: CREDENTIALS_EMAIL,
        password: "x",
      }),
    );
  });
});
