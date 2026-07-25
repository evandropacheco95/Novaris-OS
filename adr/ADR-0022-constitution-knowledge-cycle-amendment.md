# ADR-0022 - Emenda à Constituição: Ciclo do Conhecimento, Knowledge Driven Engineering e Identidade Oficial do Produto

## Problema

`CONSTITUTION.md` (23 Artigos, única autoridade constitucional ativa desde `ADR-0008`) não nomeia formalmente três conceitos que o Artigo 22 permite incorporar mediante ADR: (1) um princípio explícito de que toda engenharia deve produzir conhecimento reutilizável como ativo permanente da plataforma — hoje apenas implícito no Artigo 20; (2) o fluxo pelo qual dado vira conhecimento e o conhecimento retroalimenta a engenharia; (3) uma síntese oficial única de "o que é a NOVARIS", hoje fragmentada em formulações não reconciliadas entre `CONSTITUTION.md` Artigo 2/4 e `knowledge/core/NOVARIS_OS.md`.

## Contexto

Uma análise de gap (`knowledge/architecture/analysis/CONSTITUTION_GAP_ANALYSIS_CHATGPT_DRAFT.md`) comparou um rascunho externo de Constituição, artigo por artigo, contra o texto real de `CONSTITUTION.md`. A maior parte do rascunho já estava coberta (Propósito, Missão, Visão, Valores) ou fora de escopo constitucional (convenção editorial, papéis de IA). Dois elementos foram identificados como genuinamente novos e não contraditórios: o "Ciclo do Conhecimento" e o nome "Knowledge Driven Engineering" para o princípio já implícito no Artigo 20. Dois pontos foram registrados como exigindo decisão explícita do CTO — ambos decididos nesta missão:

1. **Identidade do produto**: já existiam duas formulações concorrentes ("Sistemas Operacionais Empresariais", `CONSTITUTION.md` Art. 2; "plataforma NOVARIS OS... sistemas de crescimento empresarial", `NOVARIS_OS.md`) — mesmo padrão de "um conceito, nomes concorrentes" já resolvido para `Relationship`/`Customer` (`ADR-0007`) e `AI`/`Intelligence` (`ADR-0014`). CTO decidiu: a síntese oficial passa a ser **"Intelligent Operating Platform"** (termo técnico em inglês, mesmo tratamento dado a termos de DDD como `Aggregate`/`Entity`), com **"Plataforma Operacional Inteligente"** como sua tradução oficial em português. Esta decisão não revoga `CONSTITUTION.md` Art. 2 nem `NOVARIS_OS.md` — acrescenta a síntese formal que faltava.
2. **Escopo da Visão** (Artigo 4): divergia entre recorte geográfico ("referência latino-americana") e recorte de porte de empresa (proposta externa, "empresas de médio porte"). CTO decidiu **combinar os dois** — não são incompatíveis, apenas nunca haviam sido declarados juntos.

## Alternativas

### Option A — Não alterar `CONSTITUTION.md`, registrar apenas como achado
Rejeitada. O Artigo 22 já prevê mecanismo de emenda explícita; deixar um princípio já em uso (Ciclo do Conhecimento) fora do documento oficial é inconsistente com o Artigo 21 (prioridade da documentação oficial sobre "suposições").

### Option B — Criar um novo documento paralelo para os conceitos novos
Rejeitada. Recriaria exatamente o padrão de "documento concorrente" que `ADR-0008` já corrigiu duas vezes (`CONSTITUTION.md` vs. `NOVARIS_CONSTITUTION.md`). O Artigo 22 já autoriza emenda direta ao documento único.

### Option C — Emendar `CONSTITUTION.md` diretamente, via ADR, preservando a estrutura de 23 Artigos
**Escolhida.** Enriquece os Artigos 2, 4 e 20 (não cria um 24º Artigo, preservando o fechamento natural do documento no Artigo 23 "Vigência"), documentado por esta ADR e pela entrada correspondente no Histórico de Emendas de `PROJECT_RULES.md`, exatamente como o Artigo 22 exige (Motivação, Alternativas, Impactos, Plano de Migração, Data, Responsável).

