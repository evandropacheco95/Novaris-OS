# NOVARIS — Domain Canonicalization

Versão: 1.0.0

Status: 🟢 Oficial — consolidação documental, nenhuma decisão de arquitetura tomada, nenhum código

Missão: ENG-0010 (Domain Canonicalization)

Escopo: comparar sistematicamente todas as listas de domínios/produtos/Bounded Contexts/serviços já existentes na plataforma, construir uma matriz única de consolidação, e propor (sem decidir) um documento canônico por categoria. Nenhum código, módulo, contrato de domínio, Shared Kernel ou ADR foi criado/alterado. Correções documentais só foram aplicadas onde confirmado que não há impacto arquitetural (§ 7) — nenhuma foi aplicada, pelos motivos explicados ali.

---

## 1. Resumo Executivo

A plataforma tem **6 listas distintas** de domínios/produtos/Bounded Contexts, produzidas em 6 missões diferentes ao longo da sessão, nenhuma delas formalmente aposentada: `NOVARIS_OS.md § 7` (6 produtos), `NOVARIS_OS.md § 12` (10 domínios organizacionais, fonte de `ORGANIZATION.md`), `PRODUCTS.md` (9 produtos), `ORGANIZATION.md` (10, espelha `NOVARIS_OS.md § 12`), `SYSTEM_ARCHITECTURE.md § 5` (15 "Business Domains"), `DOMAIN_MODEL.md` (13 domínios DDD). A única relação já formalmente resolvida entre elas é `ADR-0007`, que separou **Product Layer** (`PRODUCTS.md`) de **Domain Layer** (`DOMAIN_MODEL.md`) — as outras quatro listas permanecem sem nenhuma decisão de precedência. Nenhuma correção de nomenclatura foi aplicada nesta missão: toda divergência encontrada, ao ser examinada, toca o corpo de um documento já declarado oficial (regra já vigente nesta sessão: corpo verbatim de documento oficial nunca é reescrito, só redirecionado) ou uma questão de produto/arquitetura genuinamente não decidida — nenhuma se qualificou como "puramente nomenclatura, sem impacto arquitetural" (§ 7).

## 2. Inventário — Todas as Listas Encontradas

| # | Documento | Categoria | Itens | Contagem |
|---|---|---|---|---|
| 1 | `NOVARIS_OS.md § 7` | Produtos | Growth, CRM, AI, Automation, Studio, SaaS | 6 |
| 2 | `NOVARIS_OS.md § 12` | Estrutura Organizacional | Growth, CRM, Studio, AI, Automation, SaaS, Customer Success, Financeiro, Operações, Comercial | 10 |
| 3 | `PRODUCTS.md` | Produtos | Growth, CRM, AI, Automation, Studio, Analytics, Projects, Marketplace, Financial | 9 |
| 4 | `ORGANIZATION.md` | Domínios Organizacionais (espelha `NOVARIS_OS.md § 12`) | Growth, CRM, Studio, AI, Automation, SaaS, Customer Success, Financeiro, Operações, Comercial | 10 |
| 5 | `SYSTEM_ARCHITECTURE.md § 5` | Business Domains | CRM, Growth, Marketing, Sales, Projects, Financial, Studio, Analytics, Automation, AI, Marketplace, Customer Success, Support, HR (futuro), Knowledge | 15 |
| 6 | `DOMAIN_MODEL.md` | Domínios (DDD/Bounded Context) | Identity, Workspace, Relationship, Sales, Activity, Project, Marketing, Knowledge, AI, Automation, Financial, Analytics, System | 13 |

**Listas adicionais, de categoria diferente (não comparadas diretamente às 6 acima)**:

| # | Documento | Categoria | Itens |
|---|---|---|---|
| 7 | `SYSTEM_ARCHITECTURE.md § 4` | Domínios do Kernel | Identity, Organizations, Permissions, Authentication, Notifications, Audit, Storage, Configuration, Events, AI Runtime, Automation Runtime, Search, Analytics Core, Logging, Monitoring, Feature Flags, Secrets, Scheduler, Realtime, Files, SDK (21) |
| 8 | `services/kernel/` (real) | Módulos de Infraestrutura/Kernel | 20 pastas confirmadas por inspeção (`KERNEL_BOUNDARY_REVIEW.md`) |
| 9 | `services/domains/` (real) | Bounded Contexts scaffolded | 6 pastas confirmadas por inspeção: `sales`, `customer`, `financial`, `marketing`, `projects`, `analytics` |
| 10 | `BOM.md` | Objetos por categoria (não por domínio) | 5 categorias: Core, Business, Intelligence, Analytics, System Objects |

