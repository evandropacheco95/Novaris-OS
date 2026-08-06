# ADR-0054: `TextToSqlPort` — text-to-SQL estrutural, sem credencial de IA

## Status

Aceita.

## Contexto

Quinta e última das lições extraídas da análise do projeto de cliente Winnet (`ENG-0166`). A Winnet tem em produção um assistente real ("`ia-core`", Supabase Edge Function) que traduz pergunta em linguagem natural em SQL `SELECT`, valida (só 1 statement, sem INSERT/UPDATE/DELETE/DDL, allowlist de 8 tabelas, nunca `financeiro_*`/`auth.*`/`pg_catalog`), executa sob a RLS do usuário autenticado, e devolve resposta em texto + o SQL usado (auditável no frontend).

NOVARIS já tem o precedente estrutural exato para esta situação: `ai-runtime`/`ADR-0041` — nenhuma credencial de IA real existe (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY` vazias em `.env.example`), então o Port foi construído mas o adapter é estrutural (`ConsoleAIRuntime`, resposta fixa, `loggedOnly: true`), substituível por um adapter real sem mudar quem o consome. O CTO já aprovou esse mesmo critério para text-to-SQL: "só estrutura por enquanto, sem credencial".

Diferença arquitetural relevante em relação à Winnet: lá, a segurança real do "read-only" vem da RLS do Postgres (a query roda sob o JWT do usuário). No NOVARIS, RLS é arquiteturalmente inerte — a conexão do Prisma usa uma role com `rolbypassrls=true` (`ENG-0122`, auditado novamente em `ENG-0167`). Isso significa que, quando um adapter real existir e de fato gerar SQL a partir de um LLM, a validação de código é a única barreira real contra um SQL malicioso ou mal-formado — não pode depender de RLS como a Winnet depende.

## Decision Drivers

- Mesmo critério de `ADR-0041`: nunca declarar "pronto" o que não pode ser verificado de verdade. Sem credencial de LLM, não há como testar geração de SQL real — permanece estrutural.
- A parte da Winnet que **não** depende de credencial de IA — a allowlist de tabelas e as regras de validação do SQL gerado — é código puro, testável agora, e arquiteturalmente necessária no NOVARIS de um jeito que nem era estritamente necessário na Winnet (lá era defesa em profundidade sobre a RLS; aqui é a única defesa real).
- Mesmo critério de não inventar regra de negócio sem fonte: a allowlist de tabelas e as palavras-chave proibidas replicam exatamente a lista e o critério que o `ia-core` real da Winnet usa (adaptados aos nomes reais das tabelas do NOVARIS), não uma lista inventada.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Port + SQL Guard real (testável) + adapter estrutural** | `TextToSqlPort.ask()` estrutural (`sql: null`, mesmo padrão de `ConsoleAIRuntime`), mas `validateReadOnlySql()` é código real, completo e testado — pronto para validar o SQL do dia em que um adapter real existir | Escolhida |
| B. Port totalmente estrutural, sem nenhuma lógica de validação ainda | Mais simples, mas adia até a lógica de segurança mais fácil de errar sob pressão (quando finalmente houver credencial) — pior momento para escrever isso pela primeira vez | Rejeitada — a validação não depende de credencial, não há razão para adiá-la |
| C. Construir também um executor real contra o Postgres (`ia_exec_select` equivalente) | Resolveria a cadeia completa | Rejeitada agora — sem um LLM real gerando SQL para exercitar, um executor de SQL bruto contra produção seria superfície de ataque não testada ponta-a-ponta; fica para quando o adapter real existir, mesma disciplina de não construir o que não pode ser verificado |

## Decision

**Opção A.**

- `TextToSqlPort.ask(question: string, context: { organizationId })`, em `services/kernel/ai-runtime` (mesmo módulo Kernel de `AIRuntime`) — `TextToSqlResult { answer, sql: string | null, loggedOnly }`.
- `ConsoleTextToSqlRuntime` — adapter estrutural, `sql: null` sempre (nenhum SQL é gerado por IA até existir credencial), loga a pergunta, mesmo padrão de `ConsoleAIRuntime`.
- `validateReadOnlySql(sql)` — **código real, não estrutural**: exige exatamente 1 statement (`;` múltiplos rejeitados), deve começar com `SELECT`, rejeita palavras-chave de escrita (`INSERT`/`UPDATE`/`DELETE`/`DROP`/`ALTER`/`TRUNCATE`/`GRANT`/etc.), rejeita comentários SQL (`--`, `/* */` — endurecimento deliberado em relação ao prompt da Winnet, que não bloqueia comentários, já que aqui não há RLS como segunda camada), e restringe toda referência `FROM`/`JOIN` à allowlist `TEXT_TO_SQL_ALLOWED_TABLES`.
- Allowlist: todas as tabelas de CRM/Sales/Marketing/Analytics (`opportunities`, `leads`, `contracts`, `products`, `quotations`, `parties` etc.), **excluindo** Identity/Workspace (`users`, `roles`, `credentials`, `organizations`) e Financial (`invoices`, `subscriptions`) — mesmo critério de exclusão da Winnet (`financeiro_*`, `auth.*`), mapeado para os domínios reais do NOVARIS.
- `Application`/`API`: `POST /ai/text-to-sql` no `AIRuntimeController` já existente, reaproveitando a Permission `system.ai-runtime.manage` (sem Permission nova) — mesmo padrão de `POST /ai/ask`.
- **Invariante explícita para o futuro adapter real**: qualquer SQL retornado por um LLM **deve** passar por `validateReadOnlySql()` antes de qualquer execução contra o Postgres. Isso não está codificado como enforcement automático nesta versão (não há execução nenhuma ainda) — é um contrato documentado aqui e no comentário do Port, a ser respeitado pela implementação do adapter real.
- **Fora de escopo, decisão explícita**: nenhum executor de SQL real contra o Postgres (equivalente ao `ia_exec_select` da Winnet) — fica para quando o adapter real de LLM existir.

## Consequences

- `services/kernel/ai-runtime` ganha dependência de `@novaris/shared-kernel` (para `Result`/`ValidationError`), mesmo precedente de `automation-runtime`.
- Nenhuma migration Postgres — `TextToSqlPort` não persiste nada, mesmo perfil stateless de `AIRuntime`.
- `validateReadOnlySql()` e a allowlist são cobertos por 18 testes reais (não estruturais) — a única parte desta missão que tem cobertura de comportamento real, já que o resto é idêntico em espírito ao `ConsoleAIRuntime` já existente.
- Quando uma credencial de LLM existir e um adapter real for escrito, ele deve chamar `validateReadOnlySql()` sobre todo SQL gerado antes de executar — e ainda assim, por RLS ser inerte no NOVARIS, precisará também escopar explicitamente por `organizationId` na query (via `WHERE` injetado ou equivalente), já que a allowlist de tabelas sozinha não impõe isolamento de tenant.
