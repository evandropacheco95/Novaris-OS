import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import {
  CreateAdvertisingAccountCommand,
  CreateAdvertisingAccountHandler,
  ConnectAdvertisingAccountCommand,
  ConnectAdvertisingAccountHandler,
  SyncAdvertisingAccountCommand,
  SyncAdvertisingAccountHandler,
  ImportAdvertisingReportCommand,
  ImportAdvertisingReportHandler,
  type AdvertisingAccountRepository,
  type AdvertisingProvider,
  type AdvertisingCsvReportType,
} from "@novaris/advertising";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

const GOOGLE_ADS_OAUTH_SCOPE = "https://www.googleapis.com/auth/adwords";
const GOOGLE_OAUTH_AUTHORIZE_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface AdvertisingAccountResponse {
  id: string;
  organizationId: string;
  provider: AdvertisingProvider;
  externalAccountId?: string;
  name: string;
  connectionStatus: string;
  connectedAt?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportAdvertisingReportResponse {
  reportType: AdvertisingCsvReportType;
  campaignsSynced: number;
  adGroupsSynced: number;
  keywordsSynced: number;
  skipped: number;
}

/**
 * AdvertisingAccountController — API do Advertising Domain (`ADR-0059`,
 * `ADR-0060`), 11º domínio de negócio exposto. Create + list (`NOT_CONNECTED`
 * inicial), `GET .../oauth-url` (URL de consentimento do Google, montada
 * direto de `GOOGLE_CLIENT_ID`/`GOOGLE_ADS_OAUTH_SCOPE` — sem Handler, é só
 * construção de string), `POST .../connect` (troca o `authorizationCode` da
 * tela de consentimento por conexão real via `ConnectAdvertisingAccountHandler`)
 * e `POST .../sync` (sincronização sob demanda via `SyncAdvertisingAccountHandler`).
 *
 * **Deliberadamente sem `@RequireDomain()`/`PlanGuard`** — `Advertising`
 * não faz parte do conjunto fechado de 10 chaves de domínio usado por
 * `enabledDomains`/sidebar/plan-gating (`ENG-0164`); mesmo tratamento dado
 * a Controllers de Kernel/infraestrutura sem entrada na sidebar
 * (`ai-runtime`, `integration-hub` etc.). Entrada na sidebar/plan-gating
 * fica para a Fase 12 (Dashboard/UX), quando houver tela real.
 */
@Controller("performance-intelligence/ad-accounts")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("advertising.ad-accounts.manage")
export class AdvertisingAccountController {
  constructor(
    private readonly createHandler: CreateAdvertisingAccountHandler,
    private readonly connectHandler: ConnectAdvertisingAccountHandler,
    private readonly syncHandler: SyncAdvertisingAccountHandler,
    private readonly importReportHandler: ImportAdvertisingReportHandler,
    @Inject("AdvertisingAccountRepository") private readonly repository: AdvertisingAccountRepository,
  ) {}

  @Post()
  async create(@Body() body: { provider: AdvertisingProvider; name: string }, @Req() req: AuthenticatedRequest): Promise<AdvertisingAccountResponse> {
    const command = new CreateAdvertisingAccountCommand({
      organizationId: req.user.organizationId,
      provider: body.provider,
      name: body.name,
    });
    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<AdvertisingAccountResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar AdvertisingAccounts" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((account) => account.organizationId.toString() === req.user.organizationId)
      .map((account) => toResponse(account));
  }

  @Get(":id/oauth-url")
  oauthUrl(@Query("redirectUri") redirectUri: string): { url: string } {
    if (!redirectUri) {
      throw new HttpException({ code: "VALIDATION_ERROR", message: '"redirectUri" é obrigatório' }, HttpStatus.BAD_REQUEST);
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: '"GOOGLE_CLIENT_ID" não configurado' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: GOOGLE_ADS_OAUTH_SCOPE,
      access_type: "offline",
      prompt: "consent",
    });
    return { url: `${GOOGLE_OAUTH_AUTHORIZE_ENDPOINT}?${params.toString()}` };
  }

  @Post(":id/connect")
  async connect(
    @Param("id") id: string,
    @Body() body: { externalAccountId: string; authorizationCode: string; redirectUri: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<AdvertisingAccountResponse> {
    const command = new ConnectAdvertisingAccountCommand({
      organizationId: req.user.organizationId,
      advertisingAccountId: id,
      actorId: req.user.userId,
      externalAccountId: body.externalAccountId,
      authorizationCode: body.authorizationCode,
      redirectUri: body.redirectUri,
    });
    const result = await this.connectHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/sync")
  async sync(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<AdvertisingAccountResponse> {
    const command = new SyncAdvertisingAccountCommand({
      organizationId: req.user.organizationId,
      advertisingAccountId: id,
    });
    const result = await this.syncHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/import-csv")
  @UseInterceptors(FileInterceptor("file"))
  async importCsv(
    @Param("id") id: string,
    @Body() body: { reportType: AdvertisingCsvReportType },
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ): Promise<ImportAdvertisingReportResponse> {
    if (!file) {
      throw new HttpException({ code: "VALIDATION_ERROR", message: 'Campo "file" (multipart) é obrigatório' }, HttpStatus.BAD_REQUEST);
    }
    if (!body.reportType) {
      throw new HttpException({ code: "VALIDATION_ERROR", message: '"reportType" é obrigatório' }, HttpStatus.BAD_REQUEST);
    }
    const command = new ImportAdvertisingReportCommand({
      organizationId: req.user.organizationId,
      advertisingAccountId: id,
      reportType: body.reportType,
      filename: file.originalname,
      fileContent: file.buffer,
    });
    const result = await this.importReportHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return result.getValue()!;
  }
}

function toResponse(account: {
  id: { toString(): string };
  organizationId: { toString(): string };
  provider: AdvertisingProvider;
  externalAccountId?: string;
  name: string;
  connectionStatus: string;
  connectedAt?: Date;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}): AdvertisingAccountResponse {
  return {
    id: account.id.toString(),
    organizationId: account.organizationId.toString(),
    provider: account.provider,
    externalAccountId: account.externalAccountId,
    name: account.name,
    connectionStatus: account.connectionStatus,
    connectedAt: account.connectedAt?.toISOString(),
    lastSyncAt: account.lastSyncAt?.toISOString(),
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}
