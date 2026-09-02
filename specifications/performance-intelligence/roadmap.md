# Performance Intelligence — Roadmap

> 14 fases do master doc original, ordem intencional e não-invertível: dado real → armazenamento confiável → análise determinística → detecção de sinal → interpretação por IA → pesquisa → recomendação → ação controlada → medição → aprendizado. Nenhuma fase abaixo foi iniciada — este roadmap é o plano, não o estado atual.

| Fase | Nome | Entrega |
|---|---|---|
| 00 | Project Constitution | ✅ Este documento + [overview.md](overview.md) + [ADR-0058](../../adr/ADR-0058-novaris-performance-intelligence-product.md). Concluída nesta sessão. |
| 01 | Foundation | ✅ Concluída. `Company`/`Business Profile` resolvido (= `Organization`, sem objeto novo, `ADR-0059`). `AdvertisingAccount` implementado: domínio `services/domains/advertising` (`ADR-0059`), Object Specification ([objects/AdvertisingAccount.md](../../knowledge/core/objects/AdvertisingAccount.md)), Aggregate + Repository + `POST`/`GET /performance-intelligence/ad-accounts`. Migration **aplicada** ao banco de produção (Supabase), confirmada via `prisma migrate status` — aprovação explícita do usuário. |
| 02 | Google Ads Integration | ✅ Código completo (`ADR-0060`): 5 novas Object Specifications, extensão do `GoogleAdsProvider` (`kernel/integration-hub`) com 4 métodos de leitura + `HttpGoogleAdsProvider` (REST real, não é o adapter padrão ainda — `ConsoleGoogleAdsProvider` continua em uso em `IntegrationHubModule` até a credencial de Winnet ser aprovada), transições reais de `connectionStatus` (`connect`/`requestSync`/`startSync`/`completeSync`/`failSync`) + 3 Domain Events, refresh token cifrado (`AES-256-GCM`), fluxo OAuth (`start`/`callback`), sincronização manual idempotente (upsert por natural key) de `Ad Campaign`/`Ad Group`/`Keyword`/`Search Term`, `Sync Run` rastreando cada execução, integração real com `kernel/audit` na conexão. Migration escrita, **não aplicada** (pendente de confirmação do usuário). **Não verificado contra a API real do Google Ads** — Winnet ainda em nível "Conta de Teste" (não aprovada para Basic Access), Allbinox sem credencial nenhuma; bloqueio externo, comunicado ao usuário, não uma lacuna de implementação. |
| 03 | Data Platform | `PerformanceSnapshot` histórico (domínio `analytics`, objeto `Snapshot` já previsto em `DOMAIN_MODEL.md`), métricas base e derivadas, tratamento explícito de divisão por zero (nunca expor `NaN`/`Infinity`). |
| 04 | Analytics Engine | Comparação de período, direção de mudança, análise de tendência, estados de dado insuficiente. |
| 05 | Detection Engine | Detectores baseados em regra, detecção estatística inicial, waste, oportunidade, limiares configuráveis, evidência persistida. |
| 06 | AI Diagnostics | Interpretação de performance, diagnóstico contextual, hipótese, evidência a favor/contra, confiança — primeiro consumidor real do `ai-runtime`. |
| 07 | Search Intelligence | Análise de termo de busca, classificação de intenção, candidatos a waste/negativação/expansão. |
| 08 | Research Engine | Pesquisa disparada por problema, hierarquia de fonte, registro de pesquisa, extração de evidência. |
| 09 | Recommendation Engine | Recomendações estruturadas, prioridade, risco, confiança, impacto esperado, necessidade de aprovação. |
| 10 | Action Center | Ciclo de vida completo, aprovação, rejeição, edição, agendamento, audit trail, Action Guardian. Prioriza aprovação humana. |
| 11 | Learning Loop | Antes/depois, janela de avaliação, resultado, aprendizado histórico. |
| 12 | Dashboard e UX | Telas de [screens.md](screens.md) — só depois da inteligência de backend estar suficientemente definida. |
| 13 | Security e Observability | Credenciais, autorização, isolamento de tenant, logs, auditabilidade, rastreamento de falha. |
| 14 | Testing e Quality Gate | Multi-tenancy, integração, sincronização, idempotência, cálculo de métrica, analytics, detectores, validação de saída de IA, fluxo de recomendação, segurança, audit trail. |

## Próximo passo real

Nenhuma fase de código começa sem aprovação explícita do usuário para a Fase 01. Este roadmap é o plano de referência para quando isso acontecer — não uma autorização para começar a codar.
