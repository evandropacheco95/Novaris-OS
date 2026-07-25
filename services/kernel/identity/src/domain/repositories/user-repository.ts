import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { User } from "../aggregates/user/user.js";

/**
 * Contrato de persistência do Aggregate `User` — port da Domain Layer
 * (ENGINEERING_PLAYBOOK.md § 3); implementação concreta vive em `infrastructure/`,
 * fora do escopo desta missão. Composição exata já congelada em
 * IDENTITY_TECHNICAL_BLUEPRINT.md § 5: `ReadRepository<User>` +
 * `WriteRepository<User>` do Shared Kernel (ENG-0001.7), sem nenhum método
 * próprio. Nenhuma operação foi acrescentada — nenhuma fonte oficial define os
 * índices/consultas reais do Identity Service (Blueprint §§ 5, 10 marcam isso
 * como decisão de infraestrutura ainda não tomada); acrescentar um método como
 * `findByEmail` aqui seria antecipar essa decisão. Ver "Operações Rejeitadas"
 * no Self Review da Missão ENG-0002.9.
 */
export interface UserRepository extends ReadRepository<User>, WriteRepository<User> {}
