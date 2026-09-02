# OBJECT SPECIFICATION

------------------------------------------------------------
OBJECT NAME

Ad Group

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

Espelhar o estado atual de um grupo de anúncios sincronizado de uma `Ad Campaign` externa.

---

# 2. Problema que resolve

`Keyword` pertence a um grupo de anúncios, não diretamente a uma campanha — sem este objeto, não haveria como agrupar palavras-chave corretamente nem refletir a hierarquia real da plataforma externa (`Campaign → Ad Group → Keyword`).

---

# 3. Responsabilidades

✔ Registrar a existência e o estado atual (nome, status) de um grupo de anúncios sincronizado

✔ Referenciar a `Ad Campaign` a que pertence

✔ Ser atualizado (upsert) a cada sincronização, sem duplicar registro para o mesmo grupo externo

---

# 4. Não Responsabilidades

✘ Não guarda métricas próprias — nesta versão, totais de custo/cliques ficam em `Ad Campaign`/`Keyword`, não duplicados em `Ad Group` (nenhuma fonte confirma necessidade de métrica a este nível)

✘ Não decide diagnóstico/recomendação — Fases 05-09

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identificador interno |
| `organizationId` | UUID | Sim | `Organization` proprietária |
| `advertisingAccountId` | UUID | Sim | `AdvertisingAccount` que sincronizou este grupo |
| `adCampaignId` | UUID | Sim | `Ad Campaign` a que este grupo pertence |
| `externalAdGroupId` | string | Sim | ID do grupo na plataforma externa (`ad_group.id`) — natural key junto com `advertisingAccountId` |
| `name` | string | Sim | Nome do grupo, como retornado pela API |
| `status` | string | Sim | Status bruto da plataforma externa |
| `lastSyncedAt` | timestamp | Sim | Quando este registro foi upsertado pela última vez |
| `createdAt` | timestamp | Sim | Padrão |
| `updatedAt` | timestamp | Sim | Padrão |

---

# 6. Estados

Não tem máquina de estados própria — `status` é valor bruto espelhado.

---

# 7. Ciclo de Vida

```
Descoberto (create(), primeira vez que aparece numa sincronização)
  ↓
Atualizado (applySync(), toda sincronização subsequente — mesmo externalAdGroupId)
```

---

# 8. Relacionamentos

Pertence a uma `Organization`, uma `AdvertisingAccount` e uma `Ad Campaign`.

Tem `Keyword`s (referência inversa, `Keyword.adGroupId`).

---

# 9. Eventos

Nenhum Domain Event nesta versão — mesmo critério de `Ad Campaign`.

---

# 10. Regras de Negócio

01. `externalAdGroupId` é obrigatório e imutável após a criação

02. `(advertisingAccountId, externalAdGroupId)` é único — upsert, nunca duplica

03. `adCampaignId` é obrigatório — um `Ad Group` sem campanha não é criado (invariante estrutural, mesmo critério de `Keyword` exigir `adGroupId`)

04. `name`/`status` sempre sobrescritos pelo valor mais recente da API

---

# 11. Permissões

`advertising.ad-accounts.manage` — mesmo critério de `Ad Campaign`.

---

# 12. APIs

Nenhum endpoint próprio nesta versão — populado internamente pelo fluxo de sincronização.

---

# 13. Banco

Tabela: `advertising_ad_groups`.

Índices: `organizationId`, `advertisingAccountId`, `adCampaignId`.

Constraints: única em `(advertisingAccountId, externalAdGroupId)`.

---

# 14. IA

`TODO`.

---

# 15. Automações

`TODO`.

---

# 16. Dashboards

`TODO`.

---

# 17. Auditoria

Não implementa `Auditable` — mesmo critério de `Ad Campaign` (populado por sincronização automatizada, não editado por humano).

---

# 18. Dependências

`services/domains/advertising` (`AdvertisingAccount`, `Ad Campaign`, mesmo domínio).

`kernel/integration-hub` (`GoogleAdsProvider.getAdGroupsAndKeywordPerformance`).

---

# 19. Riscos

Mesmo risco de `Ad Campaign` (sem exclusão lógica) — aceitável nesta versão.

---

# 20. Roadmap

Fase 02 (esta missão): `create()`/`applySync()` via sincronização manual. Fase 12: exposição em tela, se necessário.

---

## Relação com Outros Módulos

- [BOM.md § 5B](../BOM.md) — entrada de catálogo correspondente
- [ADR-0060](../../../adr/ADR-0060-performance-intelligence-fase-02-google-ads-integration.md) — decisão que implementa esta especificação
- [AdCampaign.md](AdCampaign.md) — objeto pai
- [Keyword.md](Keyword.md) — objeto filho
- [OBJECT_SPECIFICATION_TEMPLATE.md](../OBJECT_SPECIFICATION_TEMPLATE.md) — template seguido

## Status

🚧 Parcial (v0.1.0) — capítulos 1-13 e 17-20 completos o suficiente para desbloquear a Fase 02; capítulos 14-16 `TODO`.
