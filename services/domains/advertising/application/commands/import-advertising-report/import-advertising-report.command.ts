/** Tipos de relatório suportados pelo import de CSV — `search_terms` fica pendente até um export real ser verificado (mesmo critério aplicado a `campaigns`/`ad_groups`/`keywords`). */
export type AdvertisingCsvReportType = "campaigns" | "ad_groups" | "keywords";

export interface ImportAdvertisingReportCommandInput {
  readonly organizationId: string;
  readonly advertisingAccountId: string;
  readonly reportType: AdvertisingCsvReportType;
  readonly filename: string;
  readonly fileContent: Buffer;
}

export class ImportAdvertisingReportCommand {
  readonly organizationId: string;
  readonly advertisingAccountId: string;
  readonly reportType: AdvertisingCsvReportType;
  readonly filename: string;
  readonly fileContent: Buffer;

  constructor(input: ImportAdvertisingReportCommandInput) {
    this.organizationId = input.organizationId;
    this.advertisingAccountId = input.advertisingAccountId;
    this.reportType = input.reportType;
    this.filename = input.filename;
    this.fileContent = input.fileContent;
    Object.freeze(this);
  }
}
