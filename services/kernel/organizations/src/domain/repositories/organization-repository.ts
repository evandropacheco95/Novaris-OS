import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Organization } from "../aggregates/organization/organization.js";

/**
 * Contrato de persistência do Aggregate `Organization` — port da Domain Layer
 * (ENGINEERING_PLAYBOOK.md § 3); implementação concreta vive em `infrastructure/`,
 * fora do escopo desta missão. Composição idêntica ao padrão já congelado no
 * Identity Domain (`UserRepository`/`RoleRepository`, ENG-0002.9): apenas
 * `ReadRepository<Organization>` + `WriteRepository<Organization>` do Shared
 * Kernel, sem nenhum método próprio. Nenhuma consulta específica de negócio
 * (ex.: buscar por `slug`) foi acrescentada — nenhuma fonte oficial define
 * índices/consultas reais do Organization Domain ainda; acrescentar um método
 * agora seria antecipar uma decisão de infraestrutura.
 */
export interface OrganizationRepository extends ReadRepository<Organization>, WriteRepository<Organization> {}
