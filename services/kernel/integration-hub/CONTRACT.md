# Contrato de Serviço — integration-hub

## Objetivo

Ponto único de integração com sistemas externos. Implementado real em `ENG-0141`/`ADR-0040` — **estrutural**: 7 Ports + 7 Console adapters, nenhuma credencial real existe para nenhum dos 4 sistemas (WhatsApp, Meta, Bling, Google), então nenhum adapter chama uma API externa de verdade.

## Interface Pública

```typescript
interface IntegrationResult {
  readonly success: boolean;
  readonly loggedOnly: boolean; // sempre true nesta versão
  readonly externalRef?: string;
}

interface WhatsAppProvider { sendMessage(to: string, message: string): Promise<IntegrationResult> }
interface MetaProvider { publishPost(pageId: string, message: string): Promise<IntegrationResult> }
interface BlingProvider { emitInvoice(reference: string, amount: number, description: string): Promise<IntegrationResult> }
interface GoogleCalendarProvider { createEvent(title: string, startsAt: Date, endsAt: Date): Promise<IntegrationResult> }
interface GmailProvider { sendEmail(to: string, subject: string, body: string): Promise<IntegrationResult> }
interface GoogleSheetsProvider { appendRow(spreadsheetId: string, values: string[]): Promise<IntegrationResult> }
interface GoogleAdsProvider { createCampaign(name: string, budget: number): Promise<IntegrationResult> }
```

## Entradas/Saídas

Ver assinaturas acima — cada operação é a única representativa do provedor (`ADR-0040`), não a API completa. Todo adapter Console devolve `{ success: true, loggedOnly: true }` e nunca lança.

## Erros

Não aplicável aos adapters Console (nunca falham — não há rede envolvida). Um adapter HTTP real (futuro) precisará decidir seu próprio tratamento de erro quando existir.

## Eventos Emitidos

Nenhum.

## Dependências

Configuration, Audit (declaradas originalmente) — não exercidas por nenhum adapter Console nesta versão; `Logging` é a dependência real efetivamente usada.

## Object Specification

Não aplicável — infraestrutura transversal.

## Status

🟡 Estrutural, real (`ENG-0141`, `ADR-0040`). 7 Ports + 7 Console adapters implementados e testados — **nenhuma integração externa real funciona**. Exposto via `POST /integrations/{whatsapp,meta,bling,google/calendar,google/gmail,google/sheets,google/ads}` (`apps/api`), toda resposta inclui `loggedOnly: true`. Credenciais reais (`.env.example` já documenta os placeholders esperados) e adapters HTTP reais ficam para quando as contas de cada provedor existirem — troca de adapter sem mudar o Port.
