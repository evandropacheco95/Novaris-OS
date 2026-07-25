# ADR-0025 — Fundação do NOVARIS Knowledge OS

## Problema

`knowledge/` existe desde a reestruturação do repositório (ADR-0002), mas nunca teve um sistema operacional de gestão de conhecimento — apenas uma taxonomia de pastas com scaffolding majoritariamente vazio (32 de ~40 arquivos de domínio, em `technical/`, `commercial/`, `operations/`, `brand/`, nunca foram preenchidos). `CONSTITUTION.md` Artigo 20 mandata Knowledge Driven Engineering (KDE) e formaliza um Ciclo do Conhecimento (Dados → Informação → Conhecimento → Decisão → Execução → Resultado → Aprendizado → Novo Conhecimento), mas nenhum documento define, na prática, como criar, nomear, linkar, versionar ou arquivar conhecimento — nem como a IA deve consultá-lo. Sem essa camada operacional, o Artigo 20 permanece um princípio sem mecanismo.

## Contexto

Missão KNOWLEDGE-0001 (papel: Chief Knowledge Architect) foi aberta para desenhar essa camada operacional, compatível com Obsidian, Git, Claude Code, Markdown, DDD e Enterprise Architecture. Pela regra de Foundation Freeze (`ADR-0008`, confirmada em `FOUNDATION_STATUS.md`), qualquer documento novo que declare regra vinculante sobre a árvore de governança documental exige um ADR — este é essa autorização.

`ADR-0015` já havia resolvido a pergunta correlata "Knowledge é um Business Domain?" com **Não** — está absorvido na Camada Transversal de Inteligência Artificial (junto de `packages/ai/` e `services/kernel/ai-runtime/`), governada por `CONSTITUTION.md` Artigo 13. Este ADR **não reabre** essa decisão — assume-a como precedente vinculante e resolve uma pergunta diferente: como o conhecimento é operacionalmente criado, nomeado, linkado e mantido dentro dessa camada.

## Alternativas

### A — Não formalizar; deixar cada domínio decidir sua própria convenção

**Rejeitada.** É exatamente o estado atual (scaffolding sem uso real). A ausência de convenção — nenhuma regra de captura, nenhum critério do que vira nota permanente, nenhum template usado de fato — é a causa mais provável do abandono observado em 100% das pastas de domínio (`technical/`, `commercial/`, `operations/`, `brand/`).

### B — Criar um novo domínio de negócio "Knowledge"

**Rejeitada.** Contradiria `ADR-0015` diretamente, que já rejeitou essa opção com evidência forte (zero Aggregate candidato, zero objeto mapeável em `BOM.md`, zero especificação de produto).

### C — Formalizar via `knowledge/KNOWLEDGE_CONSTITUTION.md`, subordinado a `CONSTITUTION.md` Artigo 20, registrado na Matriz de Autoridade Documental de `PROJECT_RULES.md`, sem criar domínio de negócio novo e sem mover/renomear nenhuma pasta existente

**Escolhida.** Aditiva, não-destrutiva, consistente com `ADR-0014`/`ADR-0015`, resolve a lacuna operacional sem reabrir decisões já tomadas nem competir com `specs/`/`specifications/` (já duplicados e não resolvidos — ver Consequências).

## Escolha

Opção C. O **NOVARIS Knowledge OS** é formalizado como o conjunto de regras operacionais definidas em `knowledge/KNOWLEDGE_CONSTITUTION.md` — autoridade canônica para "gestão do ciclo de vida do conhecimento" (criação, nomenclatura, metadados YAML, links/backlinks, versionamento, arquivamento e papel da IA), subordinado a `CONSTITUTION.md` Artigo 20 (em caso de conflito, a Constitution prevalece).

Vive dentro da Camada Transversal de Inteligência Artificial já confirmada por `ADR-0014`/`ADR-0015` — não é, e não será tratado como, Business Domain. A estrutura de pastas de `knowledge/` (`core/`, `architecture/`, `technical/`, `engineering/`, `commercial/`, `operations/`, `brand/`, `references/`) permanece intacta — nenhuma pasta é renomeada, movida ou reestruturada. São adicionadas apenas `knowledge/_moc/` (Maps of Content, um por categoria) e `knowledge/_templates/` (templates de nota), ambas aditivas dentro da categoria já declarada `knowledge/`, e portanto não constituem, por si só, uma mudança estrutural na árvore de governança — o que exige este ADR é a Constituição do Conhecimento como regra vinculante nova, não as pastas.

