# NOVARIS — Product × Domain Architecture Reconciliation

Versão: 1.0.0

Status: 🟡 ARCHITECTURE REQUIRES ADDITIONAL DECISIONS — reconciliação documental, nenhuma decisão de arquitetura nova

Missão: ENG-0016 (Product × Domain Reconciliation)

Escopo: separar oficialmente Produtos, Bounded Contexts, Shared Kernel e Infrastructure Capabilities, usando exclusivamente evidência documental já existente. Nenhum código, módulo, ADR ou `DOMAIN_MODEL.md` foi alterado.

---

## 1. Resumo Executivo

Dos **9 produtos** de `PRODUCTS.md`, **4 não têm nenhum Domain Model próprio** (`Growth`, `Studio`, `Marketplace` — confirmado por `ADR-0007`; `AI`/`Automation` — domínio citado, mas não confirmado como Business Domain, decisão do CTO `ENG-0011`). `CRM`, o caso que motivou esta missão (`ENG-0015`), **não tem domínio próprio** — `DOMAIN_MODEL.md` já declara textualmente que sua funcionalidade é distribuída entre `Relationship`(`Customer`)/`Sales`/`Activity`. Dos **13 domínios** de `DOMAIN_MODEL.md`, **4 não pertencem claramente a nenhum produto** (`Identity`, `Organization`/`Workspace`, `Audit`/`System`, `Knowledge`) — os três primeiros por serem infraestrutura compartilhada entre todos os produtos (Kernel), o último por estar bloqueado e não ser citado por nenhum produto. As **9 especificações de produto** (`specifications/*/`) são **idênticas em vazio**: 46 linhas totais cada, 9 de 10 arquivos como stub de 3 linhas — nenhum produto tem conteúdo real. Conclusão: **ARCHITECTURE REQUIRES ADDITIONAL DECISIONS**.

## 2. Inventário de Produtos

Base: `PRODUCTS.md` (9, já formalizado como fonte de Product Layer por `ADR-0007`).

| Produto | Objetivo (fonte) | Status | Documentação |
|---|---|---|---|
| `Growth` | Diagnóstico empresarial, estratégia, comercial, marketing, performance, consultoria (`NOVARIS_OS.md § 7`) | 🚧 Vazio | `specifications/growth/` — 46 linhas totais, `TODO` |
| `CRM` | Gestão comercial, pipeline, leads, agenda, negócios, propostas (`NOVARIS_OS.md § 7`) | 🚧 Vazio | `specifications/crm/` — 46 linhas totais, `TODO` |
| `AI` | Agentes, chat, knowledge base, context/prompt engineering (`NOVARIS_OS.md § 7`) | 🚧 Vazio | `specifications/ai/` — 46 linhas totais, `TODO` |
| `Automation` | n8n, Make, integrações, webhooks (`NOVARIS_OS.md § 7`) | 🚧 Vazio | `specifications/automation/` — 46 linhas totais, `TODO` |
| `Studio` | Landing pages, sites, dashboards, portais, design system (`NOVARIS_OS.md § 7`) | 🚧 Vazio | `specifications/studio/` — 46 linhas totais, `TODO` |
| `Analytics` | (não descrito em `NOVARIS_OS.md § 7` — só em `PRODUCTS.md`) | 🚧 Vazio | `specifications/analytics/` — 46 linhas totais, `TODO` |
| `Projects` | (não descrito em `NOVARIS_OS.md § 7` — só em `PRODUCTS.md`) | 🚧 Vazio | `specifications/projects/` — 46 linhas totais, `TODO` |
| `Marketplace` | (não descrito em `NOVARIS_OS.md § 7` — só em `PRODUCTS.md`) | 🚧 Vazio | `specifications/marketplace/` — 46 linhas totais, `TODO` |
| `Financial` | (não descrito em `NOVARIS_OS.md § 7` — só em `PRODUCTS.md`) | 🚧 Vazio | `specifications/financial/` — 46 linhas totais, `TODO` |

**Nota**: `NOVARIS_OS.md § 7` lista só 6 produtos (os 6 acima menos `Analytics`/`Projects`/`Marketplace`/`Financial`, mais `SaaS` — que `PRODUCTS.md` não lista). `ORGANIZATION.md`/`NOVARIS_OS.md § 12` mistura 6 desses nomes com 4 departamentos internos (`Customer Success`, `Financeiro`, `Operações`, `Comercial`) — excluídos desta análise por não serem produtos (já registrado em `DOMAIN_CANONICALIZATION.md §§ 3, 5`).

## 3. Inventário de Bounded Contexts (Domain Layer)

Base: `DOMAIN_MODEL.md` (13, canônico por decisão do CTO, `ENG-0011` item 1).

