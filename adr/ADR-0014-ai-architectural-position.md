# ADR-0014 — AI Architectural Position: Transversal Intelligence Layer

## Context

`ENG-0011` (decisão formal do CTO, item 6) declarou conjuntamente: *"`AI` e `Automation` NÃO são Business Domains neste momento... permanece Future Domain."* `ADR-0013` (ENG-0022) já resolveu o lado `Automation` dessa frase, com Discovery formal completa, concluindo Platform Capability. `AI` é o único item remanescente — e, ao contrário de `Automation`, a evidência reunida por esta missão mostra que `AI` não se encaixa limpamente nem em "Business Domain" nem em "Infrastructure Capability" simples: tem uma natureza estrutural própria, deliberadamente transversal, já expressa em pelo menos três fontes independentes antes mesmo desta ADR existir.

`DOMAIN_MODEL.md` nomeia `AI DOMAIN` como um dos 13 domínios, com "Responsável por" (Agentes, Prompts, Contexto, Memória, Ferramentas, Embeddings) e "Objetos" (`Agent`, `Prompt`, `Memory`, `Context`, `Embedding`, `Tool`, `Decision`, `Insight`, `Recommendation`) — mesma presença estrutural de qualquer outro domínio nomeado, inclusive `Automation` antes de `ADR-0013`.

`NOVARIS_OS.md § 18` (documento oficial da visão da plataforma) declara, em prosa, algo que nenhum outro domínio/produto desta engenharia recebeu: **"A IA participa de todas as camadas do sistema"**, seguido de uma lista de 9 áreas onde ela atua (`CRM`, `Marketing`, `Comercial`, `Financeiro`, `Suporte`, `Projetos`, `Customer Success`, `Analytics`, `Automações`) — misturando deliberadamente itens de Product Layer e de Domain Layer, sem tratar `AI` como uma 10ª área isolada na mesma lista.

`CONSTITUTION.md Artigo 13 — Inteligência Artificial` impõe 7 regras de comportamento (explicar decisões, utilizar contexto, consultar documentação, evitar respostas inventadas, preservar segurança, registrar ações importantes, nunca substituir validações críticas) que se aplicam a **"Toda IA utilizada pela NOVARIS"** — redação idêntica em escopo à do Artigo 12 (Segurança, "Todos os módulos devem utilizar..."), ou seja, uma regra constitucional que atravessa toda a plataforma, não uma regra de um domínio específico.

A implementação real de "AI" já existe em duas camadas distintas, únicas entre todas as capacidades desta engenharia: `packages/ai/` (`agents/`, `prompts/`, `tools/`, `memory/` — estrutura de **definição**, package-level, mesmo padrão arquitetural do Shared Kernel) e `services/kernel/ai-runtime/` (**execução** controlada — "todo acesso de agentes a dados passa por aqui", já classificado por `KERNEL_BOUNDARY_REVIEW.md` como Infrastructure Capability). Nenhuma outra capacidade desta engenharia — nem `Automation`, nem `Event Bus` — tem essa divisão explícita definição/execução em dois locais do monorepo.

**Achado colateral**: `packages/ai/README.md` cita `"NOVARIS_CONSTITUTION.md Article XII"` como fonte do controle de acesso a dados — referência dupla incorreta: (a) aponta para `NOVARIS_CONSTITUTION.md`, documento histórico redirecionado por `ADR-0008` (Foundation Freeze), não para `CONSTITUTION.md` (canônico); (b) o artigo correto sobre IA é o **13**, não o **XII** (Artigo 12 é Segurança). `AI_PLAYBOOK.md` já cita corretamente `CONSTITUTION.md § Artigo 13`. Registrado como achado, não corrigido — fora do escopo desta missão (que não modifica `packages/ai/README.md`).

## Problem Statement

"AI" é nomeada, em fontes diferentes, de três formas incompatíveis entre si: um domínio de 13 em `DOMAIN_MODEL.md`; uma capacidade que "participa de todas as camadas do sistema" em `NOVARIS_OS.md`; e uma Infrastructure Capability de execução (`ai-runtime`) segundo `KERNEL_BOUNDARY_REVIEW.md`. Sem uma decisão formal, qualquer trabalho futuro de especificação de produto ou de domínio que cite "AI" não tem base para saber se está criando um Bounded Context, consumindo uma Infrastructure Capability, ou usando uma capacidade cross-cutting com regras constitucionais próprias.

