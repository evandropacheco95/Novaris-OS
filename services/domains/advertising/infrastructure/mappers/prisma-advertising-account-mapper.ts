import { UniqueEntityId } from "@novaris/shared-kernel";
import type { AdvertisingAccount as PrismaAdvertisingAccount } from "@novaris/database";
import { AdvertisingAccount, type AdvertisingAccountProps, type AdvertisingProvider, type AdvertisingAccountConnectionStatus } from "../../domain/aggregates/advertising-account/advertising-account.js";

/** PrismaAdvertisingAccountMapper — tradução pura Aggregate ↔ linha do Postgres, sem I/O próprio. Mesmo padrão de `PrismaCampaignMapper`. */
export class PrismaAdvertisingAccountMapper {
  static toPersistenceCreate(advertisingAccount: AdvertisingAccount) {
    return {
      id: advertisingAccount.id.toString(),
      organizationId: advertisingAccount.organizationId.toString(),
      provider: advertisingAccount.provider,
      externalAccountId: advertisingAccount.externalAccountId ?? null,
      name: advertisingAccount.name,
      connectionStatus: advertisingAccount.connectionStatus,
      connectedAt: advertisingAccount.connectedAt ?? null,
      lastSyncAt: advertisingAccount.lastSyncAt ?? null,
      encryptedRefreshToken: advertisingAccount.encryptedRefreshToken ?? null,
    };
  }

  static toDomain(record: PrismaAdvertisingAccount): AdvertisingAccount {
    const props: AdvertisingAccountProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      provider: record.provider as AdvertisingProvider,
      externalAccountId: record.externalAccountId ?? undefined,
      name: record.name,
      connectionStatus: record.connectionStatus as AdvertisingAccountConnectionStatus,
      connectedAt: record.connectedAt ?? undefined,
      lastSyncAt: record.lastSyncAt ?? undefined,
      encryptedRefreshToken: record.encryptedRefreshToken ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return AdvertisingAccount.reconstitute(props, new UniqueEntityId(record.id));
  }
}
