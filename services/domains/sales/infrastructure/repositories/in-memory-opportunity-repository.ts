import { Option, Result } from "@novaris/shared-kernel";
import type { UniqueEntityId, InfrastructureError } from "@novaris/shared-kernel";
import type { Opportunity } from "../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../domain/repositories/opportunity-repository.js";
import type { OpportunityRecord } from "../persistence/opportunity-record.js";
import { OpportunityMapper } from "../mappers/opportunity-mapper.js";

/**
 * Implementação concreta de `OpportunityRepository` — armazenamento em
 * memória (`Map`), sem banco, ORM ou schema real, conforme restrição
 * explícita da Ordem de Missão `ENG-0050` ("Não criar: Prisma schema,
 * migrations, banco"). Não é um Fake/Mock de teste — é uma implementação de
 * Infrastructure Layer genuína e funcional, usada como estágio interino
 * antes de uma implementação com tecnologia de persistência real (Fase 3 de
 * `KERNEL_DOMAIN_LIFECYCLE_V2.md` prevê exatamente essa progressão: contrato
 * → Blueprint conceitual → implementação real).
 *
 * Traceability: [OpportunityRepository](../../domain/repositories/opportunity-repository.ts)
 * (`ENG-0045`) — implementa exclusivamente os 5 métodos já congelados
 * (`findById`, `findAll`, `exists`, `save`, `delete`), nenhum método de
 * conveniência (`findByCustomer`/`findByStage`/`findByStatus` **não**
 * existem). Usa `OpportunityMapper` para toda tradução — nunca acessa
 * `OpportunityProps` diretamente.
 */
export class InMemoryOpportunityRepository implements OpportunityRepository {
  private readonly records = new Map<string, OpportunityRecord>();

  async findById(id: UniqueEntityId): Promise<Result<Option<Opportunity>, InfrastructureError>> {
    const record = this.records.get(id.toString());
    if (!record) {
      return Result.ok(Option.none<Opportunity>());
    }
    return Result.ok(Option.some(OpportunityMapper.toDomain(record)));
  }

  async findAll(): Promise<Result<Opportunity[], InfrastructureError>> {
    const opportunities = Array.from(this.records.values()).map((record) => OpportunityMapper.toDomain(record));
    return Result.ok(opportunities);
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toString()));
  }

  async save(entity: Opportunity): Promise<Result<void, InfrastructureError>> {
    this.records.set(entity.id.toString(), OpportunityMapper.toPersistence(entity));
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toString());
    return Result.ok(undefined);
  }
}