**Pergunta a decidir**: qual é a posição arquitetural formal de "AI" — Business Domain (A), Platform Capability (B), Infrastructure Capability (C), ou uma camada transversal de inteligência, distinta das três anteriores (D)?

## Evidence

Aplicação do mesmo método de 6 critérios/3 perguntas já usado para `Permission`, `Event Bus`, `CRM` e `Automation`:

| Critério | Achado | Fonte |
|---|---|---|
| **Linguagem ubíqua própria** | Seção dedicada "Domínio: AI" existe, com 9 termos — mas cada um com definição de 1 frase (`BOM.md`), sem atributo, sem invariante | `UBIQUITOUS_LANGUAGE.md`, `BOM.md § 6 Intelligence Objects` |
| **Aggregate candidato** | **Nenhum.** `AGGREGATE_DISCOVERY.md § AI` — `Aggregate Pending Discovery`, nenhum candidato oferecido, mesma categoria de `Knowledge`/`Automation` (pré-`ADR-0013`) | `AGGREGATE_DISCOVERY.md § 3` |
| **Value Object candidato** | Nenhum documentado | — |
| **Ciclo de vida / regra de negócio** | Nenhum documentado — `AI_STRATEGY.md` e `AI_PLAYBOOK.md` são 100% `TODO`, sem exceção, em todas as 12 e 8 seções respectivamente | `AI_STRATEGY.md`, `AI_PLAYBOOK.md` |
| **Especificação de produto** | `specifications/ai/` — 46 linhas totais, 9 de 10 arquivos como stub de 3 linhas, `TODO` — mesma emptiness já confirmada para `CRM`/`Automation` | Inspeção direta, confirmada nesta missão |
| **Decisão prévia do CTO** | `ENG-0011` item 6: "não é Business Domain hoje... permanece Future Domain" | `CONTEXT_RELATIONSHIPS.md § Decisão Formal do CTO` |
| **Implementação real — camada de execução** | `services/kernel/ai-runtime/` — zero código, classificado por inspeção real como Infrastructure Capability | `KERNEL_BOUNDARY_REVIEW.md § 2` |
| **Implementação real — camada de definição** | `packages/ai/` (`agents/`, `prompts/`, `tools/`, `memory/`) — estrutura package-level, sem funcionalidade, mesmo padrão arquitetural do Shared Kernel — **não existe estrutura equivalente para nenhuma outra capacidade não-domínio desta engenharia** | `packages/ai/README.md` |
| **Governança constitucional própria** | `CONSTITUTION.md Artigo 13` impõe 7 regras de comportamento a "Toda IA utilizada pela NOVARIS" — regra de escopo platform-wide, não de um domínio ou produto específico; mesmo padrão de redação do Artigo 12 (Segurança, transversal por natureza) | `CONSTITUTION.md § Artigo 13` |
| **Visão oficial da plataforma** | `NOVARIS_OS.md § 18`: "A IA participa de todas as camadas do sistema" — lista 9 áreas de atuação (`CRM`, `Marketing`, `Comercial`, `Financeiro`, `Suporte`, `Projetos`, `Customer Success`, `Analytics`, `Automações`), misturando Product Layer e Domain Layer sem tratar IA como item isolado dessa lista | `NOVARIS_OS.md § 18` |

**Resultado do método**: nos 6 critérios estruturais de Business Domain, `AI` pontua igual a `Automation` antes de `ADR-0013` — essencialmente zero (nenhum Aggregate, nenhuma VO, nenhum ciclo de vida, nenhuma regra de negócio, especificação 100% vazia). Isso descarta Option A com a mesma força que descartou `Automation`. Mas, diferente de `Automation`, `AI` tem **3 características estruturais sem paralelo em nenhuma outra capacidade não-domínio já avaliada** (Permission, Event Bus, Automation): (i) divisão explícita definição/execução em dois locais do monorepo; (ii) artigo constitucional próprio, de escopo platform-wide; (iii) declaração explícita e única, na visão oficial da plataforma, de que "participa de todas as camadas do sistema".

## Options

### Option A — AI is an official Business Domain

**Rejeitada.** Mesma base de rejeição de `Automation` (`ADR-0013`): nenhum Aggregate, nenhuma regra de negócio, especificação de produto 100% vazia, decisão prévia do CTO (`ENG-0011` item 6) já negando. Nenhuma evidência nova coletada nesta missão contradiz essa rejeição.

