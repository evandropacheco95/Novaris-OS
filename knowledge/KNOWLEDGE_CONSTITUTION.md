# KNOWLEDGE CONSTITUTION

Versão: 1.0.0
Status: Oficial ([ADR-0025](../adr/ADR-0025-knowledge-os-foundation.md))
Autoridade: subordinado a [CONSTITUTION.md § Artigo 20](core/CONSTITUTION.md) (Inteligência Coletiva / Knowledge Driven Engineering)
Última atualização: 2026-07-23

> Este documento é a constituição operacional da gestão de conhecimento da NOVARIS. Ele não substitui `CONSTITUTION.md` — implementa, na prática, o mandato do Artigo 20. Em caso de conflito, `CONSTITUTION.md` prevalece. O Knowledge OS vive na Camada Transversal de Inteligência Artificial ([ADR-0014](../adr/ADR-0014-ai-architectural-position.md), [ADR-0015](../adr/ADR-0015-knowledge-domain-position.md)) — não é, e não será tratado como, um Business Domain.

---

## Artigo 1 — O Que É Conhecimento Permanente

Conhecimento permanente é toda informação que: (a) será útil para decisões futuras, (b) não está integralmente registrada em nenhum outro documento canônico já existente na [Matriz de Autoridade Documental](../PROJECT_RULES.md#matriz-de-autoridade-documental), e (c) sobrevive à pessoa ou conversa que a originou.

Não é conhecimento permanente: opiniões não validadas, rascunhos de conversa sem conclusão, informação já coberta por um documento oficial (nesse caso, linke o documento — não duplique).

## Artigo 2 — O Que É Conhecimento Temporário

Conhecimento temporário vive nos logs de domínio (`decisoes.md`, `aprendizados.md`, `referencias.md`, já existentes em cada pasta de `technical/`, `commercial/`, `operations/`, `brand/`) até ser avaliado para graduação (Artigo 4). Não precisa de formatação, template ou aprovação para ser capturado — o único requisito é uma linha com data.

## Artigo 3 — O Que Nunca Deve Entrar no Vault

- Credenciais, segredos, tokens ou dados de acesso (`CONSTITUTION.md` Artigo 12 — Segurança).
- Dados pessoais de clientes fora do escopo já definido em `knowledge/commercial/`.
- Conversas brutas copiadas sem síntese (isso é ruído, não conhecimento — `CONSTITUTION.md` Artigo 21).
- Qualquer conteúdo que contradiga um documento canônico da Matriz de Autoridade sem uma ADR resolvendo o conflito.

## Artigo 4 — Como Criar Notas

1. Primeiro, capture no log do domínio certo (Artigo 2) — nunca crie uma nota atômica direto, exceto quando o conteúdo já nasce reutilizável e fundacional.
2. Antes de criar, busque no vault se o conceito já existe (Artigo 5).
3. Uma nota vira **atômica** (arquivo próprio) quando: referenciada por mais de um lugar, é fundacional para decisões futuras, ou o log ficaria confuso sem separá-la.
4. Toda nota atômica usa o template (`_templates/atomic-note.md`) e nasce dentro da pasta do seu domínio (ex: `knowledge/technical/backend/`).
5. Toda nota atômica precisa de ao menos 1 link de entrada ou saída (regra anti-órfão, Artigo 7) e precisa estar referenciada no MOC do seu domínio (`_moc/`).

## Artigo 5 — Anti-Duplicação

Aplicação direta de `CONSTITUTION.md` Artigo 16. Antes de criar qualquer nota ou entrada, busque pelo conceito no vault. Se já existir, expanda ou linke — nunca duplique. Se dois documentos cobrirem o mesmo assunto de forma incompatível, isso é um conflito de governança e deve ser resolvido pelo padrão do repositório: um vira canônico, o outro recebe uma nota de redirecionamento não-destrutiva (nunca apague conteúdo).

## Artigo 6 — Quando Atualizar uma Nota

Atualize no lugar quando a mudança é uma correção, evolução ou detalhamento do mesmo conceito. Crie uma nova nota e marque `supersedes:`/`superseded_by:` no YAML (Artigo 8) quando a mudança é uma ruptura conceitual (o conceito antigo deixa de ser válido, não apenas mais detalhado) — mesmo critério usado pelas ADRs do repositório para decidir entre "editar" e "substituir com redirecionamento".

## Artigo 7 — Links e Backlinks

Use `[[wikilinks]]` nativos do Obsidian para qualquer referência a outra nota do vault. Para documentos fora de `knowledge/` (ADRs, specs, código), use link Markdown relativo. Toda nota atômica deve ter no mínimo 1 link — notas órfãs são identificadas na revisão periódica (Artigo 11) e devem ser linkadas ou arquivadas.

## Artigo 8 — Metadados (YAML)

Toda nota atômica (não os logs de domínio, que continuam em texto plano) inicia com frontmatter:

```yaml
---
id: dominio-slug-curto
title: Título legível da nota
type: atomic | decision | learning | reference
domain: technical/backend | commercial/clientes | ...
status: draft | active | archived
created: AAAA-MM-DD
updated: AAAA-MM-DD
supersedes: [] # opcional
superseded_by: null # opcional
tags: [] # apenas cortes transversais controlados — ver Artigo 9
---
```

## Artigo 9 — Tags

Tags são controladas, não livres. Use apenas para cortes transversais que os campos `type`/`domain`/`status` não cobrem (ex: `#urgente`, `#revisar`). Evite recriar a taxonomia de domínios como tags — isso já é a estrutura de pastas.

## Artigo 10 — Nomenclatura

Nome de arquivo = título descritivo em kebab-case, em português, sem ID opaco no nome (o ID vive no YAML, campo `id:`). MOCs seguem `_moc/<Categoria>-MOC.md`. Templates ficam em `_templates/`, nunca dentro de uma pasta de domínio. Este padrão é específico de notas atômicas — não se aplica aos prefixos `ADR-NNNN`/`NNNN-kebab` já em uso em `adr/` e `specifications/`, que continuam servindo decisões arquiteturais e specs de feature, respectivamente.

## Artigo 11 — Ciclo de Vida e Fluxos

Aplicação prática do Ciclo do Conhecimento (`CONSTITUTION.md` Artigo 20):

1. **Captura** — entrada de baixo atrito no log de domínio (Artigo 2).
2. **Consolidação** — revisão periódica (humana ou IA) identifica candidatos a nota atômica (Artigo 4).
3. **Vínculo** — nota atômica criada, linkada no MOC do domínio.
4. **Aplicação** — nota é referenciada em uma decisão real (ADR, spec, código, ou outra nota).
5. **Revisão/Arquivamento** — notas não referenciadas ou desatualizadas por muito tempo são revisadas; se obsoletas, `status: archived` (nunca deletadas, Artigo 12).

Uma nota só é considerada **Oficial** quando linkada no MOC do seu domínio e, se tocar um assunto já presente na [Matriz de Autoridade Documental](../PROJECT_RULES.md#matriz-de-autoridade-documental), checada contra ela primeiro (`CONSTITUTION.md` Artigo 21 — oficial > conversa/suposição).

## Artigo 12 — Versionamento e Arquivamento

Git é o histórico de versões — não use sufixos manuais tipo `_v2` em notas atômicas (diferente da convenção usada em outros documentos grandes do repo, ex. `SALES_CONTRACTS_FREEZE_V2.md`). Atualize o campo `updated:`. Arquivamento é sempre `status: archived` no YAML — a nota permanece no repositório, buscável e linkável, nunca é apagada.

## Artigo 13 — Papel da IA

Toda IA que interage com este vault (Claude Code ou outra) deve, por força de `CONSTITUTION.md` Artigo 13:

- Consultar o vault antes de responder sobre qualquer assunto coberto por ele.
- Citar a nota/arquivo usado como fonte ao dar uma resposta baseada nele.
- Nunca inventar conteúdo de negócio ou decisão sem base documental.
- Nunca marcar uma nota como `status: active`/oficial sem validação humana (ou de um papel de IA com autoridade explícita para isso, ex: `Documentation AI` em [NEF/ROLES.md](../NEF/ROLES.md), quando esse papel for formalizado).
- Registrar qualquer ação relevante que tome sobre o vault (criação, edição, arquivamento) — em linha com a fase 9 ("Atualização da Documentação") do `EXECUTION_PROTOCOL.md` já obrigatória em [.claude/rules.md](../.claude/rules.md).

## Artigo 14 — Alterações a Esta Constituição

Esta Constituição só pode ser alterada mediante ADR, seguindo o mesmo processo do `CONSTITUTION.md` Artigo 22 (motivação, alternativas avaliadas, impactos, plano de migração, data, responsável).

---

## Relação com Outros Módulos

- [CONSTITUTION.md § Artigo 20](core/CONSTITUTION.md) — mandato constitucional implementado por este documento
- [ADR-0025-knowledge-os-foundation.md](../adr/ADR-0025-knowledge-os-foundation.md) — ADR que autoriza e cria este documento
- [ADR-0014](../adr/ADR-0014-ai-architectural-position.md) / [ADR-0015](../adr/ADR-0015-knowledge-domain-position.md) — posição arquitetural do Knowledge OS (Camada Transversal de IA, não Business Domain)
- [PROJECT_RULES.md § Matriz de Autoridade Documental](../PROJECT_RULES.md) — registro deste documento como fonte canônica
- [knowledge/README.md](README.md) — índice geral, aponta para esta Constituição
- [knowledge/_templates/](_templates/) — templates que operacionalizam os Artigos 4 e 8
- [knowledge/_moc/](_moc/) — Maps of Content que operacionalizam os Artigos 4, 7 e 11
