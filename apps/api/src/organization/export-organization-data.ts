import { UniqueEntityId, Result, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import type { OrganizationRepository } from "@novaris/organizations";
import { UploadFileCommand, UploadFileHandler, FileRecord } from "@novaris/files";

/**
 * Todo Aggregate/Entity raiz com `organizationId` próprio (`ADR-0057`).
 * Todo novo Aggregate `organizationId`-scoped precisa entrar nesta lista
 * manualmente — mesmo trade-off já aceito por `FULL_PERMISSION_CATALOG`
 * (`seed.ts`) e `DOMAINS` (`dashboard-shell.tsx`). Exclui deliberadamente
 * `Credential` (Infrastructure, `password_hash` — `ADR-0010`).
 */
const ORGANIZATION_SCOPED_MODELS = [
  "opportunity",
  "salesChannel",
  "pipeline",
  "user",
  "role",
  "party",
  "relationship",
  "project",
  "invoice",
  "subscription",
  "activity",
  "campaign",
  "dashboard",
  "auditEntry",
  "configurationEntry",
  "featureFlag",
  "fileRecord",
  "automationRule",
  "lead",
  "product",
  "quotation",
  "case",
  "comment",
  "contract",
  "revenue",
  "calendarEvent",
  "reminder",
  "checklist",
] as const;

/**
 * Internal Entities sem `organizationId` próprio — lidas via id do Aggregate
 * pai já buscado acima (`parentModel` é a chave já presente em `data`).
 */
const CHILD_MODELS = [
  { model: "stage", parentField: "pipelineId", parentModel: "pipeline" },
  { model: "proposal", parentField: "opportunityId", parentModel: "opportunity" },
  { model: "task", parentField: "projectId", parentModel: "project" },
  { model: "campaignAsset", parentField: "campaignId", parentModel: "campaign" },
  { model: "widget", parentField: "dashboardId", parentModel: "dashboard" },
  { model: "quotationLineItem", parentField: "quotationId", parentModel: "quotation" },
  { model: "checklistItem", parentField: "checklistId", parentModel: "checklist" },
] as const;

type PrismaRecord = Record<string, unknown> & { id: string };
type PrismaDataClient = Record<string, { findMany: (args: { where: Record<string, unknown> }) => Promise<PrismaRecord[]> }>;

/**
 * ExportOrganizationDataHandler — Application Layer, `apps/api/src/organization`
 * (`ADR-0057`). Acesso direto a `prisma` (não a um Repository de Domain) —
 * mesmo precedente de `seed.ts`: não modela nenhum invariante de negócio, é
 * uma leitura em lote seguida de 1 escrita de arquivo. Reaproveita
 * `UploadFileHandler`/`FileRecord` (`@novaris/files`, `ADR-0039`) sem
 * nenhuma alteração — a mesma infraestrutura já usada por upload multipart
 * e por `CampaignAsset` (`ADR-0048`).
 */
export class ExportOrganizationDataHandler {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly uploadFileHandler: UploadFileHandler,
  ) {}

  async execute(organizationId: string): Promise<Result<FileRecord, DomainError | InfrastructureError>> {
    const findResult = await this.organizationRepository.findById(new UniqueEntityId(organizationId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Organization "${organizationId}" não encontrada`));
    }
    const organization = option.getOrElse(null as never);

    const client = prisma as unknown as PrismaDataClient;
    const data: Record<string, PrismaRecord[]> = {};

    for (const model of ORGANIZATION_SCOPED_MODELS) {
      data[model] = await client[model]!.findMany({ where: { organizationId } });
    }

    for (const child of CHILD_MODELS) {
      const parentIds = data[child.parentModel]!.map((record) => record.id);
      data[child.model] = parentIds.length > 0 ? await client[child.model]!.findMany({ where: { [child.parentField]: { in: parentIds } } }) : [];
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      organization: { id: organization.id.toString(), slug: organization.slug, name: organization.name },
      data,
    };
    const content = Buffer.from(JSON.stringify(payload, null, 2), "utf-8");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `export-${organization.slug}-${timestamp}.json`;

    return this.uploadFileHandler.execute(
      new UploadFileCommand({ organizationId, filename, mimeType: "application/json", content }),
    );
  }
}