### Option B — AI is a Platform Capability

**Considerada, mas insuficiente.** Captura corretamente que `AI` não é um Bounded Context de negócio, mas não captura a evidência de que `AI` foi desenhada, desde a visão oficial da plataforma, para atravessar transversalmente todo domínio e produto — uma "Platform Capability" no sentido usado até aqui (ex.: `Event Bus`) tende a ser uma capacidade única e uniforme, consumida da mesma forma por todos; `AI` tem uma camada de definição (`packages/ai/`) e uma regra constitucional de comportamento (Artigo 13) que a distinguem desse padrão.

### Option C — AI is Infrastructure Capability

**Considerada, mas insuficiente pelo mesmo motivo de B.** `services/kernel/ai-runtime/` **é**, isoladamente, uma Infrastructure Capability (confirmado por `KERNEL_BOUNDARY_REVIEW.md`) — mas essa classificação cobre só a camada de execução, não a camada de definição (`packages/ai/`) nem a regra constitucional que governa como qualquer domínio pode usar IA. Tratar "AI" inteiramente como Infrastructure Capability apagaria a distinção já existente no próprio monorepo entre `packages/ai/` (definição) e `services/kernel/ai-runtime/` (execução).

### Option D — AI is a transversal intelligence layer

**Escolhida.** Reconhece, sem inventar nenhum conteúdo novo, a estrutura que já existe: `AI` não é um Bounded Context de negócio (falha nos 6 critérios estruturais, igual a `Automation`), mas também não é uma única Infrastructure Capability uniforme — é uma camada com duas partes (`packages/ai/`, definição; `services/kernel/ai-runtime/`, execução) governada por uma regra constitucional própria (Artigo 13) que se aplica a qualquer domínio ou produto que a utilize, exatamente como a visão oficial da plataforma já descreve ("participa de todas as camadas do sistema").

## Decision

**Option D.** `AI` é formalmente uma **camada transversal de inteligência** (Transversal Intelligence Layer) — não um Business Domain, não uma Platform Capability isolada, não uma Infrastructure Capability simples. Estrutura confirmada, sem alteração:

- **Camada de definição**: `packages/ai/` — onde agentes, prompts, ferramentas e memória são declarados (não executados). Papel arquitetural análogo ao do Shared Kernel: reutilizável por qualquer domínio ou produto, sem ser, ela própria, um Bounded Context.
- **Camada de execução**: `services/kernel/ai-runtime/` — Infrastructure Capability já confirmada (`KERNEL_BOUNDARY_REVIEW.md`), único ponto por onde todo acesso de agentes a dados passa.
- **Camada de governança**: `CONSTITUTION.md Artigo 13` — regras de comportamento vinculantes para toda IA usada pela plataforma, independentemente de qual domínio ou produto a invoca.

Nenhum `services/domains/ai/` deve ser criado. Nenhum Aggregate, Repository ou Bounded Context com o nome "AI" deve ser modelado — a mesma restrição já aplicada a `CRM`/`Automation`.

## Consequences

**Positivas:**
- Encerra a última pendência nomeada de `ENG-0011` item 6 — `CRM` (`ADR-0011`), `Automation` (`ADR-0013`) e `AI` (esta ADR) agora têm posição arquitetural formal e rastreável.
- Introduz, com evidência real (não hipótese), uma quarta categoria arquitetural além de Business Domain/Platform Capability/Infrastructure Capability — "Transversal Layer" — potencialmente reutilizável para outras capacidades futuras que sigam o mesmo padrão de definição+execução+governança cross-cutting (nenhuma outra capacidade hoje se qualifica; não generalizado além de `AI` por esta ADR).
- Formaliza, pela primeira vez como decisão de arquitetura, a distinção já implícita entre `packages/ai/` e `services/kernel/ai-runtime/`.

