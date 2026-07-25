# AI

## Objetivo

Estrutura inicial da camada de IA compartilhada — apenas estrutura, nenhuma funcionalidade implementada, por restrição explícita da Missão ENG-0000.1.

## Conteúdo

- [agents/](agents/README.md) — definições de agentes (ver `services/kernel/ai-runtime/`, que executa; aqui fica a definição, não a execução)
- [prompts/](prompts/README.md) — prompts versionados (objeto `Prompt` do BOM)
- [tools/](tools/README.md) — ferramentas disponíveis para agentes (objeto `Tool` do BOM)
- [memory/](memory/README.md) — memória persistente (objeto `Memory` do BOM)

## Relação com Outros Módulos

- [services/kernel/ai-runtime/](../../services/kernel/ai-runtime/README.md) — executa o que este pacote define; toda IA passa pelo AI Runtime, nunca acessa dados diretamente ([NOVARIS_CONSTITUTION.md Article XII](../../knowledge/core/NOVARIS_CONSTITUTION.md))
- [knowledge/core/BOM.md § 6 Intelligence Objects](../../knowledge/core/BOM.md) — Agent, Prompt, Tool, Memory, Context, Embedding, Decision, Recommendation, Insight
- [AI_STRATEGY.md](../../knowledge/core/AI_STRATEGY.md), [AI_PLAYBOOK.md](../../knowledge/core/AI_PLAYBOOK.md) — ainda `TODO`, mesma sobreposição não resolvida entre os dois já registrada

## Status

🚧 Estrutura criada (Missão ENG-0000.1). Nenhuma funcionalidade implementada.
