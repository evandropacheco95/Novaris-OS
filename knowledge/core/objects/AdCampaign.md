# OBJECT SPECIFICATION

------------------------------------------------------------
OBJECT NAME

Ad Campaign

------------------------------------------------------------
DOMAIN

Advertising (`ADR-0059`)

------------------------------------------------------------
VERSION

0.1.0

------------------------------------------------------------
STATUS

🚧 Parcial — escrito para desbloquear a Fase 02 de `NOVARIS Performance Intelligence` (`ADR-0060`), `Article V`. Capítulos sem fonte real (IA, Automações, Dashboards) marcados `TODO`.

------------------------------------------------------------
OWNER

NOVARIS Engineering Team

------------------------------------------------------------
CLASSIFICATION

Business Object (Advertising Domain)

# 1. Objetivo

Espelhar, dentro do NOVARIS, o estado atual de uma campanha de mídia paga que existe de fato numa plataforma externa (Google Ads), sincronizada via `AdvertisingAccount`.

---

# 2. Problema que resolve

Sem este objeto, não haveria como o NOVARIS saber quais campanhas existem numa conta conectada, seu status e seus totais mais recentes — pré-requisito para qualquer análise, detecção de sinal ou recomendação (Fases 03-09).

---

# 3. Responsabilidades

✔ Registrar a existência e o estado atual (nome, status, tipo de canal) de uma campanha sincronizada de uma plataforma externa

✔ Guardar os últimos totais conhecidos de custo/cliques/impressões/conversões, obtidos na sincronização mais recente

✔ Ser atualizado (upsert) a cada sincronização, sem duplicar registro para a mesma campanha externa

---

# 4. Não Responsabilidades

✘ Não é `Campaign` (Marketing Domain, `ADR-0033`) — campanha interna de marketing, sem sincronização externa; são objetos deliberadamente distintos (`ADR-0059`)

✘ Não guarda histórico de métricas por dia — isso é `PerformanceSnapshot` (Analytics Domain, Fase 03, `ADR-0060`); `Ad Campaign` guarda só o estado/totais mais recentes

✘ Não decide nem calcula diagnóstico, sinal ou recomendação — isso é Analytics/AI Diagnostics (Fases 05-06)

✘ Não executa a chamada à API do Google Ads — isso é `GoogleAdsProvider` (`kernel/integration-hub`), consumido pelo `SyncAdvertisingAccountHandler`

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identificador interno |
| `organizationId` | UUID | Sim | `Organization` proprietária |
| `advertisingAccountId` | UUID | Sim | `AdvertisingAccount` que sincronizou esta campanha |
| `externalCampaignId` | string | Sim | ID da campanha na plataforma externa (`campaign.id`, Google Ads) — natural key junto com `advertisingAccountId` |
| `name` | string | Sim | Nome da campanha, como retornado pela API — nunca editável pelo usuário nesta versão (espelho, não fonte) |
| `status` | string | Sim | Status bruto da plataforma externa (ex.: `ENABLED`, `PAUSED`, `REMOVED`) — não traduzido/reinterpretado |
| `channelType` | string | Sim | Tipo de canal bruto da plataforma (`advertising_channel_type`, ex.: `SEARCH`) |
| `lastCostMicros` | integer | Sim | Custo total (micros) na última janela sincronizada. `0` até a primeira sincronização real |
| `lastClicks` | integer | Sim | Cliques totais na última janela sincronizada |
| `lastImpressions` | integer | Sim | Impressões totais na última janela sincronizada |
| `lastConversions` | number | Sim | Conversões totais na última janela sincronizada |
| `lastSyncedAt` | timestamp | Sim | Quando este registro foi upsertado pela última vez |
| `createdAt` | timestamp | Sim | Padrão |
| `updatedAt` | timestamp | Sim | Padrão |

---

# 6. Estados

Não tem máquina de estados própria — `status` é um valor bruto espelhado da plataforma externa, não um ciclo de vida controlado pelo NOVARIS.

---

# 7. Ciclo de Vida

