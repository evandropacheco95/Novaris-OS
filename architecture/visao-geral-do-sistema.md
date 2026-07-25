# Visão Geral do Sistema

## Diagrama de Alto Nível

<!-- Inserir diagrama (Mermaid ou imagem) mostrando: cliente (Next.js na Vercel) → API/Edge Functions (Supabase) → PostgreSQL, além dos pontos de integração com OpenAI, Claude, MCP e n8n. -->

🚧 A ser detalhado.

## Componentes Principais

| Componente | Responsabilidade | Documentação |
|---|---|---|
| Aplicação Web (Next.js) | Interface do usuário e renderização | [docs/04-frontend](../docs/04-frontend/README.md) |
| Supabase (Postgres + Edge Functions) | Persistência, autenticação, lógica de borda | [docs/05-backend](../docs/05-backend/README.md) |
| Camada de IA (OpenAI, Claude, MCP) | Recursos inteligentes da plataforma | [docs/06-integracao-ia](../docs/06-integracao-ia/README.md) |
| n8n | Automação de workflows internos e integrações | [docs/07-automacao](../docs/07-automacao/README.md) |
| Vercel + GitHub | Build, deploy e CI/CD | [docs/08-infraestrutura](../docs/08-infraestrutura/README.md) |

## Fluxo de Dados (visão macro)

<!-- Descrever o caminho de uma requisição típica, do browser até a resposta. -->

🚧 A ser detalhado.

## Tópicos a Documentar

- Diagrama de componentes (C4 Model — nível de contexto e contêiner)
- Limites de confiança (trust boundaries) entre frontend, backend e provedores de IA
- Pontos de escalabilidade e possíveis gargalos
