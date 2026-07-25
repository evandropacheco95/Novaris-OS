# Template: Nota Atômica

`Nota Atômica: <título descritivo em kebab-case-pt-br>.md`

## Objetivo

Registrar um conceito único, reutilizável e fundacional que já foi capturado num log de domínio (`decisoes.md`/`aprendizados.md`/`referencias.md`) e graduou para nota própria, conforme [KNOWLEDGE_CONSTITUTION.md § Artigo 4](../KNOWLEDGE_CONSTITUTION.md).

## Onde Criar

Dentro da pasta do domínio ao qual pertence (ex: `knowledge/technical/backend/`), como arquivo irmão de `decisoes.md`/`aprendizados.md`/`referencias.md`. Nunca em `_templates/` ou `_moc/`.

## Campos Obrigatórios (YAML)

| Campo | Descrição |
|---|---|
| `id` | `dominio-slug-curto`, estável, usado para referência cruzada fora do vault |
| `title` | Título legível — deve bater com o nome do arquivo |
| `type` | Sempre `atomic` neste template |
| `domain` | Caminho do domínio, ex: `technical/backend` |
| `status` | `draft` \| `active` \| `archived` — só vira `active` após passar pelo Fluxo de Publicação (Artigo 11) |
| `created` / `updated` | `AAAA-MM-DD` |
| `supersedes` / `superseded_by` | Opcional — usar só em ruptura conceitual (Artigo 6) |
| `tags` | Cortes transversais controlados — não recrie a taxonomia de domínio como tag (Artigo 9) |

## Estrutura

```markdown
---
id: dominio-slug-curto
title: Título legível da nota
type: atomic
domain: technical/backend
status: draft
created: AAAA-MM-DD
updated: AAAA-MM-DD
supersedes: []
superseded_by: null
tags: []
---

# Título da Nota

## Contexto

Por que isso importa / de onde veio (link para a entrada original no log de domínio, se houver).

## Conteúdo

O conceito em si — direto, sem enrolação. Uma nota atômica cobre uma ideia só.

## Fontes

- Link(s) para documentação oficial, código ou conversa que originou este conhecimento.

## Relacionado

- [[Outra nota relacionada]]
```

## Checklist Antes de Marcar `status: active`

- [ ] Busquei no vault se esse conceito já existia (Artigo 5 — Anti-Duplicação)
- [ ] A nota tem ao menos 1 link de entrada ou saída (Artigo 7 — regra anti-órfão)
- [ ] A nota está referenciada no MOC do seu domínio (`_moc/<Categoria>-MOC.md`)
- [ ] Se toca um assunto da Matriz de Autoridade Documental (`PROJECT_RULES.md`), foi checada contra ela
- [ ] Não duplica nem contradiz nenhum documento canônico sem uma ADR resolvendo o conflito