## Escolha

Emendar `CONSTITUTION.md` (v1.0.0 → v1.1.0):

- **Artigo 2 (Propósito)**: acrescentada a frase de identidade oficial do produto — "Intelligent Operating Platform" (termo oficial em inglês) / "Plataforma Operacional Inteligente" (tradução oficial em português).
- **Artigo 4 (Visão)**: combinado o recorte geográfico já existente com o recorte de porte de empresa — "Ser referência latino-americana, para empresas de médio porte, em Sistemas Operacionais Empresariais baseados em Inteligência Artificial."
- **Artigo 20 (Inteligência Coletiva)**: acrescentado o nome formal "Knowledge Driven Engineering (KDE)" ao princípio já existente, e o "Ciclo do Conhecimento" (Dados → Informação → Conhecimento → Decisão → Execução → Resultado → Aprendizado → Novo Conhecimento, ciclo contínuo).

Nenhum Artigo existente foi removido ou teve seu sentido revertido — todas as três mudanças são aditivas.

## Consequências

**Positivas**: encerra a fragmentação de "o que é a NOVARIS" com uma síntese formal e bilíngue (mesmo padrão já usado para termos técnicos de DDD); nomeia formalmente um princípio (KDE) que já orientava, na prática, toda a disciplina de documentação desta engenharia (ADRs, análises, auditorias, Discovery); dá à Visão um escopo combinado que reflete decisão explícita do CTO, não inferência.

**Negativas / pendências**: `NOVARIS_OS.md` continua com sua própria formulação ("sistemas de crescimento empresarial... plataforma NOVARIS OS") — não foi alterado por esta ADR (fora de escopo desta missão); uma reconciliação textual completa entre os dois documentos, se desejada, exigiria uma missão própria. O termo "Intelligent Operating Platform" ainda não foi propagado para `NOVARIS_OS.md`, `PRODUCTS.md` ou materiais de marketing — apenas para `CONSTITUTION.md`.

## Domain Impact

Nenhuma Entity, Aggregate, Value Object, Domain Event, Repository ou código foi criado/alterado. Nenhum domínio existente foi modificado em sua estrutura, Aggregate ou Blueprint. Esta é uma emenda constitucional pura, seguindo o mecanismo já previsto pelo próprio Artigo 22.

## Responsável

Decisão de arquitetura: CTO (via respostas diretas às perguntas de reconciliação desta sessão). Execução: Engenheiro Principal.

## Data

2026-07-22

## Impactos

Alterados: `knowledge/core/CONSTITUTION.md` (Artigos 2, 4, 20; versão 1.0.0 → 1.1.0), `PROJECT_RULES.md` (nova linha no Histórico de Emendas), `adr/README.md` (nova linha para ADR-0022 na tabela-índice), `knowledge/core/README.md` (entrada de `CONSTITUTION.md` atualizada para v1.1.0). Criado: este arquivo. Nenhum código, contrato, Aggregate ou domínio existente alterado.

## Plano de Migração

Não aplicável — nenhum código ou dado referencia o texto constitucional diretamente; é uma emenda documental pura, sem impacto em runtime.

## Status

Aceito

---

## Relação com Outros Módulos

- [knowledge/architecture/analysis/CONSTITUTION_GAP_ANALYSIS_CHATGPT_DRAFT.md](../knowledge/architecture/analysis/CONSTITUTION_GAP_ANALYSIS_CHATGPT_DRAFT.md) — análise que originou esta emenda
- [knowledge/core/CONSTITUTION.md](../knowledge/core/CONSTITUTION.md) — documento emendado
- [adr/ADR-0008-foundation-freeze.md](ADR-0008-foundation-freeze.md) — confirma `CONSTITUTION.md` como única autoridade constitucional ativa e mecanismo de emenda
- [adr/ADR-0007-domain-boundaries.md](ADR-0007-domain-boundaries.md), [adr/ADR-0014-ai-architectural-position.md](ADR-0014-ai-architectural-position.md) — precedentes diretos do padrão "termo técnico em inglês + tradução oficial em português"
