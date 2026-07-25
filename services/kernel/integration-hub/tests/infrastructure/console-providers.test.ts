import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Logger, LogContext } from "@novaris/logging";
import { ConsoleWhatsAppProvider } from "../../src/infrastructure/console-whatsapp-provider.js";
import { ConsoleMetaProvider } from "../../src/infrastructure/console-meta-provider.js";
import { ConsoleBlingProvider } from "../../src/infrastructure/console-bling-provider.js";
import { ConsoleGoogleCalendarProvider } from "../../src/infrastructure/console-google-calendar-provider.js";
import { ConsoleGmailProvider } from "../../src/infrastructure/console-gmail-provider.js";
import { ConsoleGoogleSheetsProvider } from "../../src/infrastructure/console-google-sheets-provider.js";
import { ConsoleGoogleAdsProvider } from "../../src/infrastructure/console-google-ads-provider.js";

class FakeLogger implements Logger {
  readonly infos: Array<{ message: string; context?: LogContext }> = [];
  debug(): void {}
  info(message: string, context?: LogContext): void {
    this.infos.push({ message, context });
  }
  warn(): void {}
  error(): void {}
}

/**
 * Testes dos 7 adapters estruturais de `integration-hub` (`ADR-0040`) — cada
 * um prova a mesma coisa: loga a chamada, nunca acessa rede, sempre devolve
 * `loggedOnly: true`. Nenhum destes testes prova integração real — não há
 * integração real para provar ainda (nenhuma credencial existe).
 */
describe("ConsoleWhatsAppProvider", () => {
  it("loga a mensagem e devolve loggedOnly: true", async () => {
    const logger = new FakeLogger();
    const provider = new ConsoleWhatsAppProvider(logger);

    const result = await provider.sendMessage("+5511999999999", "Olá!");

    assert.deepEqual(result, { success: true, loggedOnly: true });
    assert.equal(logger.infos.length, 1);
    assert.match(logger.infos[0]!.message, /\+5511999999999/);
  });
});

describe("ConsoleMetaProvider", () => {
  it("loga o post e devolve loggedOnly: true", async () => {
    const logger = new FakeLogger();
    const provider = new ConsoleMetaProvider(logger);

    const result = await provider.publishPost("page-123", "Novidade!");

    assert.deepEqual(result, { success: true, loggedOnly: true });
    assert.match(logger.infos[0]!.message, /page-123/);
  });
});

describe("ConsoleBlingProvider", () => {
  it("loga a cobrança e devolve loggedOnly: true", async () => {
    const logger = new FakeLogger();
    const provider = new ConsoleBlingProvider(logger);

    const result = await provider.emitInvoice("REF-001", 199.9, "Assinatura mensal");

    assert.deepEqual(result, { success: true, loggedOnly: true });
    assert.match(logger.infos[0]!.message, /REF-001/);
    assert.match(logger.infos[0]!.message, /199\.90/);
  });
});

describe("ConsoleGoogleCalendarProvider", () => {
  it("loga o evento e devolve loggedOnly: true", async () => {
    const logger = new FakeLogger();
    const provider = new ConsoleGoogleCalendarProvider(logger);
    const start = new Date("2026-08-01T10:00:00Z");
    const end = new Date("2026-08-01T11:00:00Z");

    const result = await provider.createEvent("Reunião", start, end);

    assert.deepEqual(result, { success: true, loggedOnly: true });
    assert.match(logger.infos[0]!.message, /Reunião/);
  });
});

describe("ConsoleGmailProvider", () => {
  it("loga o e-mail e devolve loggedOnly: true", async () => {
    const logger = new FakeLogger();
    const provider = new ConsoleGmailProvider(logger);

    const result = await provider.sendEmail("cliente@exemplo.com", "Assunto", "Corpo do e-mail");

    assert.deepEqual(result, { success: true, loggedOnly: true });
    assert.match(logger.infos[0]!.message, /cliente@exemplo\.com/);
  });
});

describe("ConsoleGoogleSheetsProvider", () => {
  it("loga a linha e devolve loggedOnly: true", async () => {
    const logger = new FakeLogger();
    const provider = new ConsoleGoogleSheetsProvider(logger);

    const result = await provider.appendRow("sheet-abc", ["a", "b", "c"]);

    assert.deepEqual(result, { success: true, loggedOnly: true });
    assert.match(logger.infos[0]!.message, /sheet-abc/);
  });
});

describe("ConsoleGoogleAdsProvider", () => {
  it("loga a campanha e devolve loggedOnly: true", async () => {
    const logger = new FakeLogger();
    const provider = new ConsoleGoogleAdsProvider(logger);

    const result = await provider.createCampaign("Campanha de Lançamento", 500);

    assert.deepEqual(result, { success: true, loggedOnly: true });
    assert.match(logger.infos[0]!.message, /Campanha de Lançamento/);
  });
});
