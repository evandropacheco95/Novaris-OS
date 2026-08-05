import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { SalesChannel } from "../aggregates/sales-channel/sales-channel.js";

/** Contrato de persistência do Aggregate `SalesChannel` (`ADR-0052`). */
export interface SalesChannelRepository extends ReadRepository<SalesChannel>, WriteRepository<SalesChannel> {}
