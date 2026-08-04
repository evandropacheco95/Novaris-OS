import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Organization as PrismaOrganization } from "@novaris/database";
import {
  Organization,
  type OrganizationProps,
  type OrganizationStatus,
  type OrganizationPlan,
  type OrganizationBillingStatus,
  type OrganizationAddress,
} from "../../domain/aggregates/organization/organization.js";

/**
 * PrismaOrganizationMapper — tradução pura Aggregate ↔ linha real do Postgres
 * (via Prisma Client), sem I/O próprio. Mesma disciplina de
 * `PrismaOpportunityMapper` (Sales, `ENG-0120`): nunca valida regra de negócio,
 * nunca dispara Domain Events, nunca decide valor não fornecido pela fonte.
 *
 * `address` é persistido como JSONB — mesma forma de `OrganizationAddress`,
 * sem Value Object próprio (nenhuma fonte oficial congelou validação para ele,
 * `organization.ts`).
 */
export class PrismaOrganizationMapper {
  static toPersistenceCreate(organization: Organization) {
    return {
      id: organization.id.toString(),
      slug: organization.slug,
      name: organization.name,
      legalName: organization.legalName,
      document: organization.document,
      address: organization.address as object,
      status: organization.status,
      plan: organization.plan,
      billingStatus: organization.billingStatus,
      trialEnd: organization.trialEnd ?? null,
      maxUsers: organization.maxUsers ?? null,
      enabledDomains: organization.enabledDomains ?? [],
      metadata: organization.metadata as object,
    };
  }

  static toDomain(record: PrismaOrganization): Organization {
    const props: OrganizationProps = {
      slug: record.slug,
      name: record.name,
      legalName: record.legalName,
      document: record.document,
      address: record.address as unknown as OrganizationAddress,
      status: record.status as OrganizationStatus,
      plan: record.plan as OrganizationPlan,
      billingStatus: record.billingStatus as OrganizationBillingStatus,
      trialEnd: record.trialEnd ?? undefined,
      maxUsers: record.maxUsers ?? undefined,
      enabledDomains: record.enabledDomains.length > 0 ? record.enabledDomains : undefined,
      metadata: record.metadata as Record<string, unknown>,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt ?? undefined,
    };

    return Organization.reconstitute(props, new UniqueEntityId(record.id));
  }
}
