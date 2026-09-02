# OBJECT SPECIFICATION

------------------------------------------------------------
OBJECT NAME

Search Term

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

Business Object (Advertising Domain) — **dado de performance, não de configuração** (`BOM.md § 5B`)

# 1. Objetivo

Registrar o termo de busca real que efetivamente disparou um anúncio, junto de suas métricas (cliques, impressões, conversões, custo) para uma janela de datas sincronizada.

---

# 2. Problema que resolve

O termo de busca real do usuário frequentemente difere da `Keyword` configurada (correspondência ampla/de frase permite variações) — sem registrar o termo real, não há como detectar waste (termos irrelevantes gerando custo) nem candidatos a negativação/expansão (Fase 07, Search Intelligence).

---

# 3. Responsabilidades

✔ Registrar um termo de busca real e suas métricas para uma janela de datas sincronizada

✔ Referenciar o `Ad Group` e o `SyncRun` que o produziu

✔ Ser atualizado (upsert) quando a mesma janela de datas é sincronizada de novo — substituindo os totais, nunca somando

---

# 4. Não Responsabilidades

✘ Não é `Keyword` — `Keyword` é configuração (o que foi comprado), `Search Term` é o termo real digitado pelo usuário (`BOM.md § 5B`)

✘ Não decide classificação de intenção nem candidatos a waste/negativação — isso é Search Intelligence (Fase 07); esta versão só armazena o dado bruto

✘ Não guarda série diária — a granularidade aqui é por janela sincronizada (`dateRangeStart`/`dateRangeEnd`), não por dia; série diária real é `PerformanceSnapshot` (Fase 03), se algum dia for necessária neste nível

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identificador interno |
| `organizationId` | UUID | Sim | `Organization` proprietária |
| `advertisingAccountId` | UUID | Sim | `AdvertisingAccount` que sincronizou este termo |
| `adGroupId` | UUID | Sim | `Ad Group` em que o termo apareceu |
| `syncRunId` | UUID | Sim | `SyncRun` que produziu (ou atualizou) esta linha |
| `searchTerm` | string | Sim | Texto do termo de busca real, como retornado pela API |
| `dateRangeStart` | date | Sim | Início da janela sincronizada (ex.: `LAST_30_DAYS` → data de início) |
| `dateRangeEnd` | date | Sim | Fim da janela sincronizada |
| `clicks` | integer | Sim | Cliques na janela |
| `impressions` | integer | Sim | Impressões na janela |
| `conversions` | number | Sim | Conversões na janela |
| `costMicros` | integer | Sim | Custo (micros) na janela |
| `createdAt` | timestamp | Sim | Padrão |
| `updatedAt` | timestamp | Sim | Padrão |

---

# 6. Estados

Não tem máquina de estados — é um registro de métrica, não uma entidade com ciclo de vida próprio.

---

# 7. Ciclo de Vida

```
Sincronizado pela primeira vez (create(), janela de datas nova para este termo+grupo)
  ↓
Ressincronizado (applySync(), mesma janela sincronizada de novo — substitui métricas, nunca soma)
```

---

# 8. Relacionamentos

Pertence a uma `Organization`, uma `AdvertisingAccount`, um `Ad Group` e um `SyncRun`.

Sem relação direta com `Keyword` nesta versão (ver `Keyword.md § 8`).

---

# 9. Eventos

Nenhum Domain Event nesta versão — um registro de métrica sincronizada não tem consumidor de evento confirmado.

---

# 10. Regras de Negócio

01. `(advertisingAccountId, adGroupId, searchTerm, dateRangeStart, dateRangeEnd)` é único — ressincronizar a mesma janela **substitui** os totais (upsert), nunca soma (somar inflaria a métrica ao rodar sincronização manual repetidas vezes sobre a mesma janela)

02. `dateRangeStart` ≤ `dateRangeEnd` — janela inválida é rejeitada

03. `clicks`/`impressions`/`conversions`/`costMicros` nunca negativos

04. `syncRunId` é obrigatório — todo `Search Term` deve ser rastreável até a execução que o produziu (transparência, princípio "nunca inventar dado")

---

# 11. Permissões

`advertising.ad-accounts.manage` — mesmo critério dos demais objetos sincronizados desta versão.

---

# 12. APIs

Nenhum endpoint próprio nesta versão — populado internamente pelo fluxo de sincronização; exposição (ex.: `GET .../search-terms`) fica para quando Search Intelligence (Fase 07) ou Dashboard (Fase 12) precisar.

---

# 13. Banco

Tabela: `advertising_search_terms`.

Índices: `organizationId`, `advertisingAccountId`, `adGroupId`, `syncRunId`.

Constraints: única em `(advertisingAccountId, adGroupId, searchTerm, dateRangeStart, dateRangeEnd)`.

---

# 14. IA

`TODO` — Fase 06/07 definirá como agentes de IA classificam intenção e candidatos a waste/negativação a partir deste objeto.

---

# 15. Automações

`TODO`.

---

# 16. Dashboards

`TODO`.

---

# 17. Auditoria

Não implementa `Auditable` — populado por sincronização automatizada, mesmo critério dos demais objetos sincronizados.

---

# 18. Dependências

`services/domains/advertising` (`AdvertisingAccount`, `Ad Group`, `SyncRun`, mesmo domínio).

`kernel/integration-hub` (`GoogleAdsProvider.getSearchTerms`).

---

# 19. Riscos

Sem tratamento de termos duplicados por diferença de caixa/acentuação (`"Tubo Redondo"` vs `"tubo redondo"`) nesta versão — a API já retorna o termo normalizado da forma que ela considerar; nenhuma normalização adicional é aplicada, para não inventar transformação não confirmada.

---

# 20. Roadmap

Fase 02 (esta missão): `create()`/`applySync()` via sincronização manual. Fase 07: base para Search Intelligence. Fase 12: exposição em tela.

---

## Relação com Outros Módulos

- [BOM.md § 5B](../BOM.md) — entrada de catálogo correspondente, já registra a distinção "dado de performance, não de configuração"
- [ADR-0060](../../../adr/ADR-0060-performance-intelligence-fase-02-google-ads-integration.md) — decisão que implementa esta especificação
- [Keyword.md](Keyword.md) — objeto distinto e relacionado
- [SyncRun.md](SyncRun.md) — execução que produz cada linha
- [OBJECT_SPECIFICATION_TEMPLATE.md](../OBJECT_SPECIFICATION_TEMPLATE.md) — template seguido

## Status

🚧 Parcial (v0.1.0) — capítulos 1-13 e 17-20 completos o suficiente para desbloquear a Fase 02; capítulos 14-16 `TODO`.
