# Stack Tecnológica

Justificativa e papel de cada tecnologia adotada no NOVARIS. Qualquer adição ou substituição de tecnologia nesta lista deve gerar um ADR em [adr/](../adr/README.md).

| Camada | Tecnologia | Papel no NOVARIS |
|---|---|---|
| Frontend | **Next.js** | Framework React para renderização SSR/SSG e rotas da aplicação |
| Linguagem | **TypeScript** | Tipagem estática em toda a base de código |
| Estilização | **Tailwind CSS** | Sistema de utilitários CSS |
| Componentes | **Shadcn/UI** | Biblioteca de componentes acessíveis sobre Radix + Tailwind |
| Backend / BaaS | **Supabase** | Autenticação, banco de dados gerenciado, storage, realtime |
| Banco de Dados | **PostgreSQL** | Banco relacional principal (via Supabase) |
| Computação de Borda | **Supabase Edge Functions** | Lógica de backend executada próxima ao usuário |
| IA Generativa | **OpenAI** | Modelos de linguagem para funcionalidades de IA do produto |
| IA Generativa | **Claude (Anthropic)** | Modelos de linguagem para funcionalidades de IA do produto e agentes internos |
| Interoperabilidade de IA | **MCP (Model Context Protocol)** | Padronização de acesso de agentes de IA a ferramentas e dados do NOVARIS |
| Automação | **n8n** | Orquestração de workflows e integrações entre sistemas |
| Versionamento | **GitHub** | Hospedagem de código, revisão, CI/CD |
| Hospedagem / Deploy | **Vercel** | Build, deploy e hospedagem da aplicação Next.js |

## Critérios de Escolha

<!-- Por que cada tecnologia foi escolhida em vez de alternativas relevantes? -->

🚧 A ser detalhado — registrar como ADRs individuais quando a decisão envolver trade-offs relevantes.

## Tópicos a Documentar

- Versões mínimas suportadas de cada tecnologia
- Política de atualização de dependências
- Alternativas avaliadas e descartadas