```
Descoberta (create(), primeira vez que aparece numa sincronização)
  ↓
Atualizada (applySync(), toda sincronização subsequente — mesmo externalCampaignId)
```

Não há exclusão — se uma campanha for removida na plataforma externa, a próxima sincronização atualiza `status` para o valor bruto retornado (ex.: `REMOVED`), o registro nunca é apagado (histórico).

---

# 8. Relacionamentos

Pertence a uma `Organization` e a uma `AdvertisingAccount`.

Tem `AdGroup`s (referência inversa, `AdGroup.adCampaignId`).

---

# 9. Eventos

Nenhum Domain Event nesta versão — descoberta/atualização de uma campanha sincronizada não tem consumidor confirmado ainda (mesmo critério de `Campaign`/Marketing).

---

# 10. Regras de Negócio

01. `externalCampaignId` é obrigatório e imutável após a criação

02. `(advertisingAccountId, externalCampaignId)` é único — sincronizar a mesma campanha de novo atualiza (upsert), nunca duplica

03. `name`/`status`/`channelType`/totais são sempre sobrescritos pelo valor mais recente da API — nunca editáveis manualmente nesta versão (não é fonte de verdade, é espelho)

04. `lastSyncedAt` é sempre atualizado a cada `applySync()`

---

# 11. Permissões

`advertising.ad-accounts.manage` — mesma Permission de `AdvertisingAccount` (sincronizar/ver campanhas é parte de gerenciar a conta). Sem Permission de leitura própria nesta versão — não confirmada necessidade de granularidade separada (viria com `performance-intelligence.insights.view`, Fase 06+).

---

# 12. APIs

Nenhum endpoint próprio de listagem nesta versão — `Ad Campaign` é populado e consultado internamente pelo fluxo de sincronização (`POST /performance-intelligence/ad-accounts/:id/sync`); exposição via API própria fica para quando uma tela real precisar (Fase 12).

---

# 13. Banco

Tabela: `advertising_ad_campaigns`.

Índices: `organizationId`, `advertisingAccountId`.

Constraints: única em `(advertisingAccountId, externalCampaignId)`.

---

# 14. IA

`TODO` — Fase 06 definirá como agentes de IA consomem este objeto.

---

# 15. Automações

`TODO` — nenhum workflow de automação usa este objeto ainda.

---

# 16. Dashboards

`TODO` — Fase 12 definirá exibição.

---

# 17. Auditoria

Não implementa `Auditable` (`createdBy`/`updatedBy`) — populado por sincronização automatizada (`SyncAdvertisingAccountHandler`), nunca editado diretamente por um humano; não há "autor" de uma atualização espelhada de API externa.

---

# 18. Dependências

`services/domains/advertising` (`AdvertisingAccount`, mesmo domínio).

`kernel/integration-hub` (`GoogleAdsProvider.getCampaignPerformance`).

---

# 19. Riscos

Sem exclusão lógica/física — campanhas removidas na plataforma externa continuam no NOVARIS com `status = REMOVED` (ou equivalente). Aceitável nesta versão (histórico é útil), revisitar se volume crescer.

---

# 20. Roadmap

Fase 02 (esta missão): `create()`/`applySync()` + upsert via sincronização manual. Fase 03: consumido por `PerformanceSnapshot` para histórico diário. Fase 12: exposição em tela.

---

## Relação com Outros Módulos

- [BOM.md § 5B](../BOM.md) — entrada de catálogo correspondente
- [ADR-0060](../../../adr/ADR-0060-performance-intelligence-fase-02-google-ads-integration.md) — decisão que implementa esta especificação
- [AdvertisingAccount.md](AdvertisingAccount.md) — Aggregate proprietário da conta
- [AdGroup.md](AdGroup.md) — objeto filho
- [OBJECT_SPECIFICATION_TEMPLATE.md](../OBJECT_SPECIFICATION_TEMPLATE.md) — template seguido

## Status

🚧 Parcial (v0.1.0) — capítulos 1-13 e 17-20 completos o suficiente para desbloquear a Fase 02; capítulos 14-16 `TODO`.
