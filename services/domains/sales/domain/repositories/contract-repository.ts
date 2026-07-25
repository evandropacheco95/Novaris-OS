import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Contract } from "../aggregates/contract/contract.js";

/** Contrato de persistência do Aggregate `Contract` (`ADR-0044`). */
export interface ContractRepository extends ReadRepository<Contract>, WriteRepository<Contract> {}
