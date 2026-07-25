# tests

Espelha a estrutura de `src/` ([ENGINEERING_PLAYBOOK.md § 2, § 15](../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#2-estrutura-obrigatória-dos-serviços)) — testes vivem em `tests/`, não colocados junto ao código-fonte (diferente da convenção usada em `packages/shared-kernel/`, que é um pacote, não um "serviço em `services/kernel/<modulo>/`").

Framework: `node:test`/`node:assert` (built-in do Node.js) — mesma escolha do Shared Kernel (ENG-0001.2), já que nenhum framework de teste foi formalmente decidido ([ENGINEERING_PLAYBOOK.md § 15](../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md): "requer decisão/ADR").

## Status

🟢 `domain/value-objects/` testado (Missão ENG-0002.3).