| Domínio | Status | Produto(s) associado(s) |
|---|---|---|
| Identity | 🟢 Implementado (Kernel) | Nenhum — infraestrutura compartilhada |
| Organization (`Workspace` legado) | 🟢 Implementado (Kernel) | Nenhum — infraestrutura compartilhada |
| Relationship (`Customer`) | 🟡 Scaffolding | `CRM` (parcial), `Growth` (parcial) |
| Sales | 🟡 Scaffolding | `CRM` (parcial), `Growth` (parcial) |
| Activity | ⚪ Future | `CRM` (parcial) |
| Project (`Projects`) | 🟡 Scaffolding | `Projects` (mesmo nome) |
| Marketing | 🟡 Scaffolding | `Growth` (parcial) |
| Knowledge | 🔴 Bloqueado | Nenhum — nenhum dos 9 produtos o cita |
| AI | ⚪ Não confirmado como Business Domain | `AI` (mesmo nome, mas domínio ainda não existe) |
| Automation | ⚪ Não confirmado como Business Domain | `Automation` (mesmo nome, mas domínio ainda não existe) |
| Financial | 🟡 Scaffolding | `Financial` (mesmo nome) |
| Analytics | 🟡 Scaffolding | `Analytics` (mesmo nome), `Growth` (parcial) |
| System (`Audit`, parcial) | 🟡 Parcialmente implementado (Kernel) | Nenhum — infraestrutura compartilhada |

## 4. Matriz Produto × Domínio × Kernel × Infraestrutura

```
Produto           →  Bounded Context(s)              →  Depende de (Kernel/Shared)
──────────────────────────────────────────────────────────────────────────────────
Growth            →  Sales + Customer + Marketing     →  Identity, Organization
                      + Analytics (composição,
                      ADR-0007 — SEM domínio próprio)
CRM               →  Customer + Sales + Activity      →  Identity, Organization
                      (composição, DOMAIN_MODEL.md —
                      SEM domínio próprio)
AI                →  "AI" (domínio NÃO confirmado —   →  Identity (via ai-runtime,
                      hoje só ai-runtime, Infra)           Infrastructure Capability)
Automation        →  "Automation" (domínio NÃO        →  Identity (via automation-
                      confirmado — hoje só                 runtime, Infrastructure)
                      automation-runtime, Infra)
Studio            →  NENHUM domínio (ADR-0007:         →  Não determinável
                      "Studio não é domínio")
Analytics         →  Analytics (Domain, Supporting)    →  Identity, Organization
Projects          →  Project/Projects (Domain)         →  Identity, Organization
Marketplace       →  NENHUM domínio ainda criado        →  Não determinável
                      (ADR-0007: "futuro domínio de
                      Marketplace ainda não criado")
Financial         →  Financial (Domain)                →  Identity, Organization

                                    ↓
                        Shared Kernel (packages/shared-kernel)
                                    ↓
        Infrastructure Capabilities (services/kernel/):
        Event Bus, Logging, Storage, Integration Hub, Files,
        Notifications, Realtime, Search, Monitoring, Scheduler,
        ai-runtime, automation-runtime
```

`Identity`, `Organization`, `Audit`(`System`, parcial) não aparecem como "Bounded Context de" nenhum produto — são consumidos por todos, nunca donos de um produto específico.

## 5. Mapa Geral da Plataforma

```
┌─────────────────────────────────────────────────────────┐
│ Produtos (Product Layer, PRODUCTS.md) — 9, todos vazios  │
│ Growth, CRM, AI, Automation, Studio, Analytics,          │
│ Projects, Marketplace, Financial                         │
└─────────────────────────────────────────────────────────┘
                          │ entregues por (1+ domínios cada, nunca 1:1)
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Bounded Contexts de Negócio (Domain Layer, DOMAIN_MODEL) │
│ Customer, Sales, Activity, Projects, Marketing,          │
│ Financial, Analytics (scaffolding); Knowledge (bloqueado)│
│ AI, Automation (não confirmados como Business Domain)    │
└─────────────────────────────────────────────────────────┘
                          │ referenciam por id
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Domain Capabilities do Kernel (implementadas)            │
│ Identity, Organization, Audit                            │
└─────────────────────────────────────────────────────────┘
                          │ reutilizam
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Shared Kernel (packages/shared-kernel)                   │
└─────────────────────────────────────────────────────────┘

Infrastructure Capabilities (services/kernel/, transversal a todas
as camadas acima): Event Bus, Logging, Storage, Integration Hub,
Files, Notifications, Realtime, Search, Monitoring, Scheduler,
ai-runtime, automation-runtime.
```

## 6. Conflitos

1. **`CRM`** (já identificado em `ENG-0015`): tratado como se tivesse domínio próprio (`ENG-0011` item 9, `Queue` → `CRM`) quando `DOMAIN_MODEL.md` nega explicitamente sua existência como domínio — reafirmado, não resolvido.
2. **`AI`/`Automation`**: produtos nomeados com o mesmo nome de um domínio de `DOMAIN_MODEL.md` — mas o domínio não é confirmado como Business Domain (`ENG-0011` item 6). Um produto não pode ser "entregue" por um domínio que ainda não existe formalmente — mesma classe de conflito de `CRM`, em grau menor (aqui ao menos a intenção de nomenclatura é consistente, só a confirmação falta).
3. **`Studio`**: produto sem nenhum domínio, nem mesmo como composição — `ADR-0007` só afirma que não é domínio, nunca diz quais domínios o entregariam. Diferente de `Growth`/`CRM` (que têm composição já citada) e de `Marketplace` (que ao menos tem "futuro domínio" citado) — `Studio` é o único produto **completamente órfão** de qualquer domínio, mesmo como composição.

