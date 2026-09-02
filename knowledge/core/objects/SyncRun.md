# OBJECT SPECIFICATION

------------------------------------------------------------
OBJECT NAME

Sync Run

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

Registrar cada execução de sincronização entre uma `AdvertisingAccount` e a API de uma plataforma de mídia paga externa — o que foi tentado, quando, e o resultado (sucesso/falha/contadores).

---

# 2. Problema que resolve

Sem um registro próprio de execução, não haveria como saber se uma sincronização já rodou, quando foi a última vez, se falhou e por quê, ou quantos itens foram sincronizados — informação necessária tanto para o usuário (transparência) quanto para não duplicar dado (idempotência, `ADR-0060`).

---

# 3. Responsabilidades

✔ Registrar o início e o fim de uma tentativa de sincronização de uma `AdvertisingAccount`

✔ Rastrear sucesso, falha (com motivo) e contadores de itens sincronizados (`AdCampaign`/`AdGroup`/`Keyword`/`SearchTerm`)

✔ Servir de referência (`syncRunId`) para as linhas de `SearchTerm` produzidas por ele

---

# 4. Não Responsabilidades

✘ Não executa a sincronização em si — isso é `SyncAdvertisingAccountHandler` (Application Layer), que cria e atualiza o `SyncRun`

✘ Não decide agendamento/frequência de sincronização automática — nenhuma fonte confirma isso (`TODO`, fora do escopo desta versão, que só cobre sincronização manual)

✘ Não armazena os dados sincronizados em si — isso é `AdCampaign`/`AdGroup`/`Keyword`/`SearchTerm`

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identificador interno |
| `organizationId` | UUID | Sim | `Organization` proprietária (isolamento multi-tenant) |
| `advertisingAccountId` | UUID | Sim | `AdvertisingAccount` sincronizada |
| `status` | string | Sim | `RUNNING` \| `SUCCEEDED` \| `FAILED` |
| `startedAt` | timestamp | Sim | Quando a execução começou |
| `finishedAt` | timestamp \| null | Não | Quando terminou (sucesso ou falha). `null` enquanto `RUNNING` |
| `errorMessage` | string \| null | Não | Motivo da falha, só quando `status = FAILED`. Nunca inventado — só o erro real propagado pelo `GoogleAdsProvider` ou pela camada de aplicação |
| `campaignsSynced` | integer | Sim | Contador de `AdCampaign` upsertadas nesta execução. `0` até a execução terminar |
| `adGroupsSynced` | integer | Sim | Contador de `AdGroup` upsertadas |
| `keywordsSynced` | integer | Sim | Contador de `Keyword` upsertadas |
| `searchTermsSynced` | integer | Sim | Contador de `SearchTerm` upsertadas |
| `createdAt` | timestamp | Sim | Padrão |
| `updatedAt` | timestamp | Sim | Padrão |

---

# 6. Estados

`status`: `RUNNING` (inicial) → `SUCCEEDED` ou `FAILED`. Terminal — nenhuma fonte confirma reabertura de um `SyncRun` já concluído; uma nova tentativa cria um novo `SyncRun`.

---

# 7. Ciclo de Vida

```
Criado (RUNNING, quando SyncAdvertisingAccountHandler inicia)
  ↓
Sucesso (SUCCEEDED, finishedAt + contadores preenchidos) ou Falha (FAILED, finishedAt + errorMessage)
```

---

# 8. Relacionamentos

Pertence a uma `Organization` e a uma `AdvertisingAccount` (`advertisingAccountId`).

Referenciado por `SearchTerm.syncRunId` (qual execução produziu aquela linha de métrica).

---

# 9. Eventos

Nenhum Domain Event próprio nesta versão — os eventos relevantes (`AdvertisingAccountSyncCompleted`/`AdvertisingAccountSyncFailed`) são disparados pelo Aggregate `AdvertisingAccount` (`ADR-0060`), não por `SyncRun`, mesmo critério de `Opportunity`/`Proposal` ("somente o Aggregate Root publica eventos").

---

# 10. Regras de Negócio

01. `status` deve ser um dos 3 valores definidos

02. `finishedAt` só é preenchido na transição para `SUCCEEDED`/`FAILED` — nunca na criação

03. `errorMessage` só é preenchido quando `status = FAILED`

04. Contadores nunca são negativos; começam em `0` e só aumentam durante a execução (nunca diminuem)

05. `SyncRun` é sempre `INSERT` — nunca `UPDATE` de identidade (natural key), diferente de `AdCampaign`/`AdGroup`/`Keyword`/`SearchTerm`; cada execução é um fato novo e imutável depois de concluída

---

# 11. Permissões

`advertising.ad-accounts.manage` — mesma Permission de `AdvertisingAccount` (disparar/ver sincronização é parte de gerenciar a conta). Nenhuma Permission própria criada — não confirmado que precise de granularidade separada.

---

# 12. APIs

`POST /performance-intelligence/ad-accounts/:id/sync` — dispara uma sincronização manual, cria o `SyncRun`, retorna seu estado final.

Listagem própria de `SyncRun`s não implementada nesta versão — não confirmada como necessidade real ainda.

---

# 13. Banco

Tabela: `advertising_sync_runs`.

Índices: `organizationId`, `advertisingAccountId`.

Constraints: nenhuma constraint de unicidade — múltiplos `SyncRun`s por conta são esperados (um por execução).

---

# 14. IA

`TODO` — Fase 06 definirá se agentes de IA consultam histórico de sincronização.

---

# 15. Automações

`TODO` — sincronização automática/agendada não implementada nesta versão (só manual).

---

# 16. Dashboards

`TODO` — Fase 12 definirá exibição de status de sincronização nas telas.

---

# 17. Auditoria

Não implementa `Auditable` (`createdBy`/`updatedBy`) — uma sincronização pode ser disparada automaticamente no futuro (Fase 11+), não necessariamente por um humano identificável a cada vez; a ação sensível auditada via `kernel/audit` é a **conexão** da conta (`AdvertisingAccount.connect()`), não cada sincronização individual.

---

# 18. Dependências

`services/domains/advertising` (`AdvertisingAccount`, mesmo domínio).

`kernel/integration-hub` (`GoogleAdsProvider`) — quem de fato busca os dados que populam os contadores.

---

# 19. Riscos

Sem retry automático nesta versão — uma falha exige nova sincronização manual disparada pelo usuário. Aceitável para Fase 02 (sincronização manual); Fase 11 (Learning Loop) pode revisitar isso.

---

# 20. Roadmap

Fase 02 (esta missão): `create()`/transições + `POST /sync`. Fase 11: possível retry/agendamento automático, se confirmado necessário.

---

## Relação com Outros Módulos

- [BOM.md § 5B](../BOM.md) — entrada de catálogo correspondente
- [ADR-0060](../../../adr/ADR-0060-performance-intelligence-fase-02-google-ads-integration.md) — decisão que implementa esta especificação
- [AdvertisingAccount.md](AdvertisingAccount.md) — Aggregate proprietário da conta sincronizada
- [OBJECT_SPECIFICATION_TEMPLATE.md](../OBJECT_SPECIFICATION_TEMPLATE.md) — template seguido

## Status

🚧 Parcial (v0.1.0) — capítulos 1-13 e 17-20 completos o suficiente para desbloquear a Fase 02; capítulos 14-16 `TODO`.
