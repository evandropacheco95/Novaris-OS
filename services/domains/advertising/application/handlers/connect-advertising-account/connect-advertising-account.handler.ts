import { Result, UniqueEntityId, NotFoundError, AuthorizationError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { CreateAuditEntryCommand, type CreateAuditEntryHandler } from "@novaris/audit";
import type { AdvertisingAccount } from "../../../domain/aggregates/advertising-account/advertising-account.js";
import type { AdvertisingAccountRepository } from "../../../domain/repositories/advertising-account-repository.js";
import type { ConnectAdvertisingAccountCommand } from "../../commands/connect-advertising-account/connect-advertising-account.command.js";
import type { GoogleOAuthClient } from "../../../infrastructure/security/google-oauth-client.js";
import { encryptRefreshToken } from "../../../infrastructure/security/token-cipher.js";

/**
 * ConnectAdvertisingAccountHandler — Application Layer, Advertising Domain.
 *
 * Orquestra: `ConnectAdvertisingAccountCommand` → `AdvertisingAccountRepository.findById()`
 * → `GoogleOAuthClient.exchangeAuthorizationCode()` → `encryptRefreshToken()`
 * → `AdvertisingAccount.connect()` → `AdvertisingAccountRepository.save()`.
 * `findById()`/`save()` sempre verificados, mesmo padrão de
 * `UpdateOrganizationProfileHandler` (`ENG-0126`).
 *
 * Mesma integração real com o Audit Domain de `UpdateOrganizationProfileHandler`
 * (`ADR-0035`) — falha ao registrar a auditoria não reverte nem falha esta
 * operação, a conexão já foi persistida com sucesso antes da tentativa.
 */
export class ConnectAdvertisingAccountHandler {
  constructor(
    private readonly advertisingAccountRepository: AdvertisingAccountRepository,
    private readonly googleOAuthClient: GoogleOAuthClient,
    private readonly createAuditEntryHandler: CreateAuditEntryHandler,
  ) {}

  async execute(command: ConnectAdvertisingAccountCommand): Promise<Result<AdvertisingAccount, DomainError | InfrastructureError>> {
    const advertisingAccountId = new UniqueEntityId(command.advertisingAccountId);

    const findResult = await this.advertisingAccountRepository.findById(advertisingAccountId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`AdvertisingAccount "${command.advertisingAccountId}" não encontrada`));
    }

    const advertisingAccount = option.getOrElse(null as never);
    if (!advertisingAccount.organizationId.equals(new UniqueEntityId(command.organizationId))) {
      return Result.fail(new AuthorizationError("AdvertisingAccount não pertence à Organization do usuário autenticado"));
    }

    let refreshToken: string;
    try {
      const exchangeResult = await this.googleOAuthClient.exchangeAuthorizationCode({
        authorizationCode: command.authorizationCode,
        redirectUri: command.redirectUri,
      });
      refreshToken = exchangeResult.refreshToken;
    } catch (error) {
      return Result.fail(new NotFoundError(`Falha ao trocar código OAuth por refresh token: ${(error as Error).message}`));
    }

    const encryptedRefreshToken = encryptRefreshToken(refreshToken);
    const connectResult = advertisingAccount.connect(command.externalAccountId, encryptedRefreshToken);
    if (connectResult.isFailure) {
      return Result.fail(connectResult.getError()!);
    }

    const saveResult = await this.advertisingAccountRepository.save(advertisingAccount);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    await this.createAuditEntryHandler.execute(
      new CreateAuditEntryCommand({
        actorId: command.actorId,
        organizationId: command.organizationId,
        targetId: command.advertisingAccountId,
        targetType: "AdvertisingAccount",
        action: "AdvertisingAccountConnected",
        occurredAt: new Date(),
        origin: "api",
      }),
    );

    return Result.ok(advertisingAccount);
  }
}
