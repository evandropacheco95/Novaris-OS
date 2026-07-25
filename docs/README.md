# Documentação NOVARIS

Este diretório é a fonte única de verdade de todo o conhecimento do projeto NOVARIS: por que ele existe, como é arquitetado, como é construído, como é operado e como é vendido.

A documentação é organizada em seções numeradas para refletir a ordem natural de leitura para uma pessoa nova no projeto — da visão de produto até a operação do negócio.

> ⚠️ As seções **01-arquitetura** e **03-engenharia** (e os ADRs que viviam em `01-arquitetura/decisoes/`) foram promovidas a pastas de topo do repositório — ver [ADR-0002](../adr/ADR-0002-reestruturar-arvore-do-repositorio.md). Não existem mais dentro de `docs/`.

## Índice

| # | Seção | Descrição |
|---|---|---|
| 00 | [visao-geral](00-visao-geral/README.md) | Missão, visão, glossário, FAQ |
| — | [architecture/](../architecture/README.md) *(fora de `docs/`, na raiz)* | Arquitetura de sistema, stack, banco de dados, APIs |
| 02 | [produto](02-produto/README.md) | Roadmap, personas, planos (especificações de feature agora em `specifications/`) |
| — | [engineering/](../engineering/README.md) *(fora de `docs/`, na raiz)* | Padrões de código, git workflow, testes, CI/CD, árvore de decisão |
| 04 | [frontend](04-frontend/README.md) | Next.js, design system, componentes, acessibilidade |
| 05 | [backend](05-backend/README.md) | Supabase, PostgreSQL, Edge Functions, APIs, auth |
| 06 | [integracao-ia](06-integracao-ia/README.md) | OpenAI, Claude, MCP, agentes, RAG |
| 07 | [automacao](07-automacao/README.md) | n8n, webhooks, workflows automatizados |
| 08 | [infraestrutura](08-infraestrutura/README.md) | Vercel, GitHub Actions, ambientes, observabilidade, segredos |
| 09 | [seguranca](09-seguranca/README.md) | AuthN/AuthZ, proteção de dados, compliance, resposta a incidentes |
| 10 | [operacoes](10-operacoes/README.md) | On-call, runbooks, disaster recovery |
| 11 | [design](11-design/README.md) | Identidade visual, princípios de UI/UX |
| 12 | [negocio](12-negocio/README.md) | Billing, assinaturas, suporte ao cliente |
| 13 | [portal-do-desenvolvedor](13-portal-do-desenvolvedor/README.md) | API pública, SDKs, guias e exemplos para integradores |
| 14 | [legal](14-legal/README.md) | Privacidade, termos de serviço, DPA, SLA |
| 15 | [changelog-e-versionamento](15-changelog-e-versionamento/README.md) | Notas de versão, política de versionamento e depreciação |
| 16 | [guia-de-documentacao](16-guia-de-documentacao/README.md) | Estilo e templates para escrever documentação no NOVARIS |
| 17 | [status-e-incidentes](17-status-e-incidentes/README.md) | Histórico público de status e incidentes |
| — | [rfc/](rfc/README.md) | Propostas técnicas anteriores a um ADR formal (Missão ENG-0000) |

## Convenções de Documentação

- **Idioma**: português (pt-BR) como padrão do projeto.
- **Formato**: Markdown puro, um arquivo por assunto. Evitar arquivos monolíticos.
- **Nomenclatura**: pastas e arquivos em `kebab-case`, sem acentos.
- **README obrigatório**: toda pasta possui um `README.md` explicando seu propósito e listando seu conteúdo.
- **Decisões de arquitetura**: registradas como ADRs em [adr/](../adr/README.md) (seguindo [adr/TEMPLATE.md](../adr/TEMPLATE.md)), nunca apenas em conversas ou PRs.
- **Status**: documentos ainda não preenchidos trazem o marcador `🚧 A ser detalhado` para deixar claro o que é esqueleto e o que é conteúdo final.

## Como Este Repositório Deve Evoluir

1. Toda decisão técnica relevante gera um ADR antes da implementação.
2. Toda feature de produto gera uma especificação em `specifications/` antes de virar código.
3. Documentação é atualizada no mesmo PR que altera o comportamento do sistema — nunca depois.
