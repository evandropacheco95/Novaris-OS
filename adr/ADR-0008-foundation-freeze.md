# ADR-0008 - Foundation Freeze & Governance Integration

## Problema

Seis missões de fundação (ENG-0000 a ENG-0000.4, NEF-001) produziram documentação de governança real, mas deliberadamente deixaram sobreposições não resolvidas: duas Constituições que se autodeclaram supremas, três roadmaps mestres, três listas de papéis, dois modelos de planejamento e dois diretórios de "playbooks". Cada nova missão registrou o conflito em `PROJECT_RULES.md` em vez de resolvê-lo, por instrução explícita de não inventar decisão de negócio/arquitetura sem base documental. A Sprint-0 (Foundation) está encerrando e não pode transicionar para implementação de código com múltiplas fontes de verdade concorrentes.

## Contexto

- `knowledge/core/CONSTITUTION.md` (23 Artigos, PT-BR, conteúdo real desde a Emenda 1 de `PROJECT_RULES.md`) e `knowledge/core/NOVARIS_CONSTITUTION.md` (21 Articles, EN, "Authority: MAXIMUM", "Classification: Immutable") coexistem sem se citar — registrado como "pendência crítica" na Emenda 7.
- `knowledge/core/MASTER_ROADMAP.md` (Missão 002, majoritariamente `TODO`), `knowledge/core/IMPLEMENTATION_ROADMAP.md` (Missão ARCH-005, conteúdo real, sequenciamento Kernel→Domínios) e `NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md` (Missão NEF-001, 12 fases, Estado Atual verificado contra o repositório real).
- `agents/` (12 perfis de agente de IA de automação de negócio), `NES/README.md § Capítulo 4` (CEO, Chief System Architect, Principal Software Engineer) e `NEF/ROLES.md` (Missão NEF-001, 7 papéis humanos + 5 de IA).
- `knowledge/core/BACKLOG.md` (Epic→Feature→Story→Task→Subtask) e `NEF/PLANNING_MODEL.md` (PROGRAM→EPIC→MISSION→TASK→CHECKLIST), além da notação `ENG-XXXX`/`ARCH-XXX`/`NEF-XXX` já em uso operacional nesta sessão.
- `playbooks/` (raiz, criado por ADR-0002, `🚧 Nenhum playbook criado ainda`) e `engineering/playbooks/` (Missão ENG-0000.3, 7 procedimentos técnicos reais).
- A "Ordem de Missão ENG-0000.5" pediu adicionalmente resolver `ENGINEERING_CONSTITUTION.md` como uma terceira Constituição. **Esse arquivo não existe no repositório e nunca foi criado nesta sessão** — não foi fabricado para esta consolidação; está fora de escopo por ausência de fonte.
- A ordem de missão pediu `ADR-0009-foundation-freeze.md`. `adr/` vai de `ADR-0001` a `ADR-0007` sem lacunas (`adr/README.md § Convenção`: numeração sequencial, sempre crescente). Este documento é `ADR-0008` para não deixar uma lacuna de numeração sem explicação; a mudança de número está registrada aqui e no relatório da missão.

## Alternativas

1. **Manter a duplicidade registrada** (como em todas as missões anteriores) — descartada: a própria ordem de missão pede resolução, não mais registro, e a Sprint-0 não pode encerrar com múltiplas fontes de verdade.
2. **Fundir os documentos concorrentes em um texto novo único** (ex.: mesclar os 23 Artigos de `CONSTITUTION.md` com os 21 Articles de `NOVARIS_CONSTITUTION.md`) — descartada: exigiria decidir, artigo por artigo, qual conteúdo prevalece onde os dois divergem, sem base documental para essa arbitragem — equivaleria a inventar governança.
3. **Escolher um documento canônico por assunto, redirecionar os demais sem apagar conteúdo, reclassificar os que na verdade cobrem escopos diferentes** (adotada) — preserva histórico, não inventa reconciliação de conteúdo divergente, e satisfaz o pedido de "uma única fonte canônica por assunto".

## Escolha

**1. Constituição** — `knowledge/core/CONSTITUTION.md` é a única autoridade constitucional ativa (decisão confirmada pelo usuário/CTO). `NOVARIS_CONSTITUTION.md` passa a histórico/redirecionado, corpo preservado. `ENGINEERING_CONSTITUTION.md` não existe — fora de escopo.

