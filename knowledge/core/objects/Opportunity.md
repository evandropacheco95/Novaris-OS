# OBJECT SPECIFICATION

Nome: Opportunity

Categoria: Sales (Business Domain)

Versão: 1.0.0

Status: 🟢 Official — primeira instância real de `OBJECT_SPECIFICATION_TEMPLATE.md` para o Sales Domain, derivada do código real já congelado (`services/domains/sales/domain/aggregates/opportunity/opportunity.ts`)

---

# 1. Objetivo

Representa uma negociação em andamento com um `Party` — o Aggregate Root do Sales Domain, confirmado desde `SALES_AGGREGATE_DESIGN.md` (ENG-0034) e nunca em disputa (`DOMAIN_OWNERSHIP.md § 3`).

---

# 2. Problema que resolve

Rastrear o estado e a evolução de uma oportunidade comercial — sua etapa atual no `Pipeline`, seu vínculo com um `Party`, seu desfecho (ganha/perdida) e as `Proposal`s associadas — como fronteira transacional única.

---

# 3. Responsabilidades

- Manter seu próprio estado (`status`: `open`/`won`/`lost`) e as transições permitidas.
- Manter a referência (por id) ao `Pipeline` e à `Stage` corrente.
- Criar e gerenciar a coleção interna de `Proposal`s (Internal Entities).
- Publicar os Domain Events confirmados de sua própria mudança de estado.

---

# 4. Não Responsabilidades

- Não possui `Party`, `Pipeline` ou `Stage` — apenas referencia por id (`partyId`, `pipelineId`, `currentStageId`).
- Não valida dados de `Party` (fora do Bounded Context de `Relationship`/`Customer`).
- Não persiste a si mesma — isso é responsabilidade do `OpportunityRepository`.
- Não calcula `Revenue`, não gera `Quotation`/`Contract` — nenhum desses conceitos tem forma confirmada em nenhuma fonte (`SALES_DOMAIN_COMPLETION_AUDIT.md § 10`).

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identidade, herdada de `AggregateRoot<T>` |
| `organizationId` | UUID (FK) | Sim | Multi-tenancy, regra transversal (`ENS-0001 § 7`) |
| `partyId` | UUID (FK) | Sim | Referência ao `Party` (`Relationship`/`Customer` Domain) — nunca embutido |
| `pipelineId` | UUID (FK) | Não | Referência ao `Pipeline` — opcional, `Needs Evidence` se obrigatório na criação |
| `currentStageId` | UUID (FK) | Não | Referência à `Stage` corrente — opcional na criação, obrigatório após `advanceStage()` |
| `status` | Enum (`open`\|`won`\|`lost`) | Sim | Sempre `"open"` na criação |
| `createdAt` | Timestamp | Sim | Gerado na criação |
| `updatedAt` | Timestamp | Sim | Atualizado em toda mutação |

**Campos deliberadamente não incluídos, por ausência de fonte** (`SALES_DOMAIN_COMPLETION_AUDIT.md § 10`): valor/receita da negociação, data de fechamento prevista, prioridade, responsável (`User`)/dono da oportunidade, `Quotation`, `Contract`.

---

# 6. Estados

`open`, `won`, `lost` — 3 estados confirmados (`OpportunityStatus`, `opportunity.ts` linha 61). `won`/`lost` são terminais — nenhuma fonte confirma retorno a `open` (`SALES_AGGREGATE_DESIGN.md § 6`, "inferido, não confirmado").

---

# 7. Ciclo de Vida

```
Created (open)
   ↓
advanceStage() — muda currentStageId, permanece open
   ↓
submitProposal() — adiciona Proposal interna, permanece open
   ↓
markWon() ──→ won (terminal)
   ou
markLost() ──→ lost (terminal)
```

---

# 8. Relacionamentos

- **Referencia** (por id, nunca embute): `Party` (`partyId`), `Pipeline` (`pipelineId`), `Stage` (`currentStageId`).
- **Possui** (Internal Entity, coleção própria): `Proposal` (via `submitProposal()`/`addProposal()`, `proposals: Proposal[]`).
- **Não relaciona** (fora de escopo, sem fonte): `Activities`, `Tasks`, `Contract` — citados em `BOM.md § Opportunity` como candidatos, nunca confirmados estruturalmente (`SALES_DOMAIN_COMPLETION_AUDIT.md § 10`).

