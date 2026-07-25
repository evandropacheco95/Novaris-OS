# ADR-0009 - Autoridade dos Documentos de Entrada de Engenharia (NES, NEF, Handbook)

## Problema

Três documentos disputam, na prática, o papel de "documento mestre" de engenharia da NOVARIS:

- [NES/README.md](../NES/README.md) — "NOVARIS Engineering System", autodeclarado "Documento Mestre de Engenharia" (Ordem de Missão NES-001).
- [NEF/README.md](../NEF/README.md) — "NOVARIS Engineering Framework", 10 pilares regendo "todo o ciclo de vida do software" (Missão NEF-001).
- [knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md](../knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md) — guia de leitura linear cobrindo 14 tópicos do processo de engenharia (Missão NEP-0001).

Nenhuma missão anterior resolveu qual dos três é a fonte de verdade — cada uma registrou a sobreposição e seguiu em frente, disciplina correta enquanto não havia mandato explícito para resolver. A Ordem de Missão DOC-0001 ("Documentation Governance Consolidation") pede explicitamente: "Definir qual documento é a fonte canônica para cada assunto" e "Não existem ambiguidades sobre qual é a fonte canônica de cada assunto" como critério de sucesso — mandato direto para resolver agora.

## Contexto

- `NES/README.md` tem conteúdo real (16 capítulos + 2 apêndices), mas **contradições internas já registradas** (`PROJECT_RULES.md`): duas hierarquias de prioridade diferentes dentro do próprio documento, um fluxo de engenharia de 6 etapas divergente das 11 fases de `EXECUTION_PROTOCOL.md`, uma estrutura de Ordem de Missão com campos diferentes de `MISSION_TEMPLATE.md` (19 campos), papéis (CEO, Chief System Architect, Principal Software Engineer) já redirecionados para `NEF/ROLES.md` desde [ADR-0008](ADR-0008-foundation-freeze.md). Documento verbatim — não pode ser corrigido, só redirecionado (mesma disciplina de `NOVARIS_CONSTITUTION.md`).
- `NEF/` é uma estrutura de 10 pastas (referência, não leitura corrida), explicitamente desenhada para **organizar, não substituir** — cada pilar aponta para a fonte canônica já existente. Não tem conteúdo contraditório internamente; é a estrutura mais nova e mais completa das três.
- `NOVARIS_ENGINEERING_HANDBOOK.md` é um único arquivo de leitura linear, criado explicitamente como resumo — nunca se declarou autoridade, já nasceu apontando para as fontes.
- As três já foram usadas de fato, nesta ordem cronológica: NES (mais antiga) → NEF (organiza o que já existia) → Handbook (resume tudo, inclusive o NEF).

## Alternativas

1. **Manter as três como estão, sem resolver** — descartada: contradiz o mandato explícito da Ordem de Missão DOC-0001.
2. **Reescrever `NES/README.md` para eliminar suas contradições internas** — descartada: o documento é verbatim (recebido por ditado, "Ordem de Missão NES-001"); alterar seu corpo violaria a disciplina já seguida em toda a sessão para documentos dessa natureza, e a Ordem de Missão DOC-0001 proíbe "criar novas regras de negócio" e não autoriza reescrita de conteúdo verbatim.
3. **Declarar um vencedor único entre os três, eliminando os outros dois** — descartada: NEF (estrutura de referência) e Handbook (narrativa linear) não são redundantes entre si — servem modos de leitura diferentes (procurar uma regra específica vs. entender o todo pela primeira vez). Forçar um único documento perderia uma das duas funções.
4. **Atribuir papéis distintos e não sobrepostos a NEF e Handbook; redirecionar NES para ambos, preservando seu conteúdo histórico** (adotada) — resolve a ambiguidade sem apagar nada, sem reescrever conteúdo verbatim, sem fabricar decisão de negócio.

## Escolha

- **NEF/** é a fonte canônica para **estrutura de referência** — "onde encontro a regra vigente sobre X" — os 10 pilares continuam apontando para as fontes detalhadas, nunca copiando conteúdo.
- **NOVARIS_ENGINEERING_HANDBOOK.md** é a fonte canônica para **onboarding em leitura linear** — "como todo o processo de engenharia se encaixa, do início ao fim", para quem ainda não conhece o repositório.
- **NES/README.md** passa a **histórico** — redirecionado para NEF (estrutura) e Handbook (narrativa) para qualquer assunto vigente. Corpo verbatim preservado integralmente, nenhuma linha alterada.
- **PROJECT_RULES.md** permanece a fonte canônica de **governança normativa** (hierarquia de autoridade, histórico de emendas) — nem NEF nem Handbook a substituem; ambos apontam para ela.
- Matriz completa de autoridade por assunto (Constituição, Roadmap, Papéis, Planejamento, Playbooks, Padrão técnico, ADRs etc.) registrada em `PROJECT_RULES.md § Artigo 1 — Matriz de Autoridade Documental` (Missão DOC-0001) — não duplicada aqui.

## Consequências

- Nenhum arquivo é removido. `NES/README.md` continua legível, íntegro, com seu conteúdo original intacto — só sua *autoridade* muda, não seu *conteúdo*.
- Toda futura dúvida sobre "onde está a regra de X" tem uma resposta sem ambiguidade: consultar a Matriz de Autoridade em `PROJECT_RULES.md`.
- `NEF/README.md` e `NOVARIS_ENGINEERING_HANDBOOK.md` são atualizados para remover a linguagem de "sobreposição não resolvida" quanto a este ponto específico — outras sobreposições de conteúdo (ex.: `SYSTEM_ARCHITECTURE.md` vs. estrutura real, `DOMAIN_MODEL.md` internamente) continuam registradas, não resolvidas por este ADR (fora do escopo desta missão).
- Nenhuma implementação de código é afetada.

## Responsável

CTO / Arquiteto Chefe, via Ordem de Missão DOC-0001 ("Documentation Governance Consolidation").

## Data

2026-07-15

## Impactos

- `NES/README.md` — nota de redirecionamento atualizada (footer não-original, corpo intacto).
- `NEF/README.md` — seção de sobreposições atualizada, refletindo esta resolução.
- `knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md` — "Nota de Sobreposição" atualizada.
- `PROJECT_RULES.md` — nova Matriz de Autoridade Documental em Artigo 1.
- `adr/README.md`, `architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md` — indexação deste ADR.

## Plano de Migração

Nenhuma migração de código. Documental: notas de redirecionamento adicionadas, nenhum conteúdo original removido ou reescrito.

## Status

Aceito