**2. Roadmaps** — `NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md` é o roadmap mestre único (12 fases de produto, Estado Atual verificado). `IMPLEMENTATION_ROADMAP.md` é reclassificado como roadmap **especializado** (sequenciamento interno da fase Foundation), não duplicata. `MASTER_ROADMAP.md` (Missão 002) passa a histórico/substituído.

**3. Papéis** — `NEF/ROLES.md` é a definição oficial única de papéis de governança de engenharia (7 humanos + 5 IA). `NES/README.md § Capítulo 4` (verbatim, não alterado) recebe nota de redirecionamento. `agents/` é reclassificado como escopo distinto e complementar (perfis de automação de negócio), não papéis de governança — não é fundido.

**4. Planejamento** — `PROGRAM → EPIC → MISSION → TASK → CHECKLIST` (`NEF/PLANNING_MODEL.md`) é o padrão oficial obrigatório de execução de engenharia, conforme pedido explicitamente pela ordem de missão. `BACKLOG.md` (Epic→Feature→Story→Task→Subtask) é reclassificado como modelo de planejamento de **produto** (complementar, não concorrente), com mapeamento explícito entre os dois vocabulários no nível Epic/EPIC.

**5. Playbooks** — `engineering/playbooks/` é a localização única oficial (7 procedimentos reais). `playbooks/` (raiz, vazio) passa a redirecionamento — nenhum conteúdo perdido, pois nunca houve conteúdo ali.

## Consequências

- Nenhum documento verbatim (`NOVARIS_CONSTITUTION.md`, `NES/README.md`, `MASTER_ROADMAP.md`, `IMPLEMENTATION_ROADMAP.md`) tem seu corpo original alterado — cada um recebe apenas um footer/nota não-original de redirecionamento.
- `PROJECT_RULES.md` Artigo 1 passa a citar `CONSTITUTION.md` como única constituição ativa na hierarquia.
- A partir deste ADR, a **Foundation está oficialmente congelada** (Foundation Freeze): nenhuma mudança estrutural na árvore de governança ou nos documentos canônicos listados acima pode ser feita sem um novo ADR.
- Documentos históricos/redirecionados continuam existindo e legíveis — nenhuma perda de conteúdo ou de histórico de decisão.
- `services/`, `packages/`, `apps/` e demais estruturas de código não são afetados — este ADR é exclusivamente de governança documental.

## Responsável

CTO (Ordem de Missão ENG-0000.5), decisão sobre a Constituição confirmada por pergunta direta ao usuário; demais resoluções conduzidas pelo Engenheiro Principal segundo critérios objetivos (conteúdo real vs. `TODO`, escopo já referenciado de fato) registrados neste ADR.

## Data

2026-07-14

## Impactos

- `knowledge/core/`: `CONSTITUTION.md` (índice atualizado em `README.md`), `NOVARIS_CONSTITUTION.md` (footer), `MASTER_ROADMAP.md` (footer), `IMPLEMENTATION_ROADMAP.md` (nota de especialização), `BACKLOG.md` (nota de mapeamento), `README.md` (índice).
- `NES/README.md` — footer de redirecionamento de papéis (Relação com Outros Módulos).
- `NEF/`: `ROLES.md`, `PLANNING_MODEL.md`, `01-constitution/README.md`, `06-evolution/README.md`, `07-playbooks/README.md` — tom "não resolvido" substituído por nota de resolução.
- `agents/README.md` — linha de esclarecimento de escopo.
- `playbooks/README.md` — redirecionamento para `engineering/playbooks/`.
- `PROJECT_RULES.md` — Artigo 1, nova nota "Sobre ENG-0000.5", linha 18 do Histórico de Emendas, anotações "RESOLVIDO" nas Emendas 2, 4, 5, 7, 8, 10, 11.
- `README.md`, `CHANGELOG.md` (raiz) — atualizados.
- `adr/README.md` — nova linha para este ADR.
- Novo arquivo: `FOUNDATION_STATUS.md` (raiz).

## Plano de Migração

Nenhuma migração de dado ou de código — mudança exclusivamente documental. Nenhum arquivo é removido; documentos superados recebem nota de redirecionamento preservando o corpo original. Execução em um único commit de governança, sem mistura com código.

## Status

Aceito