---

# 9. Eventos

- `OpportunityCreated` — disparado por `Opportunity.create()`.
- `OpportunityWon` — disparado por `markWon()`.
- `OpportunityLost` — disparado por `markLost()`.

Confirmados em `DOMAIN_MODEL.md § EVENT BUS` e `BOM.md § Opportunity`. `advanceStage()` e `submitProposal()` **não disparam evento próprio** — nenhuma fonte confirma um evento para essas transições (`opportunity.ts`, comentários da própria implementação).

---

# 10. Regras de Negócio

- RN001 — `status` só transiciona de `open` para `won` ou `lost`, nunca o contrário (inferência estrutural, não regra de negócio explícita).
- RN002 — `advanceStage()`/`submitProposal()`/`approveProposal()` só são permitidos com `status = "open"` (`opportunity.ts`, guarda de estado em `advanceStage()`).
- RN003 — Toda `Opportunity` pertence a exatamente uma `Organization` (`organizationId` obrigatório).

---

# 11. Permissões

`Needs Evidence` — nenhuma fonte (`DOMAIN_MODEL.md`, `BOM.md`, código real) confirma um catálogo de permissões específico para `Opportunity`. Não inventado aqui.

---

# 12. APIs

`Needs Evidence` — a API Layer do Sales Domain ainda não foi implementada (próxima fase do roadmap, após a Infrastructure real). Nenhum endpoint existe hoje.

---

# 13. Banco

Ver `PRISMA_SCHEMA_SALES.md` (a ser criado nesta mesma sequência de trabalho) para o mapeamento físico completo — tabela, índices, constraints, RLS. Convenções vinculantes: `knowledge/core/DATABASE_ARCHITECTURE.md` (snake_case, UUID v4, soft delete via `deleted_at`, `organization_id NOT NULL`, RLS `organization_id = auth.organization_id`).

---

# 14. IA

`Needs Evidence` — nenhuma fonte confirma uso de IA sobre `Opportunity` hoje.

---

# 15. Automações

`Needs Evidence` — nenhuma automação confirmada.

---

# 16. Dashboards

`Needs Evidence` — nenhum KPI confirmado para `Opportunity` em `NOVARIS_OS.md`/`BUSINESS_MODEL.md` (ambos `TODO` para este objeto).

---

# 17. Auditoria

Segue a regra transversal já aplicada a `Organization` (`objects/Organization.md § Auditoria`) — nenhuma regra específica adicional confirmada para `Opportunity`.

---

# 18. Dependências

`Party` (`Relationship`/`Customer` Domain), `Pipeline`/`Stage` (mesmo domínio, `Sales`), `Organization` (Kernel).

---

# 19. Riscos

`Opportunity.partyId` já referencia `Party`, que ainda não tem Aggregate implementado em código (`RELATIONSHIP_AGGREGATE_DESIGN.md`, ENG-0119) — risco de integridade referencial não imposta em banco até `Party` existir como tabela real; mitigação: FK com `ON DELETE RESTRICT`/validação em nível de aplicação até lá.

---

# 20. Roadmap

Implementação de Infrastructure real (Prisma + Postgres/Supabase) e primeira API — em andamento nesta mesma sequência de trabalho.

---

## Relação com Outros Módulos

- [BOM.md § Opportunity](../BOM.md) — entrada catalogada que esta especificação detalha
- [services/domains/sales/domain/aggregates/opportunity/opportunity.ts](../../../services/domains/sales/domain/aggregates/opportunity/opportunity.ts) — fonte exclusiva de todo campo/evento/regra listado
- [SALES_AGGREGATE_DESIGN.md](../../architecture/analysis/SALES_AGGREGATE_DESIGN.md) (ENG-0034), [SALES_TECHNICAL_BLUEPRINT.md](../../architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) (ENG-0036) — design tático e técnico já congelados
- [SALES_CONTRACTS_FREEZE_V2.md](../../architecture/analysis/SALES_CONTRACTS_FREEZE_V2.md) (ENG-0118) — Contracts Layer já congelada sobre este objeto

## Status

🟢 Official (v1.0.0) — segunda instância real de `OBJECT_SPECIFICATION_TEMPLATE.md`, referente ao objeto `Opportunity` de `BOM.md`.
