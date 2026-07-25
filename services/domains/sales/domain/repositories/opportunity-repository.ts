import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Opportunity } from "../aggregates/opportunity/opportunity.js";

/**
 * Contrato de persistência do Aggregate `Opportunity` — port da Domain Layer
 * (`ENGINEERING_PLAYBOOK.md § 3`); implementação concreta vive em
 * `infrastructure/`, fora do escopo desta missão.
 *
 * Traceability: [SALES_TECHNICAL_BLUEPRINT.md § 5](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md)
 * ("Repository Interfaces" — `OpportunityRepository` identificado
 * conceitualmente, zero método próprio) — [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md)
 * (ENS-0001 § 8, `reconstitute()` usado exclusivamente pelo Repository).
 *
 * **Verify Before Reimplementing**: composição idêntica ao padrão já
 * congelado no Kernel — `OrganizationRepository`
 * (`services/kernel/organizations/src/domain/repositories/organization-repository.ts`)
 * e `UserRepository`/`RoleRepository` (Identity, `ENG-0002.9`) — apenas
 * `ReadRepository<Opportunity>` + `WriteRepository<Opportunity>` do Shared
 * Kernel, sem nenhum método próprio. `findByCustomer()`/`findByStage()`/
 * `findByStatus()` **não foram criados** — nenhuma fonte oficial define
 * índices/consultas reais do Sales Domain ainda; acrescentar um método agora
 * seria antecipar uma decisão de infraestrutura (`SALES_AGGREGATE_DESIGN.md § 13`,
 * `Needs Evidence`).
 *
 * Trabalha exclusivamente com o Aggregate Root `Opportunity` — não existe
 * Repository para `Proposal` (Internal Entity, `SALES_TECHNICAL_BLUEPRINT.md § 3`),
 * que é persistida apenas como parte do próprio `Opportunity`.
 */
export interface OpportunityRepository extends ReadRepository<Opportunity>, WriteRepository<Opportunity> {}