Os logs de domínio já existentes (`decisoes.md`, `aprendizados.md`, `referencias.md`) permanecem como estão — passam a ser formalmente a camada de captura de baixo atrito do novo sistema, sem alteração de formato.

## Consequências

**Positivas:**
- Dá mecanismo operacional ao mandato constitucional do Artigo 20 (KDE / Ciclo do Conhecimento), até então apenas princípio sem implementação.
- Define, pela primeira vez no repositório, uma convenção de nota atômica com YAML frontmatter — habilita uso real dos recursos do Obsidian (grafo, backlinks, busca estruturada) sobre a documentação já existente, sem reescrever nenhum arquivo atual.
- Não compete com `specs/`/`specifications/` (já duplicados e não resolvidos, ver `specs/README.md`) — o Knowledge OS cobre decisão/aprendizado/referência/conceito reutilizável, não spec de feature.
- Reforça, sem substituir, a fase 9 ("Atualização da Documentação") do `EXECUTION_PROTOCOL.md` já obrigatória em `.claude/rules.md`.

**Negativas / pendências:**
- Introduz YAML frontmatter como convenção nova — nenhum outro arquivo do repositório usa esse formato hoje (todos usam texto plano sob o H1: `Versão:`, `Status:`). Risco de inconsistência visual até que, eventualmente, `core/NAMING_CONVENTIONS.md` (hoje `TODO`) seja preenchido incorporando-a — não feito por esta missão, fora de escopo.
- Não resolve a duplicação `specs/` vs `specifications/`, nem a numeração dupla de ADRs (`ADR-NNNN` vs `ADR-<DOMÍNIO>-NNN`, ver `ADR-ORG-001`) — ambos pré-existentes, fora do escopo de `KNOWLEDGE-0001`.
- Sucesso depende de uso real; o histórico do próprio repositório (scaffolding abandonado em 32 arquivos) mostra que estrutura por si só não garante adoção — mitigado no desenho pelo modelo de captura de baixo atrito, mas não eliminado por este ADR.

## Responsável

Chief Knowledge Architect (Missão KNOWLEDGE-0001), a pedido da liderança (Evandro Pacheco).

## Data

2026-07-23

## Impactos

Criado: `knowledge/KNOWLEDGE_CONSTITUTION.md`, `knowledge/_templates/` (5 arquivos), `knowledge/_moc/` (7 arquivos). Adicionada 1 linha na Matriz de Autoridade Documental de `PROJECT_RULES.md` Artigo 1. Adicionadas 2-3 linhas em `knowledge/README.md` (aditivo, texto atual preservado). Nenhum arquivo oficial reescrito. Nenhum código, service, Entity ou domínio de negócio criado/alterado. Zero notas de conteúdo/negócio criadas — esta missão entrega o sistema, não o conteúdo.

## Plano de Migração

Não aplicável — nenhum conteúdo existente é migrado ou alterado; a adição é puramente aditiva sobre estrutura já declarada em `ADR-0002`.

## Status

Aceito

---

## Relação com Outros Módulos

- [CONSTITUTION.md § Artigo 20](../knowledge/core/CONSTITUTION.md) — mandato constitucional que este ADR operacionaliza
- [ADR-0014-ai-architectural-position.md](ADR-0014-ai-architectural-position.md) — camada transversal de IA que hospeda o Knowledge OS
- [ADR-0015-knowledge-domain-position.md](ADR-0015-knowledge-domain-position.md) — precedente direto, não reaberto por este ADR
- [ADR-0008-foundation-freeze.md](ADR-0008-foundation-freeze.md) — regra que exige este ADR para a adição
- [ADR-0009-engineering-entry-point-authority.md](ADR-0009-engineering-entry-point-authority.md) — precedente do mecanismo "Matriz de Autoridade Documental"
- [PROJECT_RULES.md § Artigo 1](../PROJECT_RULES.md) — Matriz de Autoridade Documental, recebe a linha nova
- [knowledge/KNOWLEDGE_CONSTITUTION.md](../knowledge/KNOWLEDGE_CONSTITUTION.md) — documento canônico criado por este ADR
- [.claude/rules.md](../.claude/rules.md) — fase 9 do `EXECUTION_PROTOCOL.md`, que este sistema alimenta
