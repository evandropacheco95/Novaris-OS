import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Lead as PrismaLead } from "@novaris/database";
import { Lead, type LeadProps, type LeadStatus } from "../../domain/aggregates/lead/lead.js";

/**
 * PrismaLeadMapper — tradução direta Aggregate ↔ Prisma (`ADR-0042`).
 *
 * **Divergência deliberada do padrão de 2 camadas de `Opportunity`/`Pipeline`**
 * (`opportunity-mapper.ts` + `prisma-opportunity-mapper.ts`, via
 * `OpportunityRecord` intermediário): aquele padrão existe para desacoplar
 * `InMemoryOpportunityRepository` de tipos do Prisma. `Lead` não tem
 * implementação in-memory (não foi pedida, não seria usada por nada) —
 * manter a indireção sem um segundo consumidor real seria abstração
 * antecipada. Mapeamento direto, mesmo padrão já usado por todo Kernel
 * (`PrismaConfigurationEntryMapper` etc.).
 */
export class PrismaLeadMapper {
  static toDomain(record: PrismaLead): Lead {
    const props: LeadProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      email: record.email ?? undefined,
      phone: record.phone ?? undefined,
      company: record.company ?? undefined,
      source: record.source ?? undefined,
      status: record.status as LeadStatus,
      convertedPartyId: record.convertedPartyId ? new UniqueEntityId(record.convertedPartyId) : undefined,
      convertedOpportunityId: record.convertedOpportunityId ? new UniqueEntityId(record.convertedOpportunityId) : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return Lead.reconstitute(props, new UniqueEntityId(record.id));
  }

  static toPersistence(lead: Lead): PrismaLead {
    return {
      id: lead.id.toString(),
      organizationId: lead.organizationId.toString(),
      name: lead.name,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      company: lead.company ?? null,
      source: lead.source ?? null,
      status: lead.status,
      convertedPartyId: lead.convertedPartyId?.toString() ?? null,
      convertedOpportunityId: lead.convertedOpportunityId?.toString() ?? null,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }
}
