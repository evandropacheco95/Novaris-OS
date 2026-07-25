import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Project } from "../aggregates/project/project.js";

/**
 * Contrato de persistência do Aggregate `Project` — port da Domain Layer.
 * Composição idêntica ao padrão já congelado em `OpportunityRepository`
 * (Sales): apenas `ReadRepository<Project>` + `WriteRepository<Project>` do
 * Shared Kernel, sem nenhum método próprio.
 */
export interface ProjectRepository extends ReadRepository<Project>, WriteRepository<Project> {}
