# ADR-0015 — Knowledge Architectural Position: Absorbed into AI Transversal Intelligence Layer

## Context

`DOMAIN_MODEL.md` nomeia `KNOWLEDGE DOMAIN` como um dos 13 domínios, com "Responsável por" (Documentação, Wiki, Playbooks, Artigos) e "Objetos" (`Knowledge`, `Article`, `Playbook`, `Manual`, `Specification`, `ADR`). Desde a decisão do CTO em `ENG-0011` item 11 ("`Knowledge` permanece bloqueado até existir modelagem de domínio própria"), nenhuma fonte jamais avançou essa modelagem — `AGGREGATE_DISCOVERY.md § Knowledge` já registrava "Nenhum Aggregate Root, Entity, Value Object ou invariante é nomeado"; `IMPLEMENTATION_ROADMAP.md § 6, Risco R5` já registrava "Domínio Knowledge não tem nenhum objeto do BOM mapeável — Bloqueia o marco M12 até decisão explícita". `ENG-0024` (Domain Model Reconciliation) resolveu `CRM`/`Automation`/`AI` mas deixou `Knowledge` explicitamente como a próxima pendência recomendada. Esta ADR é a "decisão explícita" que `IMPLEMENTATION_ROADMAP.md § R5` já esperava.

## Evidence

Aplicação do mesmo método de 6 critérios/3 perguntas já usado para `Permission`, `Event Bus`, `CRM`, `Automation` e `AI`:

| Critério | Achado | Fonte |
|---|---|---|
| **Aggregate candidato** | **Nenhum.** `AGGREGATE_DISCOVERY.md § Knowledge` — "bloqueado por inteiro", nem candidato mínimo oferecido (categoria mais fraca de todo o documento, junto de `AI`/`Automation` antes de suas ADRs) | `AGGREGATE_DISCOVERY.md § 4` |
| **Objetos mapeáveis no BOM** | **Zero.** Nenhum dos 6 objetos nomeados em `DOMAIN_MODEL.md § KNOWLEDGE DOMAIN` (`Knowledge`, `Article`, `Playbook`, `Manual`, `Specification`, `ADR`) aparece em `BOM.md` — confirmado por busca direta. Pior cobertura de catálogo entre todos os domínios já avaliados (`CRM`/`Automation`/`AI` tinham ao menos 1-3 objetos com definição de 1 frase em `BOM.md`) | `BOM.md`, busca direta desta missão; `IMPLEMENTATION_ROADMAP.md § 6, Risco R5` |
| **Especificação de produto** | **Inexistente.** `specifications/` não tem pasta `knowledge/` — nem mesmo o stub vazio de 46 linhas que `CRM`/`AI`/`Automation` tinham. `PRODUCTS.md` não menciona "Knowledge" em nenhuma linha | Inspeção direta, confirmada nesta missão |
| **Presença em `NOVARIS_OS.md § 12`** (Estrutura Organizacional, fonte de `ORGANIZATION.md`) | Ausente — os 10 itens listados (`Growth`, `CRM`, `Studio`, `AI`, `Automation`, `SaaS`, `Customer Success`, `Financeiro`, `Operações`, `Comercial`) não incluem "Knowledge" | `NOVARIS_OS.md § 12` |
| **"Knowledge Base" como conceito relacionado** | `BOM.md § 6 INTELLIGENCE OBJECTS` lista `Knowledge Base` ("Base de conhecimento") **na mesma categoria de `Agent`/`Prompt`/`Memory`/`Tool`/`Embedding`** — não em categoria própria. `NOVARIS_OS.md § "NOVARIS AI"` lista `Knowledge Base` como uma das 7 features do produto `NOVARIS AI` (junto de `Agentes Inteligentes`, `Chat`, `Context Engineering`, `Prompt Engineering`, `RAG`, `Memória`, `IA Corporativa`) — duas fontes independentes concordam | `BOM.md § 6`, `NOVARIS_OS.md § "NOVARIS AI"` |
| **Mecanismo técnico já nomeado** | `AI_STRATEGY.md` tem uma seção dedicada `## RAG` (Retrieval-Augmented Generation) — o mecanismo padrão de indústria para transformar documentos (`Article`, `Playbook`, `Manual`, `Specification`) em conhecimento consultável por agentes de IA | `AI_STRATEGY.md` |
| **Governança constitucional** | `CONSTITUTION.md Artigo 13` exige que "Toda IA utilizada pela NOVARIS" deve **"Consultar documentação"** e **"Evitar respostas inventadas"** — mandato constitucional cuja única implementação plausível é uma capacidade de Knowledge Base/RAG dentro da camada de IA | `CONSTITUTION.md § Artigo 13` |
| **Classificação em fonte não-canônica** | `SYSTEM_ARCHITECTURE.md § 5` (15 Business Domains, já registrado como divergente por `DOMAIN_MODEL.md` desde a versão original) lista "Knowledge" agrupado com `HR`/`Support` — mesmo nessa fonte alternativa, tratado como função de suporte interno, não como domínio de receita central como `Sales`/`CRM` | `SYSTEM_ARCHITECTURE.md § 5` |

