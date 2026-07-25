# OBJECT SPECIFICATION

Nome: Proposal

Categoria: Sales (Business Domain)

Versão: 1.0.0

Status: 🟢 Official — derivada do código real já congelado (`services/domains/sales/domain/entities/proposal/proposal.ts`)

---

# 1. Objetivo

Representa uma proposta comercial (`BOM.md § Proposal`). Internal Entity do Aggregate `Opportunity` — nunca existe independentemente.

---

# 2. Problema que resolve

Modelar o ciclo mínimo de aprovação de uma proposta dentro de uma negociação já em andamento, sem introduzir um Aggregate próprio para um conceito sempre contido em exatamente uma `Opportunity`.

---

# 3. Responsabilidades

- Manter seu próprio `status` (`pending`/`approved`) e a transição de aprovação (`approve()`).

---

# 4. Não Responsabilidades

- Não guarda referência a `Opportunity` (`opportunityId`) — Entity interna nunca guarda backreference ao Aggregate que a contém.
- Não publica `ProposalApproved` diretamente — disparado exclusivamente por `Opportunity.approveProposal()`, o Aggregate Root que a possui (`Entity<T>` não tem `addDomainEvent`).
- Não modela conteúdo/valor da proposta, referência a `Party`, ou vínculo com `Quotation` — nenhuma fonte confirma esses campos (`proposal.ts`, cabeçalho do próprio código).

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identidade, herdada de `Entity<T>` |
| `status` | Enum (`pending`\|`approved`) | Sim | Sempre `"pending"` na criação |
| `createdAt` | Timestamp | Sim | Gerado na criação |
| `updatedAt` | Timestamp | Sim | Atualizado por `approve()` |

**Campos deliberadamente não incluídos, por ausência de fonte**: conteúdo/termos da proposta, valor/preço (distinto de `Quotation`, `ADR-0020`), referência a `Party`, referência a `Quotation`.

---

# 6. Estados

`pending`, `approved` — 2 estados mínimos necessários para suportar o único evento já aprovado (`ProposalApproved`). Nenhuma fonte define um estado de rejeição/recusa.

---

# 7. Ciclo de Vida

```
Created (pending) — via Opportunity.submitProposal()
   ↓
approve() — via Opportunity.approveProposal() ──→ approved (terminal, sem regressão confirmada)
```

---

# 8. Relacionamentos

- **Pertence a** (Internal Entity de): `Opportunity` (via coleção `proposals: Proposal[]`, criada por `submitProposal()`).

---

# 9. Eventos

`ProposalApproved` — confirmado em `DOMAIN_MODEL.md § EVENT BUS` e `UBIQUITOUS_LANGUAGE.md`, disparado exclusivamente pelo Aggregate Root `Opportunity` (`approveProposal()`), nunca por `Proposal` diretamente. A criação de uma `Proposal` (`submitProposal()`) **não dispara nenhum evento** — nenhuma fonte confirma um evento de criação (só a aprovação tem evento nomeado).

---

# 10. Regras de Negócio

- RN001 — Uma `Proposal` já aprovada não pode ser aprovada novamente (`proposal.ts`, guarda de estado em `approve()` — inferência estrutural mínima, mesmo padrão de `Opportunity.markWon()`, não regra de negócio explícita de nenhuma fonte).

---

# 11. Permissões

`Needs Evidence`.

---

# 12. APIs

`Needs Evidence` — API Layer ainda não implementada; `Proposal` provavelmente exposta apenas através de endpoints de `Opportunity` (Entity interna, sem Repository próprio) — já refletido em `SubmitProposalResponse`/`ApproveProposalResponse` da Contracts Layer (`ENG-0095`/`ENG-0100`).

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

`Needs Evidence` — nenhuma regra específica adicional confirmada além da auditoria transversal já aplicada a `Opportunity`.

---

# 18. Dependências

`Opportunity` (Aggregate Root que a possui).

---

# 19. Riscos

Nenhum campo de conteúdo/valor confirmado — uma `Proposal` real hoje representa apenas um estado de aprovação, sem nenhum dado substantivo da proposta em si; qualquer produto real precisará dessa decisão de negócio antes de ser utilizável por um cliente final.

---

# 20. Roadmap

Implementação de Infrastructure real e primeira API — em andamento. Definição de conteúdo/valor da proposta permanece `Needs Evidence`, fora deste roadmap imediato.

---

## Relação com Outros Módulos

- [BOM.md § Proposal](../BOM.md) — entrada catalogada que esta especificação detalha
- [services/domains/sales/domain/entities/proposal/proposal.ts](../../../services/domains/sales/domain/entities/proposal/proposal.ts) — fonte exclusiva de todo campo/regra listado
- [SALES_CONTRACTS_FREEZE_V2.md](../../architecture/analysis/SALES_CONTRACTS_FREEZE_V2.md) (ENG-0118) — `SubmitProposalResponse`/`ApproveProposalResponse` já congelados sobre este objeto

## Status

🟢 Official (v1.0.0) — instância real de `OBJECT_SPECIFICATION_TEMPLATE.md`, referente ao objeto `Proposal` de `BOM.md`.