## 3. Comparação Par a Par das 6 Listas Principais

| Documento A | Documento B | Diferença | Impacto | Natureza |
|---|---|---|---|---|
| `NOVARIS_OS.md § 7` (6) | `PRODUCTS.md` (9) | `PRODUCTS.md` mantém 5 dos 6 (Growth, CRM, AI, Automation, Studio), remove "SaaS", adiciona Analytics/Projects/Marketplace/Financial | `PRODUCTS.md § cabeçalho` já se autodeclara em conflito com `NOVARIS_OS.md § 7` — nenhuma resolução até esta missão | **Conflito histórico** (documento mais recente expandiu escopo sem formalmente aposentar o anterior) |
| `NOVARIS_OS.md § 7` (6) | `SYSTEM_ARCHITECTURE.md § 5` (15) | `SYSTEM_ARCHITECTURE.md` decompõe "CRM" em CRM+Sales+Customer Success+Support, e "Growth" em Growth+Marketing; adiciona Projects/Financial/Analytics/Marketplace/HR/Knowledge | Granularidade completamente diferente — não é lista concorrente, é um nível de detalhe muito mais fino do mesmo espaço conceitual | **Conflito arquitetural** (decomposição, não sinônimo) |
| `PRODUCTS.md` (9) | `SYSTEM_ARCHITECTURE.md § 5` (15) | Os 9 de `PRODUCTS.md` aparecem *integralmente* dentro dos 15 de `SYSTEM_ARCHITECTURE.md` — que adiciona Marketing, Sales, Customer Success, Support, HR, Knowledge (6 itens extras) | `SYSTEM_ARCHITECTURE.md § 5` é, na prática, um superconjunto de `PRODUCTS.md` — relação mais tratável das seis | **Conflito histórico, superconjunto claro** |
| `NOVARIS_OS.md § 12` (10) | `ORGANIZATION.md` (10) | Idênticas — `ORGANIZATION.md` é cópia declarada de `NOVARIS_OS.md § 12` | Nenhum — mesma fonte, mesmo conteúdo | **Nomenclatura/duplicação, não conflito** — `ORGANIZATION.md` é derivado, não independente |
| `NOVARIS_OS.md § 7` (6) | `NOVARIS_OS.md § 12` (10) | `§ 12` = os mesmos 6 produtos de `§ 7` + 4 itens de natureza diferente (Customer Success, Financeiro, Operações, Comercial — funções internas de empresa, não produtos) | **Mistura de categorias dentro do mesmo documento**: `§ 12` combina nomes de Produto com nomes de Departamento organizacional | **Conflito arquitetural** (categorias distintas tratadas como uma lista única) |
| `DOMAIN_MODEL.md` (13) | `PRODUCTS.md` (9) | Já resolvido — `ADR-0007` formaliza que são camadas diferentes (Domain Layer vs. Product Layer); um produto é entregue por 1+ domínios, nunca é ele mesmo um domínio | Nenhum conflito remanescente — a única relação entre listas já resolvida por ADR | **Já reconciliado (`ADR-0007`)** |
| `DOMAIN_MODEL.md` (13) | `SYSTEM_ARCHITECTURE.md § 5` (15) | Nomes parcialmente sobrepostos (AI, Automation, Analytics, Financial, Marketing, Sales/Project aparecem em ambos, com significado próximo mas não formalmente equiparado) | `ADR-0007` nunca comparou `DOMAIN_MODEL.md` contra `SYSTEM_ARCHITECTURE.md § 5` especificamente — permanece sem reconciliação | **Conflito arquitetural, não resolvido** |
| `DOMAIN_MODEL.md` (13) | `ORGANIZATION.md`/`NOVARIS_OS.md § 12` (10) | Sobreposição parcial de nomes (AI, Automation, Financial≈Financeiro), mas categorias fundamentalmente diferentes (bounded context técnico vs. estrutura de empresa) | Nenhuma fonte já comparou essas duas explicitamente | **Categorias não comparáveis diretamente — não é conflito, é eixo diferente** |

## 4. Matriz de Consolidação — os 13 Domínios de `DOMAIN_MODEL.md`

