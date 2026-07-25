---
id: integracao-ia-claude-code-obsidian-mcp-discovery
title: Descoberta automática do vault Obsidian pelo Claude Code via MCP
type: atomic
domain: technical/integracao-ia
status: active
created: 2026-07-23
updated: 2026-07-23
supersedes: []
superseded_by: null
tags: []
---

# Descoberta Automática do Vault Obsidian pelo Claude Code via MCP

## Contexto

Validado ao vivo em 2026-07-23 ao instalar o plugin `claude-code-mcp` (obsidian-claude-code-mcp, autor iansinnott) no vault que hoje é a raiz deste repositório (`novaris/`). Registrado como nota atômica porque é conhecimento reutilizável para qualquer troubleshooting futuro dessa integração — ver [[Technical-MOC]].

## Conteúdo

O plugin `claude-code-mcp` roda **dois transportes simultâneos** dentro do Obsidian:

- **WebSocket** — usado pelo Claude Code CLI (`/ide`), porta configurável (padrão `22360`).
- **HTTP/SSE** — usado por outros clientes MCP (ex: Claude Desktop via `mcp-remote`).

**Mecanismo de auto-descoberta**: assim que o plugin é ativado num vault, ele cria um arquivo `<porta>.lock` em `~/.claude/ide/` (ou `$CLAUDE_CONFIG_DIR/ide/` se a variável estiver definida). O Claude Code CLI lê essa pasta para popular a lista do comando `/ide` — por isso a conexão é automática, sem precisar copiar URL/token manualmente.

**Ativação é por vault**: o plugin precisa estar instalado (`main.js`/`manifest.json`/`styles.css` em `.obsidian/plugins/claude-code-mcp/`) e listado em `.obsidian/community-plugins.json` **de cada vault** — não é uma instalação global do Obsidian. Se `community-plugins.json` já listar o plugin *antes* do vault ser aberto pela primeira vez, o Obsidian ativa ele sozinho, sem precisar de toggle manual em Settings → Community Plugins (confirmado nesta missão: o vault do repo `novaris/` ativou o plugin automaticamente, diferente do vault de teste inicial, que exigiu toggle manual porque a config foi copiada com o vault já aberto).

**Conflito de porta**: como a porta padrão (`22360`) é a mesma em qualquer instalação nova do plugin, abrir dois vaults com o plugin ativo ao mesmo tempo gera conflito — o plugin detecta e orienta a trocar a porta em Settings.

## Fontes

- [obsidian-claude-code-mcp/README.md](../../../obsidian-claude-code-mcp/README.md) (fora deste repositório, clonado em `C:\Users\Evandro Pacheco\obsidian-claude-code-mcp`)
- Validação direta: `~/.claude/ide/*.lock` e `netstat` mostrando a porta `22360` ativa após abrir o vault `novaris/`

## Relacionado

- [[Technical-MOC]]
