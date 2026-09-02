const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export interface ExchangeAuthorizationCodeInput {
  authorizationCode: string;
  redirectUri: string;
}

export interface ExchangeAuthorizationCodeOutput {
  refreshToken: string;
}

/**
 * Port de infraestrutura (não Domain Port — troca de código OAuth é detalhe
 * técnico do fluxo de conexão, não um conceito de negócio) para
 * `ConnectAdvertisingAccountHandler` trocar o `authorizationCode` da tela de
 * consentimento do Google por um `refresh_token`. Interface separada de
 * `GoogleAdsProvider` (`kernel/integration-hub`) — OAuth genérico do Google,
 * não específico da Google Ads Query API. `ADR-0060`.
 */
export interface GoogleOAuthClient {
  exchangeAuthorizationCode(input: ExchangeAuthorizationCodeInput): Promise<ExchangeAuthorizationCodeOutput>;
}

export interface HttpGoogleOAuthClientConfig {
  clientId: string;
  clientSecret: string;
}

/** Implementação real — REST direto contra `oauth2.googleapis.com`, `fetch` nativo, sem dependência npm nova. */
export class HttpGoogleOAuthClient implements GoogleOAuthClient {
  constructor(private readonly config: HttpGoogleOAuthClientConfig) {}

  async exchangeAuthorizationCode(input: ExchangeAuthorizationCodeInput): Promise<ExchangeAuthorizationCodeOutput> {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: input.authorizationCode,
        redirect_uri: input.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }).toString(),
    });
    const body = (await response.json()) as { refresh_token?: string; error_description?: string };
    if (!response.ok || !body.refresh_token) {
      throw new Error(`Falha ao trocar código OAuth do Google Ads por refresh token: ${body.error_description ?? `HTTP ${response.status}`}`);
    }
    return { refreshToken: body.refresh_token };
  }
}
