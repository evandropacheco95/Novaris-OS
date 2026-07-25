# OBJECT SPECIFICATION

Nome: Pipeline

Categoria: Sales (Business Domain)

Versão: 1.0.0

Status: 🟢 Official — derivada do código real já congelado (`services/domains/sales/domain/aggregates/pipeline/pipeline.ts`)

---

# 1. Objetivo

Representa um fluxo de trabalho configurável — a sequência de `Stage`s que uma `Opportunity` percorre. Aggregate Root próprio do Sales Domain, classificado como **Configuration Aggregate** (mesmo padrão de `Role` no Identity Domain) — não transacional, mutação rara (`ADR-0021-pipeline-nature.md`).

---

# 2. Problema que resolve

Modelar a configuração administrativa de etapas de venda, referenciável por múltiplas `Opportunity`s, sem pertencer a nenhuma delas individualmente.

---

# 3. Responsabilidades

- Manter sua própria coleção interna de `Stage`s (`addStage()`, `findStage()`, `getStages()`).
- Garantir que nenhuma `Stage` com o mesmo id seja adicionada duas vezes (única invariante confirmada).

---

# 4. Não Responsabilidades

- Não referencia `Opportunity` de volta — a relação é unidirecional (`Opportunity → Pipeline`, nunca o contrário).
- Não valida nome único, ordem ou limite de `Stage`s — nenhuma fonte confirma essas regras (`ADR-0021 § Consequências`).
- Não implementa reordenação, remoção, ativação/desativação de `Stage` — não confirmado por nenhuma ADR.

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identidade, herdada de `AggregateRoot<T>` |
| `organizationId` | UUID (FK) | Sim | Multi-tenancy, regra transversal (`ENS-0001 § 7`) — relação `Pipeline`↔`Organization` é "candidata, não confirmada por fonte explícita" (`ADR-0021`), incluída por aplicação da regra geral |
| `createdAt` | Timestamp | Sim | Gerado na criação |
| `updatedAt` | Timestamp | Sim | Atualizado em toda mutação (ex.: `addStage()`) |

**Campos deliberadamente não incluídos, por ausência de fonte** (`pipeline.ts`, comentário do próprio código): nome/label do Pipeline (`BOM.md § Pipeline`: só "Fluxo de trabalho configurável", sem atributo textual).

---

# 6. Estados

`Needs Evidence` — nenhuma fonte confirma estados para `Pipeline` (ativo/inativo, rascunho/publicado). Não modelado.

---

# 7. Ciclo de Vida

```
Created (stages: [])
   ↓
addStage() — adiciona Stage à coleção, repetível
```

Nenhuma transição de estado além da criação e adição de `Stage`s é confirmada.

---

# 8. Relacionamentos

- **Possui** (Internal Entity, coleção própria): `Stage` (via `addStage()`, `stages: Stage[]`).
- **Referenciado por** (id, nunca o contrário): `Opportunity.pipelineId`.

---

# 9. Eventos

`Needs Evidence` — nenhuma fonte nomeia um evento próprio de `Pipeline` (diferente de `Opportunity`, que tem 3 eventos confirmados). `PipelineCreated` **não existe** em nenhuma fonte e não é criado por esta especificação — violaria "No Hidden Decisions" (`ARCHITECTURE_GOVERNANCE.md § 2`).

---

# 10. Regras de Negócio

- RN001 — Nenhuma `Stage` com o mesmo id pode ser adicionada duas vezes a um `Pipeline` (integridade estrutural de coleção, `pipeline.ts`, não regra de negócio explícita de `Sales`).

---

# 11. Permissões

`Needs Evidence` — nenhum catálogo confirmado.

---

# 12. APIs

`Needs Evidence` — API Layer ainda não implementada.

---

# 13. Banco

Ver `PRISMA_SCHEMA_SALES.md`. Convenções vinculantes: `DATABASE_ARCHITECTURE.md`.

---

# 14. IA

`Needs Evidence`.

---

# 15. Automações

`Needs Evidence`.

---

# 16. Dashboards

`Needs Evidence`.

---

# 17. Auditoria

Regra transversal já aplicada a `Organization` — nenhuma regra específica adicional confirmada.

---

# 18. Dependências

`Organization` (Kernel), `Stage` (Internal Entity do mesmo Aggregate).

---

# 19. Riscos

Nenhum campo de nome/label confirmado — uma `Pipeline` real hoje seria indistinguível de outra sem um identificador textual; risco de usabilidade, não de arquitetura, registrado para decisão futura.

---

# 20. Roadmap

Implementação de Infrastructure real e primeira API — em andamento.

---

## Relação com Outros Módulos

- [BOM.md § Pipeline](../BOM.md) — entrada catalogada que esta especificação detalha
- [services/domains/sales/domain/aggregates/pipeline/pipeline.ts](../../../services/domains/sales/domain/aggregates/pipeline/pipeline.ts) — fonte exclusiva de todo campo/regra listado
- [ADR-0021-pipeline-nature.md](../../../adr/ADR-0021-pipeline-nature.md) — decisão formal: `Pipeline` é Aggregate Root próprio (Configuration Aggregate)

## Status

🟢 Official (v1.0.0) — instância real de `OBJECT_SPECIFICATION_TEMPLATE.md`, referente ao objeto `Pipeline` de `BOM.md`.