Análise específica pedida pela ordem (§ 5 da ordem de missão), incluindo os nomes adicionais citados (`Workspace`, `Organization`, `Identity`, `Audit`, `Sales`, `Customer`, `Marketing`, `Analytics`, `Financial`, `Projects`, `Knowledge`, `AI`, `Automation`):

| Nome | Status | Fonte documental | Documento canônico proposto | Observações |
|---|---|---|---|---|
| **Identity** | 🟢 Implementado | `DOMAIN_MODEL.md`; `SYSTEM_ARCHITECTURE.md § 4` (Kernel) | `IDENTITY_DOMAIN_CLOSURE.md` (implementação); `DOMAIN_MODEL.md` (modelagem) | Sem nome duplicado, sem conceito equivalente concorrente |
| **Workspace** | 🟡 Nome divergente de implementação | `DOMAIN_MODEL.md` (chama "Workspace Domain") | — **conflito não resolvido, ver abaixo** | **Nome duplicado com significado equivalente**: `DOMAIN_MODEL.md` usa "Workspace"; toda a implementação real (pasta, 14 documentos do EPIC-003) usa "Organization" |
| **Organization** | 🟢 Implementado | Pasta real `services/kernel/organizations/`; 14 documentos do EPIC-003 | `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md` (implementação) | Mesmo Bounded Context de "Workspace" (linha acima) — **conceito equivalente, nome diferente**, não dois domínios distintos |
| **Audit** | 🟡 Implementado, mas cobre só fragmento de "System" | `DOMAIN_MODEL.md` (como parte de "System Domain"); implementação real independente | `AUDIT_FINAL_ARCHITECTURE_REVIEW.md` (o que existe); `DOMAIN_MODEL.md` (o que falta, "System") | Não é duplicação — é cobertura parcial de um domínio maior nunca modelado por inteiro |
| **Sales** | 🟡 Scaffolding | `DOMAIN_MODEL.md`; `SYSTEM_ARCHITECTURE.md § 5`; `services/domains/sales/` | `DOMAIN_MODEL.md` (Domain Layer) | Aparece em 2 das 6 listas principais com o mesmo nome e significado próximo — sem conflito de nome |
| **Customer** | 🟡 Scaffolding, renomeado | `DOMAIN_MODEL.md` (chama "Relationship"); `services/domains/customer/` (`ADR-0007` renomeou) | `ADR-0007` já resolveu — "Customer" é o nome oficial da pasta, "Relationship" continua sendo o nome do domínio em `DOMAIN_MODEL.md` (documento não reescrito) | **Nome duplicado, já resolvido por ADR** — `ADR-0007 § Escolha` documenta a equivalência explicitamente |
| **Marketing** | 🟡 Scaffolding | `DOMAIN_MODEL.md`; `SYSTEM_ARCHITECTURE.md § 5`; `services/domains/marketing/` | `DOMAIN_MODEL.md` | Sem conflito de nome; objetos candidatos (`Landing Page`, `Template`, `Content`, `Audience`) citados só em `DOMAIN_MODEL.md`, ausentes de `BOM.md` |
| **Analytics** | 🟡 Scaffolding | `DOMAIN_MODEL.md`; `PRODUCTS.md`; `SYSTEM_ARCHITECTURE.md § 5`; `SYSTEM_ARCHITECTURE.md § 4` (como "Analytics Core", Kernel!); `services/domains/analytics/` | `DOMAIN_MODEL.md` (Domain Layer) | **Nome duplicado entre camadas**: "Analytics" aparece como Domain (`DOMAIN_MODEL.md`), como Product (`PRODUCTS.md`), **e** como módulo de Kernel ("Analytics Core", `SYSTEM_ARCHITECTURE.md § 4`) — já registrado em `KERNEL_MATURITY_ASSESSMENT.md § 4`, não resolvido |
| **Financial** | 🟡 Scaffolding | `DOMAIN_MODEL.md`; `PRODUCTS.md`; `SYSTEM_ARCHITECTURE.md § 5`; `ORGANIZATION.md`/`NOVARIS_OS.md § 12` (como "Financeiro") | `DOMAIN_MODEL.md` (Domain Layer) | `Subscription` (objeto) conflita com `Workspace`/`Organization` Domain (`DEC-ORG-003` já concluiu que `Subscription` pertence ao Organization/Workspace Domain, não a Financial) — **conflito arquitetural real, não resolvido** |
| **Projects** | 🟡 Scaffolding | `DOMAIN_MODEL.md` (chama "Project", singular); `PRODUCTS.md`/`SYSTEM_ARCHITECTURE.md § 5` (chamam "Projects", plural); `services/domains/projects/` | `DOMAIN_MODEL.md` | Diferença singular/plural — nomenclatura, sem impacto arquitetural, mas o corpo de `DOMAIN_MODEL.md` não pode ser reescrito para igualar (§ 7) |
| **Knowledge** | 🔴 Bloqueado | `DOMAIN_MODEL.md`; `SYSTEM_ARCHITECTURE.md § 5` | `DOMAIN_MODEL.md` — mas nenhum objeto do BOM mapeável (`IMPLEMENTATION_ROADMAP.md § 6`, Risco R5) | Sem nome duplicado; bloqueio de conteúdo, não de nomenclatura |
| **AI** | ⚪ Sem Bounded Context (só Infrastructure) | `DOMAIN_MODEL.md`; `PRODUCTS.md`; `SYSTEM_ARCHITECTURE.md § 5`; `SYSTEM_ARCHITECTURE.md § 4` (como "AI Runtime", Kernel); `NOVARIS_OS.md §§ 7, 12`; `ORGANIZATION.md` | `DOMAIN_MODEL.md` (quando houver Discovery) | **Nome duplicado entre camadas**, mesma natureza de "Analytics" acima — Domain (não modelado), Product, e módulo de Kernel (Infrastructure, `ai-runtime`) coexistem sob o mesmo nome |
| **Automation** | ⚪ Sem Bounded Context (só Infrastructure) | `DOMAIN_MODEL.md`; `PRODUCTS.md`; `SYSTEM_ARCHITECTURE.md § 5`; `SYSTEM_ARCHITECTURE.md § 4` (como "Automation Runtime", Kernel); `NOVARIS_OS.md §§ 7, 12`; `ORGANIZATION.md` | `DOMAIN_MODEL.md` (quando houver Discovery) | Mesma natureza de "AI" acima |

