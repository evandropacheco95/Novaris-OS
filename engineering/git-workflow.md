# Git Workflow

Formalizado por `ENS-0004` — decisões do CTO, dado que o repositório GitHub (`evandropacheco95/Novaris-OS`) tinha até então push direto na `master`, sem PR, sem branch protection e sem CI (achado de auditoria de escopo desta sessão).

## Estratégia de Branches

Trunk-based simplificado: `master` é a única branch protegida (nome real do branch remoto — este documento historicamente falava em `main`; corrigido aqui em vez de renomear o branch, para evitar churn desnecessário num repositório já em uso). Trabalho novo nasce em branches de feature curtas (`tipo/descricao-curta`, convenção abaixo), fecha via Pull Request, e é apagada após o merge.

## Convenção de Nomenclatura de Branches

```
tipo/descricao-curta
```

Exemplos: `feat/dashboard-metrics`, `fix/auth-token-expiry`, `docs/api-reference`.

## Convenção de Commits

Um commit por missão (`ADR-`/`ADM-`/`ENS-`/`ENG-`), prefixado pelo próprio Mission ID — convenção já em uso real desde o primeiro commit do repositório, não um padrão novo inventado aqui:

```
<Mission-ID>: <descrição curta em português>

<corpo opcional — o que mudou, por quê, o que foi verificado>
```

Exemplos reais: `ENG-0160: Pipeline (Sales) completo — Application+API+Frontend (ADR-0051)`, `ADM-0002: formaliza o prefixo NEP- na taxonomia de Mission ID`. Não é Conventional Commits (`feat:`/`fix:`/`chore:`) — o Mission ID já carrega essa informação (`ENG-` é sempre implementação, `ADR-`/`ADM-` são sempre decisão/documentação).

## Processo de Merge

Squash merge via Pull Request — mantém a disciplina de "um commit por missão" já em uso na `master`, mesmo vindo de uma branch de feature com múltiplos commits intermediários. **0 aprovações obrigatórias por enquanto** (decisão do CTO, `ENS-0004`): o repositório é single-committer hoje — exigir aprovação travaria todo merge até haver um 2º colaborador real; revisitar esse número quando isso acontecer. CI (`.github/workflows/ci.yml`) precisa estar verde antes do merge. Ver [diretrizes-de-code-review.md](diretrizes-de-code-review.md) para o checklist de conteúdo do PR.

## Política de Proteção da Branch `master`

Configurada via API do GitHub (`ENS-0004`): exige Pull Request antes de merge (bloqueia push direto), exige o status check de CI, 0 aprovações obrigatórias (ver acima), `enforce_admins` desligado por enquanto (o único committer ainda precisa poder administrar o repositório sozinho — revisitar junto com o número de aprovações).

## Tópicos a Documentar

- Processo de release e tags de versão
