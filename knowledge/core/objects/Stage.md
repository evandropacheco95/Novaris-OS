# OBJECT SPECIFICATION

Nome: Stage

Categoria: Sales (Business Domain)

Versão: 1.0.0

Status: 🟢 Official — derivada do código real já congelado (`services/domains/sales/domain/entities/stage/stage.ts`)

---

# 1. Objetivo

Representa uma etapa nomeada dentro de um `Pipeline` (`UBIQUITOUS_LANGUAGE.md § Domínio: Sales`). Internal Entity do Aggregate `Pipeline` — nunca de `Opportunity` (`ADR-0021-pipeline-nature.md`).

---

# 2. Problema que resolve

Nomear e identificar cada etapa de um fluxo de venda, permitindo que uma `Opportunity` referencie sua posição corrente (`currentStageId`).

---

# 3. Responsabilidades

- Manter seu próprio nome (`name`), único campo confirmado por fonte.

---

# 4. Não Responsabilidades

- Não existe independentemente — sem Repository, sem Factory Method para uso fora de `Pipeline`.
- Não publica evento próprio — estende `Entity<T>`, não `AggregateRoot<T>`.
- Não guarda referência ao `Pipeline` que a contém (`pipelineId`) — mesmo padrão de `Proposal`/`Opportunity`: Entity interna nunca guarda backreference.
- Não implementa renomear ou reordenar — nenhuma fonte confirma esse comportamento.

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identidade, herdada de `Entity<T>` |
| `name` | Texto | Sim | Único campo de conteúdo confirmado — "etapa **nomeada**" (`UBIQUITOUS_LANGUAGE.md`); validação: não-vazio |

**Campos deliberadamente não incluídos, por ausência de fonte**: ordem/posição (`order`/`position`) — `Pipeline` é descrito como "a sequência de Stages que uma Opportunity percorre", implicando alguma noção de ordem, mas nenhuma fonte confirma se é campo próprio de `Stage` ou apenas posição no array; `createdAt`/`updatedAt` — omitidos deliberadamente, diferente de `Proposal`, porque sem nenhum método de mutação aprovado (só criação), um `updatedAt` nunca mudaria (seria campo morto).

---

# 6. Estados

`Needs Evidence` — nenhum estado confirmado além de existir.

---

# 7. Ciclo de Vida

```
Created (name definido, validado não-vazio)
```

Nenhuma transição além da criação.

---

# 8. Relacionamentos

- **Pertence a** (Internal Entity de): `Pipeline` (via coleção `stages: Stage[]`).
- **Referenciado por** (id, nunca embutido): `Opportunity.currentStageId`.

---

# 9. Eventos

`Needs Evidence` — nenhuma fonte nomeia um evento de criação de `Stage`. Não publicado diretamente (`Entity<T>`, sem `addDomainEvent`).

---

# 10. Regras de Negócio

- RN001 — `name` não pode ser vazio (validação definicional: "etapa **nomeada**", `UBIQUITOUS_LANGUAGE.md` — não é regra de negócio inventada, é condição de existência do conceito).

---

# 11. Permissões

`Needs Evidence`.

---

# 12. APIs

`Needs Evidence` — API Layer ainda não implementada; `Stage` provavelmente exposta apenas através de endpoints de `Pipeline` (Entity interna, sem Repository próprio).

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

`Needs Evidence` — nenhuma regra específica confirmada para `Stage` isoladamente (auditoria de `Pipeline` cobriria mudanças em sua coleção de `Stage`s).

---

# 18. Dependências

`Pipeline` (Aggregate Root que a possui).

---

# 19. Riscos

Ausência de campo de ordem explícito pode dificultar exibir `Stage`s na sequência correta em uma futura UI — dependente da ordem de inserção no array, não de um campo persistido.

---

# 20. Roadmap

Implementação de Infrastructure real e primeira API — em andamento.

---

## Relação com Outros Módulos

- [BOM.md § Stage](../BOM.md) — entrada catalogada que esta especificação detalha
- [services/domains/sales/domain/entities/stage/stage.ts](../../../services/domains/sales/domain/entities/stage/stage.ts) — fonte exclusiva de todo campo/regra listado
- [ADR-0021-pipeline-nature.md](../../../adr/ADR-0021-pipeline-nature.md) — decisão formal: `Stage` é Entity interna de `Pipeline`

## Status

🟢 Official (v1.0.0) — instância real de `OBJECT_SPECIFICATION_TEMPLATE.md`, referente ao objeto `Stage` de `BOM.md`.