## 5. Verificações Específicas (pedidas pela ordem)

**Existem nomes duplicados?** Sim — 4 casos concretos: `Workspace`/`Organization` (mesmo Bounded Context, nomes diferentes entre documentação e implementação); `Analytics` (Domain + Product + módulo de Kernel); `AI` (Domain + Product + módulo de Kernel); `Automation` (Domain + Product + módulo de Kernel).

**Existem conceitos equivalentes?** Sim — `Relationship` (`DOMAIN_MODEL.md`) ≡ `Customer` (pasta real, `ADR-0007`, já formalmente resolvido); `Financeiro` (`ORGANIZATION.md`/`NOVARIS_OS.md § 12`) ≡ `Financial` (demais documentos, nunca formalmente equiparado).

**Existem documentos conflitantes?** Sim, em dois sentidos: (a) listas que descrevem o mesmo espaço conceitual com contagens/nomes diferentes (as 6 listas principais, § 3); (b) um documento que mistura duas categorias na mesma lista (`NOVARIS_OS.md § 12`/`ORGANIZATION.md`, misturando Produto e Departamento organizacional).

## 6. Documento Canônico Proposto (por categoria)

**Proposta, não decisão** — requer aprovação do CTO (§ 8):

| Categoria | Documento canônico proposto | Justificativa |
|---|---|---|
| Domain Layer (Bounded Contexts técnicos) | `DOMAIN_MODEL.md` | Único com objetos de dados reais (via `BOM.md`) e regra de dependência explícita; já usado como base em `DOMAIN_CONTEXT_MAP.md` (ENG-0009) |
| Product Layer (o que a NOVARIS vende) | `PRODUCTS.md` | Já formalizado por `ADR-0007` como a fonte da Product Layer |
| Kernel (infraestrutura compartilhada) | `services/kernel/KERNEL_BOUNDARY_REVIEW.md` | Único com classificação Domain/Infrastructure verificada por inspeção real (ENG-0007), não presumida |
| Estrutura organizacional/departamentos internos | **Nenhum proposto** | `NOVARIS_OS.md § 12`/`ORGANIZATION.md` misturam categorias (§ 5) — não deveriam ser tratados como lista de domínio/produto até serem desmembrados |
| `SYSTEM_ARCHITECTURE.md § 5` (15 Business Domains) | **Candidato a histórico/redirecionado** | Superconjunto de `PRODUCTS.md` com granularidade própria não reconciliada — decisão do CTO necessária (§ 8), não presumida aqui |

## 7. Correções Aplicadas