## 7. Lacunas

- Nenhum dos 9 produtos tem especificação real (`specifications/*/`, 46 linhas cada, 100% `TODO`).
- `Knowledge` não é citado por nenhum dos 9 produtos — bloqueado e órfão em ambas as direções.
- `Studio` não tem nenhuma composição de domínio citada em nenhuma fonte.
- `Marketplace` depende de um domínio "ainda não criado" (`ADR-0007`) — sem nenhum progresso desde então.

## 8. Recomendações

- Resolver o conflito de `CRM` (§ 6, item 1) antes de qualquer implementação que cite "CRM" como se fosse um domínio.
- Confirmar `AI`/`Automation` como Business Domain (ou não) antes de qualquer especificação de produto ser escrita para eles — sem isso, a especificação não teria bounded context para se apoiar.
- Definir explicitamente quais domínios entregariam `Studio` — hoje não há nenhuma composição, nem mesmo hipotética.
- Avaliar se `Marketplace` deve permanecer sem domínio até ser genuinamente necessário, ou se merece uma Discovery formal antecipada (mesmo padrão já usado para `CRM`).
- Priorizar o preenchimento de pelo menos uma especificação de produto real (`overview.md`/`features.md`) para validar se o processo de Product Layer consegue, de fato, referenciar Bounded Contexts já existentes (`Customer`/`Sales`/`Financial`/`Projects`/`Analytics`) sem inventar conteúdo novo.

## 9. Itens para Futura Expansão

- Uma "Discovery de Produto" formal (paralela à Discovery de domínio já em uso) para cada um dos 9 produtos, decidindo explicitamente sua composição de domínios antes de qualquer especificação.
- Uma ADR resolvendo formalmente o status de `CRM` (produto puro vs. domínio) — decisão que este documento não toma.
- Avaliação de se `Studio`/`Marketplace` justificam algum domínio técnico próprio no futuro, ou permanecem inteiramente compostos por domínios de Infrastructure/Interface Layer (ex.: `Studio` pode ser inteiramente Interface/Application Layer sobre domínios já existentes, sem Domain Layer próprio — hipótese, não confirmada).

## 10. Conclusão

# ARCHITECTURE REQUIRES ADDITIONAL DECISIONS

**Justificativa, baseada exclusivamente em evidência documental**: dos 9 produtos, 4 não têm nenhum domínio confirmado que os entregue (`Growth`/`Studio`/`Marketplace` sem domínio; `AI`/`Automation` com domínio não confirmado) e 1 (`CRM`) tem um conflito ativo entre a decisão do CTO e o documento canônico do Domain Layer. Nenhuma especificação de produto tem conteúdo real. Prosseguir para implementação de qualquer produto hoje exigiria decidir, ad-hoc e sem base documental, exatamente as questões que esta reconciliação já identificou — o que violaria a disciplina desta engenharia de nunca inventar decisão de domínio ou de produto.

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0016 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código; PASS nos demais.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object criado; `DOMAIN_MODEL.md` não alterado; nenhum ADR alterado; todo conflito registrado, nenhum resolvido.

## Relação com Outros Módulos

- [../analysis/CRM_DOMAIN_DISCOVERY.md](../analysis/CRM_DOMAIN_DISCOVERY.md) (ENG-0015) — origem do conflito de `CRM`, generalizado aqui para os demais 8 produtos
- [../DOMAIN_CANONICALIZATION.md](../DOMAIN_CANONICALIZATION.md) (ENG-0010), [../CONTEXT_RELATIONSHIPS.md](../CONTEXT_RELATIONSHIPS.md) (ENG-0011) — base das 6 listas e das decisões do CTO
- [DOMAIN_OWNERSHIP.md](DOMAIN_OWNERSHIP.md) (ENG-0012), [AGGREGATE_DISCOVERY.md](AGGREGATE_DISCOVERY.md) (ENG-0013) — inventário de conceitos e Aggregates candidatos
- [adr/ADR-0007](../../../adr/ADR-0007-domain-boundaries.md) — fonte da distinção Product/Domain Layer e das citações sobre `Studio`/`Marketplace`

## Status

🟡 Reconciliação concluída (Missão ENG-0016). `ARCHITECTURE REQUIRES ADDITIONAL DECISIONS` — 3 conflitos e 4 lacunas registrados, nenhum resolvido. Nenhum código, módulo, ADR ou `DOMAIN_MODEL.md` alterado.
