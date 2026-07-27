# NEF — Modelo de Planejamento

Versão: 1.0.0

Status: Oficial

---

## Objetivo

Formalizar a hierarquia de planejamento de engenharia da NOVARIS: **PROGRAM → EPIC → MISSION → TASK → CHECKLIST**, conforme pedido pela Ordem de Missão NEF-001.

## ✅ Nota de Consolidação (resolvida por ENG-0000.5)

Este era o **segundo** modelo hierárquico de planejamento do repositório. [ADR-0008](../adr/ADR-0008-foundation-freeze.md) (Missão ENG-0000.5, Foundation Freeze) formalizou **PROGRAM → EPIC → MISSION → TASK → CHECKLIST** como o **padrão obrigatório de execução de engenharia** (instrução direta da própria ordem de missão, não uma escolha entre concorrentes).

- [`knowledge/core/BACKLOG.md`](../knowledge/core/BACKLOG.md) (**Epic → Feature → Story → Task → Subtask**) **não é substituído** — é um modelo complementar, de **planejamento de produto** (o quê construir), não de execução de engenharia (como construir). Mapeamento explícito: o nível "Epic" de `BACKLOG.md` corresponde ao nível **EPIC** deste modelo (mesmo conceito, dois vocabulários); "Feature" e "Story" são exclusivos do lado produto, sem equivalente aqui; "Task"/"Subtask" de `BACKLOG.md` podem corresponder a TASK/CHECKLIST quando a Mission tiver natureza de produto.
- A notação `ENG-XXXX`/`ARCH-XXX`/`NEF-XXX` já em uso operacional nesta sessão **é a instância real do nível MISSION** — confirmado, não mais um terceiro padrão concorrente. A própria missão ENG-0000.5 (Programa: `PROGRAM-001 — NOVARIS Platform`, Epic: `Foundation`, Mission: `ENG-0000.5`) segue exatamente esta hierarquia.
- **Observação operacional, não normativa**: a ordem de missão ENG-0000.5 também usou o campo "Sprint" (`Sprint-0`) entre EPIC e MISSION, como agrupamento de missões por janela de tempo dentro de um Epic. Documentado aqui como uso real observado; cadência, duração e critério de abertura/fechamento de Sprint continuam `TODO` — nenhum documento define esses parâmetros ainda.

---

## Hierarquia

```
PROGRAM
└── EPIC
    └── MISSION
        └── TASK
            └── CHECKLIST
```

### PROGRAM

**Definição**: o maior nível de agrupamento — um objetivo estratégico plurianual da NOVARIS (ex.: "Core Platform", "AI & Automation Foundation").
**Campos**: Nome, Objetivo, Épicos que o compõem, Status.
**Origem real**: os "ÉPICO 001 FOUNDATION ENGINEERING", "ÉPICO 002 AI & AUTOMATION FOUNDATION" etc. já citados nas missões ENG-0000 em diante correspondem a este nível, apesar de terem sido nomeados "Épico" no texto original da missão — ver nota de conflito acima.

### EPIC

**Definição**: um recorte de escopo dentro de um Program, grande o suficiente para durar várias Missions (ex.: "Identity Service", "Kernel — Event Bus").
**Campos**: Nome, Program pai, Objetivo, Missions que o compõem, Status.

### MISSION

**Definição**: a unidade de trabalho já em uso real nesta sessão (`ARCH-001`, `ENG-0000`, `NEF-001` etc.) — um pedido delimitado, com escopo e restrições explícitas, executado de ponta a ponta.
**Campos**: seguem o [MISSION_TEMPLATE.md](../.command-center/MISSION_TEMPLATE.md) (19 campos: Missão, Objetivo, Contexto, Escopo, Fora do Escopo, Dependências, Arquivos Envolvidos, Banco de Dados, APIs, Componentes, Riscos, Critérios de Aceite, Checklist, Entregáveis, Testes, Plano de Rollback, Status, Responsável, Prioridade).
**Regra**: toda implementação de código nasce de uma Mission — mesma regra já expressa em `specs/SPEC_TEMPLATE.md` para funcionalidades ("Toda funcionalidade da NOVARIS deverá nascer de uma SPEC"). Desde a Ordem de Missão ENG-0002.A, toda Mission só é considerada concluída com **Self Review + Architecture Compliance Report (ACR)** ([.command-center/ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md](../.command-center/ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md)) apresentados juntos; **Domain Model Validation (DMV)** obrigatório também quando a missão envolve modelagem de domínio (desde ENG-0002.4).

