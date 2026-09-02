import { AggregateRoot, Result, ValidationError, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { AdvertisingAccountConnected } from "../../events/advertising-account-connected.js";
import { AdvertisingAccountSyncCompleted } from "../../events/advertising-account-sync-completed.js";
import { AdvertisingAccountSyncFailed } from "../../events/advertising-account-sync-failed.js";

/**
 * Único provider suportado hoje (`ADR-0058`) — Meta Ads é escopo futuro,
 * não implementado. Lista fechada, mesmo critério de `OrganizationStatus`.
 */
export type AdvertisingProvider = "google_ads";

const VALID_PROVIDERS: readonly AdvertisingProvider[] = ["google_ads"];

/**
 * Subconjunto dos estados de sistema de `specifications/performance-intelligence/screens.md`
 * aplicável a nível de conta. `create()` sempre parte de `NOT_CONNECTED` — as
 * demais transições pertencem à Fase 02 (conexão OAuth real), não implementadas
 * neste Aggregate (`objects/AdvertisingAccount.md § 6-7`).
 */
export type AdvertisingAccountConnectionStatus = "NOT_CONNECTED" | "CONNECTED" | "SYNC_REQUIRED" | "SYNCING" | "SYNC_FAILED";

const VALID_CONNECTION_STATUSES: readonly AdvertisingAccountConnectionStatus[] = [
  "NOT_CONNECTED",
  "CONNECTED",
  "SYNC_REQUIRED",
  "SYNCING",
  "SYNC_FAILED",
];

/**
 * Estado interno — campos definidos em
 * [objects/AdvertisingAccount.md §§ 5-6](../../../../../knowledge/core/objects/AdvertisingAccount.md).
 */
export interface AdvertisingAccountProps {
  organizationId: UniqueEntityId;
  provider: AdvertisingProvider;
  externalAccountId?: string;
  name: string;
  connectionStatus: AdvertisingAccountConnectionStatus;
  connectedAt?: Date;
  lastSyncAt?: Date;
  /**
   * Refresh token OAuth cifrado em repouso (`AES-256-GCM`,
   * `infrastructure/security/token-cipher.ts`) — nunca o token em claro.
   * Só existe a partir de `connect()`. `ADR-0060`.
   */
  encryptedRefreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdvertisingAccountInput {
  organizationId: UniqueEntityId;
  provider: AdvertisingProvider;
  name: string;
}

/**
 * Aggregate Root do Advertising Domain (`ADR-0059`, 11º Business Domain
 * ativo) — Object Specification em
 * [objects/AdvertisingAccount.md](../../../../../knowledge/core/objects/AdvertisingAccount.md).
 * Segue [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md)
 * (ENS-0001), mesma disciplina de `Organization`/`Campaign`.
 *
 * **`create()` sempre inicia em `NOT_CONNECTED`** — nunca aceita
 * `externalAccountId`/`connectedAt`/`lastSyncAt`/`encryptedRefreshToken` como
 * input (`objects/AdvertisingAccount.md § 10`, regra 04). Preencher esses
 * campos é responsabilidade das transições de estado abaixo (Fase 02,
 * `ADR-0060`), nunca de `create()` — mesmo critério de `Opportunity.create()`
 * vs. `Opportunity.markWon()`.
 *
 * **Transições de estado** (`connect`/`requestSync`/`startSync`/`completeSync`/`failSync`)
 * seguem `objects/AdvertisingAccount.md § 6-7`: cada uma valida o estado
 * atual e retorna `ConflictError` se a transição for inválida, mesmo padrão
 * de `Opportunity.markWon()`/`markLost()`. 3 Domain Events
 * (`AdvertisingAccountConnected`, `AdvertisingAccountSyncCompleted`,
 * `AdvertisingAccountSyncFailed`) — `requestSync()`/`startSync()` não
 * disparam evento porque nenhuma fonte confirma um consumidor para
 * transições intermediárias (`objects/AdvertisingAccount.md § 9`), mesmo
 * critério de `Opportunity.advanceStage()`.
 */
export class AdvertisingAccount extends AggregateRoot<AdvertisingAccountProps> implements Timestamped {
  private constructor(props: AdvertisingAccountProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateAdvertisingAccountInput): Result<AdvertisingAccount, DomainError> {
    if (!VALID_PROVIDERS.includes(input.provider)) {
      return Result.fail(new ValidationError(`"provider" inválido: "${input.provider}" — valores aceitos: ${VALID_PROVIDERS.join(", ")}`));
    }
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }

    const now = new Date();
    const props: AdvertisingAccountProps = {
      organizationId: input.organizationId,
      provider: input.provider,
      name: input.name,
      connectionStatus: "NOT_CONNECTED",
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new AdvertisingAccount(props));
  }

  /** Usado exclusivamente por uma implementação de `AdvertisingAccountRepository` (ENS-0001 § 8). */
  static reconstitute(props: AdvertisingAccountProps, id: UniqueEntityId): AdvertisingAccount {
    return new AdvertisingAccount(props, id);
  }

  /**
   * Transição `NOT_CONNECTED → CONNECTED`. Chamada pela Application Layer
   * (`ConnectAdvertisingAccountHandler`) após a troca do código OAuth pelo
   * refresh token junto ao provider e sua cifragem (`token-cipher.ts`) — este
   * Aggregate nunca decifra nem valida o formato do token, só o armazena.
   * `objects/AdvertisingAccount.md § 6-7`.
   */
  connect(externalAccountId: string, encryptedRefreshToken: string): Result<void, DomainError> {
    if (this.props.connectionStatus !== "NOT_CONNECTED" && this.props.connectionStatus !== "SYNC_FAILED") {
      return Result.fail(
        new ConflictError(`AdvertisingAccount não pode ser conectada a partir do estado "${this.props.connectionStatus}"`),
      );
    }
    this.props.connectionStatus = "CONNECTED";
    this.props.externalAccountId = externalAccountId;
    this.props.encryptedRefreshToken = encryptedRefreshToken;
    this.props.connectedAt = new Date();
    this.props.updatedAt = new Date();
    this.addDomainEvent(new AdvertisingAccountConnected(this.id));
    return Result.ok(undefined);
  }

  /**
   * Transição `CONNECTED → SYNC_REQUIRED`. Sinaliza que uma sincronização foi
   * solicitada (manual, Fase 02) mas ainda não começou a rodar. Não dispara
   * Domain Event — nenhuma fonte confirma um consumidor para este estado
   * intermediário (`objects/AdvertisingAccount.md § 9`), mesmo critério de
   * `Opportunity.advanceStage()`.
   */
  requestSync(): Result<void, DomainError> {
    if (this.props.connectionStatus !== "CONNECTED" && this.props.connectionStatus !== "SYNC_FAILED") {
      return Result.fail(
        new ConflictError(`AdvertisingAccount não pode solicitar sincronização a partir do estado "${this.props.connectionStatus}"`),
      );
    }
    this.props.connectionStatus = "SYNC_REQUIRED";
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /** Transição `SYNC_REQUIRED → SYNCING`. Sem Domain Event, mesma justificativa de `requestSync()`. */
  startSync(): Result<void, DomainError> {
    if (this.props.connectionStatus !== "SYNC_REQUIRED") {
      return Result.fail(
        new ConflictError(`AdvertisingAccount não pode iniciar sincronização a partir do estado "${this.props.connectionStatus}"`),
      );
    }
    this.props.connectionStatus = "SYNCING";
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /** Transição terminal-de-ciclo `SYNCING → CONNECTED`, com `lastSyncAt` atualizado. */
  completeSync(): Result<void, DomainError> {
    if (this.props.connectionStatus !== "SYNCING") {
      return Result.fail(
        new ConflictError(`AdvertisingAccount não pode concluir sincronização a partir do estado "${this.props.connectionStatus}"`),
      );
    }
    this.props.connectionStatus = "CONNECTED";
    this.props.lastSyncAt = new Date();
    this.props.updatedAt = new Date();
    this.addDomainEvent(new AdvertisingAccountSyncCompleted(this.id));
    return Result.ok(undefined);
  }

  /** Transição `SYNCING → SYNC_FAILED`. A mensagem de erro vive em `SyncRun.errorMessage`, não neste Aggregate. */
  failSync(): Result<void, DomainError> {
    if (this.props.connectionStatus !== "SYNCING") {
      return Result.fail(
        new ConflictError(`AdvertisingAccount não pode registrar falha de sincronização a partir do estado "${this.props.connectionStatus}"`),
      );
    }
    this.props.connectionStatus = "SYNC_FAILED";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new AdvertisingAccountSyncFailed(this.id));
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get provider(): AdvertisingProvider {
    return this.props.provider;
  }

  get externalAccountId(): string | undefined {
    return this.props.externalAccountId;
  }

  get name(): string {
    return this.props.name;
  }

  get connectionStatus(): AdvertisingAccountConnectionStatus {
    return this.props.connectionStatus;
  }

  get connectedAt(): Date | undefined {
    return this.props.connectedAt;
  }

  get lastSyncAt(): Date | undefined {
    return this.props.lastSyncAt;
  }

  get encryptedRefreshToken(): string | undefined {
    return this.props.encryptedRefreshToken;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

export { VALID_PROVIDERS, VALID_CONNECTION_STATUSES };