**Negativas / pendências:**
- `DOMAIN_MODEL.md` continua nomeando "AI DOMAIN" como um dos 13 domínios — **não alterado por esta missão** (fora de escopo). Divergência registrada, não corrigida no documento canônico, mesmo tratamento já dado à nomenclatura "AUTOMATION DOMAIN" por `ADR-0013`.
- Os 9 objetos de `AI` em `DOMAIN_OWNERSHIP.md` (`Agent`, `Prompt`, `Memory`, `Context`, `Embedding`, `Tool`, `Decision`, `Insight`, `Recommendation`) não têm, e não precisam de, Owner de Domain Layer — mas, diferente de `Automation`, não são simplesmente "conceitos de Infrastructure": são construtos da camada transversal, potencialmente referenciados (por id) por qualquer domínio que invoque IA. `BOM.md` os trata como categoria única ("Intelligence Objects"), sem distinguir estrutura de definição de resultado de aplicação — esta ADR não inventa essa distinção sem fonte.
- A referência incorreta em `packages/ai/README.md` (`NOVARIS_CONSTITUTION.md Article XII` em vez de `CONSTITUTION.md Artigo 13`) permanece não corrigida — fora do escopo explícito desta missão (que não cria/edita `packages/ai/`).
- `AI_STRATEGY.md`/`AI_PLAYBOOK.md` continuam 100% `TODO`, com sobreposição de escopo não resolvida entre si — esta ADR não resolve esse conflito, apenas o registra como já feito por `packages/ai/README.md`.

## Future Impact

1. Qualquer especificação futura de produto "AI" (`specifications/ai/`) deve ser escrita reconhecendo a natureza transversal — não como um domínio isolado, mas como uma capacidade consumida por outros domínios/produtos (`Sales`, `Marketing`, `CRM`, `Analytics`, conforme `NOVARIS_OS.md § 18`).
2. Recomenda-se resolver a sobreposição `AI_STRATEGY.md`/`AI_PLAYBOOK.md` antes de preencher qualquer um dos dois — já recomendado pelo próprio `AI_PLAYBOOK.md § Status`, reafirmado aqui.
3. Recomenda-se, em missão futura de menor escopo, corrigir a referência de `packages/ai/README.md` para `CONSTITUTION.md Artigo 13` — achado desta missão, não corrigido por restrição de escopo.
4. Se, no futuro, um domínio de negócio específico (ex.: `Analytics`) passar a possuir formalmente um `Insight`/`Recommendation` como Aggregate próprio (referenciando a camada transversal de IA só como origem técnica), isso não contradiz esta ADR — é a aplicação natural do padrão "camada transversal consumida por domínio", não uma reversão da decisão.
5. `KERNEL_DOMAIN_LIFECYCLE_V2.md` pode se beneficiar de uma emenda futura cobrindo explicitamente o caminho "Transversal Layer" (definição + execução + governança), paralela à já recomendada para capacidades de infraestrutura pura (`EVENT_BUS_DISCOVERY.md § 9`, `KERNEL_BOUNDARY_REVIEW.md § 6`) — não criada por esta ADR, apenas identificada como lacuna de processo.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0023`, encerrando a última pendência nomeada de `ENG-0011` item 6 com evidência própria. Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0014-ai-architectural-position.md`. Atualizações de referência avaliadas e aplicadas onde necessário (ver Modified files do relatório final da missão). Nenhum código, service, agent, Entity, Aggregate ou contract criado/alterado. `DOMAIN_MODEL.md` não alterado.

## Plano de Migração

Não aplicável — nenhum código ou dado real referenciava "AI" como Business Domain antes desta decisão; `packages/ai/` e `services/kernel/ai-runtime/` permanecem exatamente como estavam.

## Status

Aceito

---

## Relação com Outros Módulos

- [DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md) — seção `AI DOMAIN`, nomenclatura divergente, não alterada
- [NOVARIS_OS.md § 18](../knowledge/core/NOVARIS_OS.md#18-inteligência-artificial) — fonte decisiva da natureza transversal
- [CONSTITUTION.md § Artigo 13](../knowledge/core/CONSTITUTION.md) — governança constitucional de IA, escopo platform-wide
- [packages/ai/README.md](../packages/ai/README.md) — camada de definição, achado de referência stale registrado
- [services/kernel/ai-runtime/README.md](../services/kernel/ai-runtime/README.md), [services/kernel/KERNEL_BOUNDARY_REVIEW.md](../services/kernel/KERNEL_BOUNDARY_REVIEW.md) — camada de execução, Infrastructure Capability confirmada
- [knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md](../knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md) — `Aggregate Pending Discovery` para `AI`
- [knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md](../knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md) — os 9 objetos de `AI`, reclassificados por esta ADR
- [ADR-0013-automation-domain-confirmation.md](ADR-0013-automation-domain-confirmation.md) — precedente metodológico direto, mesma origem em `ENG-0011` item 6
- [knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md](../knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md) — § 12, pendência agora resolvida
