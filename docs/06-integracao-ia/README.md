# 06 · Integração de IA

Documentação de como o NOVARIS integra modelos de linguagem (OpenAI, Claude) e o protocolo MCP para construir funcionalidades inteligentes e agentes.

## Conteúdo

| Arquivo | Descrição |
|---|---|
| [uso-do-openai.md](uso-do-openai.md) | Casos de uso, modelos e integração com a API da OpenAI |
| [uso-do-claude.md](uso-do-claude.md) | Casos de uso, modelos e integração com a API da Anthropic (Claude) |
| [protocolo-mcp.md](protocolo-mcp.md) | Uso do Model Context Protocol para conectar agentes a ferramentas/dados do NOVARIS |
| [arquitetura-de-agentes.md](arquitetura-de-agentes.md) | Como agentes de IA são orquestrados dentro da plataforma |
| [biblioteca-de-prompts.md](biblioteca-de-prompts.md) | Prompts padronizados e versionados |
| [estrategia-de-rag.md](estrategia-de-rag.md) | Recuperação de contexto/conhecimento para respostas de IA |

## Princípios

- Toda chamada a um provedor de IA passa por uma Edge Function — nunca diretamente do cliente (proteção de chaves de API).
- Custos e limites de uso por tenant devem ser monitorados — ver [docs/12-negocio/precos-e-planos.md](../02-produto/precos-e-planos.md).

## Status

🚧 Nenhuma integração implementada ainda — este é o esqueleto de documentação que guiará a implementação.