**Nenhuma.** Toda divergência encontrada nesta missão foi examinada contra o critério da própria ordem ("não houver mudança arquitetural" e "representar apenas sincronização de nomenclatura") e, em todos os casos, uma das duas condições falhou:

- `Workspace`/`Organization`: corrigir exigiria reescrever o corpo de `DOMAIN_MODEL.md`, um documento já declarado "🟢 Oficial" — viola a disciplina já vigente nesta sessão (documento oficial nunca tem o corpo reescrito, só redirecionado, e redirecionamento em si já é uma decisão que este documento não toma sozinho).
- `Projects`/`Project` (singular/plural): mesma restrição — tocaria o corpo de `DOMAIN_MODEL.md`.
- `Analytics`/`AI`/`Automation` como nome duplicado entre camadas: não é erro de digitação — é uma sobreposição legítima de três documentos independentes descrevendo três coisas parcialmente distintas (Domain, Product, Infrastructure) sob o mesmo rótulo; corrigir um dos três sem decidir a relação entre eles seria inventar uma resolução.
- `Financeiro`/`Financial`: mesma situação — tocaria `ORGANIZATION.md`, também já declarado oficial.

Todas registradas em § 8 para decisão do CTO, nenhuma corrigida.

## 8. Itens que Exigem Decisão do CTO

1. **Precedência entre as 6 listas** — qual (se alguma) deve ser formalmente aposentada/redirecionada, seguindo o mesmo padrão já usado para `NES/README.md` (`ADR-0009`) e `NOVARIS_CONSTITUTION.md` (`ADR-0008`).
2. **Nomenclatura `Workspace` vs. `Organization`** — qual nome é definitivo para o segundo domínio da cadeia de `DOMAIN_MODEL.md`.
3. **`Analytics`/`AI`/`Automation` como Domain vs. Product vs. Infrastructure (Kernel)** — se os três nomes devem coexistir com significados distintos e explicitamente documentados, ou se algum precisa ser renomeado.
4. **`Subscription` — Financial Domain vs. Workspace/Organization Domain** (`DEC-ORG-003` já decidiu um lado; `DOMAIN_MODEL.md` lista o objeto no outro).
5. **Desmembrar `NOVARIS_OS.md § 12`/`ORGANIZATION.md`** em duas listas (Produtos vs. Departamentos organizacionais) — hoje uma mistura ambas sem distinção.
6. **Bloqueio de `Knowledge`** (Risco R5) — nenhuma fonte tem objeto do BOM mapeável.
7. **Objetos duplicados entre domínios** (`Task`, `Queue`, `Release`) — já registrados em `DOMAIN_CONTEXT_MAP.md § 8`, reafirmados aqui.

## 9. Recomendações

- Priorizar a decisão do item 1 (precedência entre listas) antes de qualquer nova missão de Business Domain — sem ela, toda nova documentação de domínio corre o risco já descrito em `IMPLEMENTATION_ROADMAP.md § 6`, Risco R2.
- Tratar `KERNEL_BOUNDARY_REVIEW.md` e `DOMAIN_CONTEXT_MAP.md` como as duas fontes já verificadas por inspeção real (não por lista declarativa) — preferíveis como base de qualquer reconciliação futura.
- Não expandir `services/domains/` com nenhuma pasta nova até o item 3 (Analytics/AI/Automation) ser resolvido, para não repetir a sobreposição já existente.

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0010 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código; PASS nos demais.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/Domain Event criado; nenhuma decisão de domínio tomada — apenas comparação e proposta, ambas explicitamente não vinculantes até aprovação do CTO.

## Relação com Outros Módulos

- [DOMAIN_CONTEXT_MAP.md](DOMAIN_CONTEXT_MAP.md) (ENG-0009) — base direta desta consolidação, não duplicada em detalhe
- [KERNEL_BOUNDARY_REVIEW.md](../../services/kernel/KERNEL_BOUNDARY_REVIEW.md) (ENG-0007) — fonte da classificação Kernel
- [adr/ADR-0007](../../adr/ADR-0007-domain-boundaries.md) — única reconciliação já formal entre listas
- [PROJECT_RULES.md](../../PROJECT_RULES.md) — registro histórico original de cada divergência

## Status

🟢 Consolidação documental concluída (Missão ENG-0010). Nenhuma correção aplicada, nenhuma decisão de arquitetura tomada — 7 itens explícitos aguardam decisão do CTO (§ 8).
