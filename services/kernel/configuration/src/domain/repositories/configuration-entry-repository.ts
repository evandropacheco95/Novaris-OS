import type { ReadRepository, WriteRepository, UniqueEntityId, Result, Option, InfrastructureError } from "@novaris/shared-kernel";
import type { ConfigurationEntry } from "../aggregates/configuration-entry/configuration-entry.js";

/**
 * `findByOrganizationAndKey` — consulta especializada (mesmo padrão de
 * `AuditEntryRepository.findByTarget`): a busca real por `ConfigurationEntry`
 * é sempre por `(organizationId, key)`, nunca por `id` interno isolado, que
 * ninguém fora do próprio Repository precisa conhecer.
 */
export interface ConfigurationEntryRepository extends ReadRepository<ConfigurationEntry>, WriteRepository<ConfigurationEntry> {
  findByOrganizationAndKey(organizationId: UniqueEntityId, key: string): Promise<Result<Option<ConfigurationEntry>, InfrastructureError>>;
}
