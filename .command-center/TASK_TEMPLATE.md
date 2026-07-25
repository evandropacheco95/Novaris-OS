# Título

`Task: <nome curto>`

## Objetivo

Padronizar o nível `Task` da hierarquia `Epic → Feature → Story → Task → Subtask` definida em [knowledge/core/BACKLOG.md](../knowledge/core/BACKLOG.md), para que toda task nova siga o mesmo esquema de campos.

## Estrutura

```markdown
### Task: <nome> (Story: <story pai>)

- Descrição
- Dependências
- Prioridade
- Complexidade
- Valor
- Sprint
- Critério de Aceite
- Status
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| Story Pai | A qual Story esta Task pertence |
| Descrição | O que precisa ser feito, em uma frase |
| Dependências | Outras tasks, documentos ou decisões necessárias antes |
| Prioridade | Conforme esquema de `BACKLOG.md` |
| Complexidade | Conforme esquema de `BACKLOG.md` |
| Valor | Conforme esquema de `BACKLOG.md` |
| Sprint | Ciclo de entrega, quando aplicável (ver `SPRINT_TEMPLATE.md`) |
| Critério de Aceite | Condição objetiva para considerar a task pronta |
| Status | `Não iniciado` / `Em andamento` / `Bloqueado` / `Concluído` |

## Checklist

- [ ] Story pai identificada e existente em `BACKLOG.md`
- [ ] Dependências mapeadas, nenhuma implícita
- [ ] Critério de aceite é verificável, não subjetivo
- [ ] Se bloqueado, o motivo do bloqueio está registrado
- [ ] Task não duplica outra já existente (Constituição, Artigo 16)