**Resultado do método**: `Knowledge` reprova todos os 6 critérios estruturais de Business Domain com a evidência mais fraca já encontrada nesta engenharia — nem sequer alcança o nível mínimo que `CRM`/`Automation`/`AI` tinham (um `specifications/` vazio, ao menos). Ao mesmo tempo, o próprio nome "Knowledge Base" já existe, com definição e proposta de valor, dentro da estrutura da camada transversal de IA já confirmada por `ADR-0014` — duas fontes independentes (`BOM.md`, `NOVARIS_OS.md`) já o posicionam ali, sem que esta ADR precise inventar essa associação.

## Options

### Option A — Knowledge is a Business Domain

**Rejeitada.** Zero Aggregate candidato, zero objeto mapeável no BOM, zero especificação de produto (nem mesmo o stub vazio que outros conceitos tinham) — evidência mais fraca de todas as 5 Discoveries já conduzidas nesta engenharia (`Permission`, `Event Bus`, `CRM`, `Automation`, `AI`).

### Option B — Knowledge is part of AI Intelligence Layer

**Escolhida.** Evidência convergente e independente: `BOM.md` já categoriza `Knowledge Base` como Intelligence Object; `NOVARIS_OS.md` já lista `Knowledge Base` como feature do produto `NOVARIS AI`; `AI_STRATEGY.md` já tem uma seção `RAG` dedicada ao mecanismo técnico; `CONSTITUTION.md Artigo 13` já exige que toda IA "consulte documentação" e "evite respostas inventadas" — mandato que só uma Knowledge Base/RAG cumpre. Os objetos de `Article`/`Playbook`/`Manual`/`Specification` (nomeados em `DOMAIN_MODEL.md § KNOWLEDGE DOMAIN`, mas ausentes de `BOM.md`) são lidos coerentemente como o **conteúdo-fonte** que uma Knowledge Base/RAG indexaria — documentos que, uma vez ingeridos pela camada de IA, tornam-se consultáveis por agentes, exatamente a função que `Knowledge Base` já cumpre em `BOM.md`/`NOVARIS_OS.md`.

### Option C — Knowledge is a Platform Capability

**Rejeitada.** Não existe nenhuma implementação real, nem mesmo um scaffolding em `services/kernel/` com o nome "knowledge" (diferente de `automation-runtime`/`ai-runtime`, que já existiam antes de suas respectivas ADRs) — não há base estrutural para tratá-la como uma Platform Capability isolada e nomeada. A função que ela cumpriria (indexação e consulta de documentos) já está coberta, com evidência real, pela camada de IA (`ai-runtime` + `packages/ai/`).

### Option D — Knowledge belongs to another existing Business Domain

**Considerada e rejeitada.** Nenhuma fonte associa `Article`/`Playbook`/`Manual`/`Specification`/`ADR` à linguagem ubíqua de `Sales`, `Customer`, `Marketing`, `Financial`, `System` ou qualquer outro domínio de negócio já confirmado. Diferente de `Task` (Projects, `ENG-0011` item 8) ou `Subscription` (Financial, item 7), que tinham ao menos uma fonte associando o objeto a um domínio específico, nenhum objeto de `Knowledge` tem esse tipo de sinal para nenhum domínio que não seja a camada de IA (Option B).

## Decision

**Option B.** `Knowledge` é absorvido pela **AI Transversal Intelligence Layer** já confirmada em `ADR-0014` — não é, e não será tratado como, um Business Domain independente. A capacidade "Knowledge Base" (indexação e consulta de documentação para uso por agentes de IA, via RAG) já é parte nativa da camada de IA, coberta pela mesma estrutura de três camadas de `ADR-0014`:

- **Definição**: `packages/ai/` — onde a Knowledge Base seria declarada (documentos, fontes, índices), mesmo padrão já usado para `agents/`, `prompts/`, `tools/`, `memory/`.
- **Execução**: `services/kernel/ai-runtime/` — onde a indexação/consulta (RAG) seria executada, mesma Infrastructure Capability já confirmada.
- **Governança**: `CONSTITUTION.md Artigo 13` — mandato de "consultar documentação" e "evitar respostas inventadas" que a Knowledge Base cumpre diretamente.

Os objetos `Article`, `Playbook`, `Manual`, `Specification` (nomeados em `DOMAIN_MODEL.md`, ausentes de `BOM.md`) são reclassificados como **conteúdo-fonte da Knowledge Base**, não como Entities de um domínio próprio. `ADR` permanece um termo ambíguo — coincide com o próprio artefato de decisão de arquitetura desta engenharia (`adr/`); nenhuma fonte confirma se o objeto listado em `DOMAIN_MODEL.md` se refere a esse mesmo conceito ou a outro — **não resolvido por esta ADR**, marcado como lacuna aberta.