**Taxonomia de prefixo de Mission ID** (adotada a partir da Ordem de Missão ADM-0001/ENS-0001, não retroativa aos IDs já usados):

| Prefixo | Tipo de Mission | Exemplo real |
|---|---|---|
| `ADR-` | Decisão arquitetural individual | `ADR-0001` a `ADR-0008` |
| `ADM-` | Índice/consolidação de decisões já tomadas | `ADM-0001` |
| `ENS-` | Padrão de engenharia (Engineering Standard) — como implementar um tipo de componente | `ENS-0001` |
| `ENG-` | Implementação técnica (código ou modelagem de domínio) | `ENG-0001.x`, `ENG-0002.x` |
| `NEP-` | NOVARIS Engineering Playbook — documento-guia operacional de leitura linear, documentação pura (não produz código; par funcional de `DOC-`, formalizado por `ADM-0002`) | `NEP-0001` |

`ACR` (Architecture Compliance Report) e `DMV` (Domain Model Validation) **não são prefixos de Mission ID própria** — são relatórios obrigatórios entregues dentro de qualquer Mission dos 4 tipos acima (§ Regra), não uma quinta sequência numerada.

### TASK

**Definição**: uma unidade de trabalho executável dentro de uma Mission, tipicamente atribuível a uma pessoa/agente e concluível em um período curto.
**Campos**: Nome, Mission pai, Responsável, Dependências, Status.
**Relação com `BACKLOG.md`**: quando a Mission tem natureza de produto (não só infraestrutura), suas Tasks podem corresponder às Tasks já definidas em `BACKLOG.md` sob uma Story — não há necessidade de duplicar, apenas referenciar.

### CHECKLIST

**Definição**: o nível mais granular — a lista de verificações objetivas que fecham uma Task.
**Campos**: item, verificado (sim/não).
**Fonte**: não recria checklists — aponta para os já existentes, indexados em [09-checklists/README.md](09-checklists/README.md) (`ENGINEERING_CHECKLIST.md`, `RELEASE_CHECKLIST.md`, `ENGINEERING_PLAYBOOK.md § 18-19`).

---

## Regras

- Nenhum código de negócio é implementado fora de uma MISSION.
- Toda MISSION segue [MISSION_TEMPLATE.md](../.command-center/MISSION_TEMPLATE.md).
- Toda MISSION que resulte em decisão arquitetural gera um ADR (ver [EXECUTION_PROTOCOL.md](../.command-center/EXECUTION_PROTOCOL.md)).
- Toda MISSION só é considerada concluída com Self Review **e** ACR apresentados juntos ([ENG-0002.A](../.command-center/ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md); ver [09-checklists/](09-checklists/README.md)).
- O nível PROGRAM/EPIC é estratégico — sua granulação e priorização real continuam `TODO` (mesma limitação já registrada em `BACKLOG.md`: não existe metodologia de priorização documentada).

## Exemplos

A missão real `NEF-001` (este próprio documento) mapeia como: PROGRAM = "Foundation" · EPIC = "Engineering Framework" · MISSION = `NEF-001` · TASK = "Escrever ROLES.md", "Escrever PLANNING_MODEL.md" etc. · CHECKLIST = validações de link + build ao final.

## Referências Cruzadas

- [ROLES.md](ROLES.md) — quem executa cada nível
- [knowledge/core/BACKLOG.md](../knowledge/core/BACKLOG.md) — modelo de planejamento de produto (Epic/Feature/Story/Task/Subtask), não substituído por este documento
- [.command-center/MISSION_TEMPLATE.md](../.command-center/MISSION_TEMPLATE.md)
- [.command-center/EXECUTION_PROTOCOL.md](../.command-center/EXECUTION_PROTOCOL.md)

## Status

🟢 Oficial (v1.0.0) — padrão obrigatório de execução de engenharia, confirmado por [ADR-0008](../adr/ADR-0008-foundation-freeze.md) (Missão ENG-0000.5). Relação com `BACKLOG.md` e com a notação `ENG-XXXX` resolvida (ver Nota de Consolidação acima).
