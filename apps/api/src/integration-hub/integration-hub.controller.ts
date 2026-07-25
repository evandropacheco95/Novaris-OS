import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import type {
  IntegrationResult,
  WhatsAppProvider,
  MetaProvider,
  BlingProvider,
  GoogleCalendarProvider,
  GmailProvider,
  GoogleSheetsProvider,
  GoogleAdsProvider,
} from "@novaris/integration-hub";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";

/**
 * IntegrationHubController — API de `integration-hub` (`ADR-0040`, `ENG-0141`).
 * As 7 rotas só logam (`loggedOnly: true` em toda resposta) — nenhuma delas
 * chama WhatsApp/Meta/Bling/Google de verdade, porque nenhuma credencial
 * real existe ainda. Um único código de Permission cobre as 7 (granularidade
 * mais fina fica para quando os adapters reais existirem).
 */
@Controller("integrations")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("system.integration-hub.manage")
export class IntegrationHubController {
  constructor(
    @Inject("WhatsAppProvider") private readonly whatsapp: WhatsAppProvider,
    @Inject("MetaProvider") private readonly meta: MetaProvider,
    @Inject("BlingProvider") private readonly bling: BlingProvider,
    @Inject("GoogleCalendarProvider") private readonly googleCalendar: GoogleCalendarProvider,
    @Inject("GmailProvider") private readonly gmail: GmailProvider,
    @Inject("GoogleSheetsProvider") private readonly googleSheets: GoogleSheetsProvider,
    @Inject("GoogleAdsProvider") private readonly googleAds: GoogleAdsProvider,
  ) {}

  @Post("whatsapp")
  async sendWhatsApp(@Body() body: { to: string; message: string }): Promise<IntegrationResult> {
    return this.whatsapp.sendMessage(body.to, body.message);
  }

  @Post("meta")
  async publishMeta(@Body() body: { pageId: string; message: string }): Promise<IntegrationResult> {
    return this.meta.publishPost(body.pageId, body.message);
  }

  @Post("bling")
  async emitBlingInvoice(@Body() body: { reference: string; amount: number; description: string }): Promise<IntegrationResult> {
    return this.bling.emitInvoice(body.reference, body.amount, body.description);
  }

  @Post("google/calendar")
  async createGoogleCalendarEvent(@Body() body: { title: string; startsAt: string; endsAt: string }): Promise<IntegrationResult> {
    return this.googleCalendar.createEvent(body.title, new Date(body.startsAt), new Date(body.endsAt));
  }

  @Post("google/gmail")
  async sendGmail(@Body() body: { to: string; subject: string; body: string }): Promise<IntegrationResult> {
    return this.gmail.sendEmail(body.to, body.subject, body.body);
  }

  @Post("google/sheets")
  async appendGoogleSheetsRow(@Body() body: { spreadsheetId: string; values: string[] }): Promise<IntegrationResult> {
    return this.googleSheets.appendRow(body.spreadsheetId, body.values);
  }

  @Post("google/ads")
  async createGoogleAdsCampaign(@Body() body: { name: string; budget: number }): Promise<IntegrationResult> {
    return this.googleAds.createCampaign(body.name, body.budget);
  }
}
