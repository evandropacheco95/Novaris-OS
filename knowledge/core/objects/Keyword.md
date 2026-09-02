# OBJECT SPECIFICATION

------------------------------------------------------------
OBJECT NAME

Keyword

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

Espelhar o estado atual de uma palavra-chave configurada num `Ad Group` sincronizado, incluindo seus últimos totais de performance conhecidos.

---

# 2. Problema que resolve

Sem este objeto, não haveria como o NOVARIS analisar performance por palavra-chave (base de qualquer diagnóstico de waste/oportunidade em busca paga, Fases 05-07) nem qualidade (`qualityScore`, sinal já usado pelo Google Ads).

---

# 3. Responsabilidades

✔ Registrar a existência e o estado atual (texto, tipo de correspondência, status, quality score) de uma palavra-chave configurada

✔ Guardar os últimos totais conhecidos de custo/cliques/impressões, obtidos na sincronização mais recente

✔ Ser atualizada (upsert) a cada sincronização, sem duplicar registro para a mesma palavra-chave externa

---

# 4. Não Responsabilidades

✘ Não é `Search Term` — `Keyword` é configuração (o que foi comprado), `Search Term` é o termo de busca real que disparou o anúncio (dado de performance, `BOM.md § 5B`); distintos por definição

✘ Não guarda histórico diário — mesmo critério de `Ad Campaign` (histórico é `PerformanceSnapshot`, Fase 03)

✘ Não decide negativação/expansão — isso é Search Intelligence (Fase 07)

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identificador interno |
| `organizationId` | UUID | Sim | `Organization` proprietária |
| `advertisingAccountId` | UUID | Sim | `AdvertisingAccount` que sincronizou esta palavra-chave |
| `adGroupId` | UUID | Sim | `Ad Group` a que esta palavra-chave pertence |
| `externalCriterionId` | string | Sim | ID do critério na plataforma externa (`ad_group_criterion.criterion_id`) — natural key junto com `advertisingAccountId` |
| `text` | string | Sim | Texto da palavra-chave, como retornado pela API |
| `matchType` | string | Sim | Tipo de correspondência bruto da plataforma (ex.: `EXACT`, `PHRASE`, `BROAD`) |
| `status` | string | Sim | Status bruto da plataforma externa |
| `qualityScore` | integer \| null | Não | Índice de qualidade (1-10), quando a plataforma o disponibiliza. `null` quando não retornado (nunca inventado) |
| `lastCostMicros` | integer | Sim | Custo total (micros) na última janela sincronizada |
| `lastClicks` | integer | Sim | Cliques totais na última janela sincronizada |
| `lastImpressions` | integer | Sim | Impressões totais na última janela sincronizada |
| `lastSyncedAt` | timestamp | Sim | Quando este registro foi upsertado pela última vez |
| `createdAt` | timestamp | Sim | Padrão |
| `updatedAt` | timestamp | Sim | Padrão |

---

# 6. Estados

Não tem máquina de estados própria — `status` é valor bruto espelhado.

---

# 7. Ciclo de Vida

```
Descoberta (create(), primeira vez que aparece numa sincronização)
  ↓
Atualizada (applySync(), toda sincronização subsequente — mesmo externalCriterionId)
```

---

# 8. Relacionamentos

Pertence a uma `Organization`, uma `AdvertisingAccount` e um `Ad Group`.

Relaciona-se com `Search Term` só indiretamente (ambos pertencem ao mesmo `Ad Group`, sem referência direta entre si nesta versão — nenhuma fonte confirma um vínculo 1:1 keyword↔termo de busca).

---

# 9. Eventos

Nenhum Domain Event nesta versão — mesmo critério de `Ad Campaign`/`Ad Group`.

---

# 10. Regras de Negócio

01. `externalCriterionId` é obrigatório e imutável após a criação

02. `(advertisingAccountId, externalCriterionId)` é único — upsert, nunca duplica

03. `adGroupId` é obrigatório

04. `qualityScore`, quando presente, deve estar entre 1 e 10 (faixa documentada da API do Google Ads) — fora da faixa é rejeitado como dado inconsistente, nunca truncado silenciosamente

05. `text`/`matchType`/`status`/totais sempre sobrescritos pelo valor mais recente da API

---

# 11. Permissões

`advertising.ad-accounts.manage` — mesmo critério de `Ad Campaign`/`Ad Group`.

---

# 12. APIs

Nenhum endpoint próprio nesta versão — populado internamente pelo fluxo de sincronização.

---

# 13. Banco

Tabela: `advertising_keywords`.

Índices: `organizationId`, `advertisingAccountId`, `adGroupId`.

Constraints: única em `(advertisingAccountId, externalCriterionId)`.

---

# 14. IA

`TODO` — Fase 06/07 definirá como agentes de IA usam `qualityScore`/totais para diagnóstico de busca.

---

# 15. Automações

`TODO`.

---

# 16. Dashboards

`TODO`.

---

# 17. Auditoria

Não implementa `Auditable` — mesmo critério de `Ad Campaign`/`Ad Group`.

---

# 18. Dependências

`services/domains/advertising` (`AdvertisingAccount`, `Ad Group`, mesmo domínio).

`kernel/integration-hub` (`GoogleAdsProvider.getAdGroupsAndKeywordPerformance`).

---

# 19. Riscos

Mesmo risco de `Ad Campaign`/`Ad Group` (sem exclusão lógica) — aceitável nesta versão.

---

# 20. Roadmap

Fase 02 (esta missão): `create()`/`applySync()` via sincronização manual. Fase 07: base para Search Intelligence. Fase 12: exposição em tela.

---

## Relação com Outros Módulos

- [BOM.md § 5B](../BOM.md) — entrada de catálogo correspondente
- [ADR-0060](../../../adr/ADR-0060-performance-intelligence-fase-02-google-ads-integration.md) — decisão que implementa esta especificação
- [AdGroup.md](AdGroup.md) — objeto pai
- [SearchTerm.md](SearchTerm.md) — objeto relacionado (distinto, não é filho direto)
- [OBJECT_SPECIFICATION_TEMPLATE.md](../OBJECT_SPECIFICATION_TEMPLATE.md) — template seguido

## Status

🚧 Parcial (v0.1.0) — capítulos 1-13 e 17-20 completos o suficiente para desbloquear a Fase 02; capítulos 14-16 `TODO`.