Nenhum `services/domains/knowledge/` deve ser criado. Nenhum Aggregate, Repository ou Bounded Context com o nome "Knowledge" deve ser modelado.

## Consequences

**Positivas:**
- Resolve o Risco R5 de `IMPLEMENTATION_ROADMAP.md § 6` — o marco M12 ("Domínio Knowledge Resolvido") deixa de ser um bloqueio de domínio inexistente e passa a ser, quando priorizado, trabalho de especificação da capacidade `Knowledge Base` dentro da AI Transversal Layer.
- Última pendência nomeada de posição de domínio/produto do EPIC-007 original (`CRM`, `Automation`, `AI`, agora `Knowledge`) resolvida com evidência rastreável.
- Reforça, com um quarto caso, o padrão "Product ≠ Domain" / "Evidence Before Freeze" já nomeado em `ARCHITECTURE_GOVERNANCE.md`.

**Negativas / pendências:**
- O termo `ADR` em `DOMAIN_MODEL.md § KNOWLEDGE DOMAIN` permanece ambíguo — não resolvido por esta missão (nenhuma fonte permite confirmar se refere-se ao mesmo conceito de `adr/` desta engenharia).
- `DOMAIN_MODEL.md` continua nomeando "KNOWLEDGE DOMAIN" como um dos 13 domínios — **não alterado por esta missão**, já que `ENG-0025` não repete a autorização explícita de edição que `ENG-0024` recebeu. Divergência registrada, não corrigida no documento canônico — recomenda-se uma missão de reconciliação dedicada (mesmo padrão de `ENG-0024`), não executada aqui por disciplina de escopo.
- `IMPLEMENTATION_ROADMAP.md § 6, Risco R5` e o diagrama de cadeia (§ 3) continuam citando "Domínio Knowledge ⚠️ BLOQUEADO" — não atualizados por esta missão (fora do escopo explícito de `ENG-0025`, que não lista esse documento entre os autorizados a editar); registrado como achado.

## Domain Impact

- Nenhuma Entity, Aggregate, Value Object, Domain Event, service ou contract foi criado.
- `DOMAIN_MODEL.md` não foi alterado — sua seção "KNOWLEDGE DOMAIN" permanece divergente desta ADR, registrada não corrigida (mesmo tratamento dado a `AI`/`Automation` entre suas respectivas ADRs e `ENG-0024`).
- Os 6 objetos de `Knowledge` em `DOMAIN_OWNERSHIP.md` (`Knowledge`, `Article`, `Playbook`, `Manual`, `Specification`, `ADR`) saem de `Ownership Pending CTO Decision` — não porque um Owner de domínio foi encontrado, mas porque são reclassificados como conteúdo/capacidade da camada transversal de IA, fora do escopo de Domain Ownership tradicional (mesmo tratamento de `ADR-0013`/`ADR-0014`).
- Nenhum dos 3 Kernel Domain Capabilities (`Identity`, `Organization`, `Audit`) é afetado.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0025`, encerrando a última pendência nomeada de posição de domínio/produto do EPIC-007. Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0015-knowledge-domain-position.md`. Atualizações de referência avaliadas e aplicadas onde necessário (ver Modified files do relatório final da missão). Nenhum código, service, Entity, Aggregate ou contract criado/alterado. `DOMAIN_MODEL.md` e `IMPLEMENTATION_ROADMAP.md` não alterados — fora de escopo explícito.

## Plano de Migração

Não aplicável — nenhum código ou dado real referenciava "Knowledge" como Business Domain antes desta decisão.

## Status

Aceito

---

## Relação com Outros Módulos

- [DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md) — seção `KNOWLEDGE DOMAIN`, nomenclatura divergente, não alterada
- [BOM.md § 6](../knowledge/core/BOM.md) — categorização de `Knowledge Base` como Intelligence Object, evidência decisiva
- [NOVARIS_OS.md § NOVARIS AI](../knowledge/core/NOVARIS_OS.md) — `Knowledge Base` como feature do produto `NOVARIS AI`
- [AI_STRATEGY.md § RAG](../knowledge/core/AI_STRATEGY.md) — mecanismo técnico correspondente, ainda `TODO`
- [CONSTITUTION.md § Artigo 13](../knowledge/core/CONSTITUTION.md) — mandato constitucional cumprido pela Knowledge Base
- [knowledge/core/IMPLEMENTATION_ROADMAP.md § 6, Risco R5](../knowledge/core/IMPLEMENTATION_ROADMAP.md) — pendência resolvida por esta ADR, documento não atualizado (fora de escopo)
- [knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md](../knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md) — bloqueio original de `Knowledge`
- [knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md](../knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md) — os 6 objetos de `Knowledge`, reclassificados por esta ADR
- [ADR-0014-ai-architectural-position.md](ADR-0014-ai-architectural-position.md) — estrutura de camada transversal que absorve `Knowledge`
- [knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md](../knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md) — § 12, pendência agora resolvida
