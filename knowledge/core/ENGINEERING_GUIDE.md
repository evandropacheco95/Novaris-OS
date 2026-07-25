# Engineering Guide — Como Trabalhar na NOVARIS

> Este guia consolida, em formato prático, regras já estabelecidas em [CONSTITUTION.md](CONSTITUTION.md) e nos documentos de [engineering/](../../engineering/README.md). Onde a regra já existe, este documento aponta para ela. Onde ainda não existe, fica marcado `TODO` — nada aqui foi inventado além do que já está decidido em outro lugar.

## Fluxo Git

Regra estabelecida: nenhuma. [engineering/git-workflow.md](../../engineering/git-workflow.md) existe mas está `🚧 A ser detalhado`.

**TODO**: estratégia de branches ainda não definida.

## Branches

**TODO**: convenção de nomenclatura de branches ainda não definida (ver [engineering/git-workflow.md](../../engineering/git-workflow.md)).

## Commits

**TODO**: convenção de commits ainda não definida. Ver também [knowledge/core/NAMING_CONVENTIONS.md § Commits](NAMING_CONVENTIONS.md) (também `TODO`).

## Releases

**TODO**: não definido. Ver [docs/15-changelog-e-versionamento/politica-de-versionamento.md](../../docs/15-changelog-e-versionamento/politica-de-versionamento.md) (também `🚧`).

## Testes

Regra estabelecida em [CONSTITUTION.md § Artigo 19 — Qualidade](CONSTITUTION.md#artigo-19--qualidade): nenhuma funcionalidade é considerada concluída sem testes, documentação, logs, validação e critérios de aceite atendidos.

Estratégia concreta de testes (tipos, cobertura, ferramentas): **TODO** — ver [engineering/estrategia-de-testes.md](../../engineering/estrategia-de-testes.md) (`🚧`).

## Deploy

Stack de deploy já fixa: Vercel ([architecture/stack-tecnologica.md](../../architecture/stack-tecnologica.md)).

Processo concreto de deploy: **TODO** — ver [docs/08-infraestrutura/deploy-na-vercel.md](../../docs/08-infraestrutura/deploy-na-vercel.md) (`🚧`).

## Documentação

Regra estabelecida em [CONSTITUTION.md § Artigo 14 — Documentação](CONSTITUTION.md#artigo-14--documentação): toda implementação deve vir acompanhada de documentação; código sem documentação é considerado incompleto.

Regra estabelecida em [CONSTITUTION.md § Artigo 15 — Desenvolvimento](CONSTITUTION.md#artigo-15--desenvolvimento): antes de implementar qualquer funcionalidade é obrigatório consultar a documentação existente, consultar regras de negócio, consultar padrões, verificar reutilização, verificar impacto, e atualizar a documentação ao final.

## Revisão

**TODO**: processo concreto de code review ainda não definido — ver [engineering/diretrizes-de-code-review.md](../../engineering/diretrizes-de-code-review.md) (`🚧`).

## CI/CD

**TODO**: pipeline concreto ainda não definido — ver [engineering/pipeline-ci-cd.md](../../engineering/pipeline-ci-cd.md) e [docs/08-infraestrutura/github-actions.md](../../docs/08-infraestrutura/github-actions.md) (ambos `🚧`).

## Boas Práticas

Regras já estabelecidas em [CONSTITUTION.md § Artigo 8 — Filosofia de Engenharia](CONSTITUTION.md#artigo-8--filosofia-de-engenharia): todo código deve ser legível, testável, modular, reutilizável, documentado, versionado, seguro, escalável e observável.

Regras já estabelecidas em [CONSTITUTION.md § Artigo 16 — Reutilização](CONSTITUTION.md#artigo-16--reutilização): é proibido criar componentes duplicados, hooks duplicados, APIs duplicadas, funções duplicadas, queries duplicadas ou tipos duplicados.

## Padrões

Ver [engineering/padroes-de-codigo.md](../../engineering/padroes-de-codigo.md) (`🚧`) e [knowledge/core/NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) (`🚧`).

## Checklist Obrigatório

Derivado diretamente das regras já estabelecidas acima — não é uma lista nova:

- [ ] Documentação consultada antes de implementar ([Artigo 15](CONSTITUTION.md#artigo-15--desenvolvimento))
- [ ] Verificação de reutilização feita — nada duplicado criado ([Artigo 16](CONSTITUTION.md#artigo-16--reutilização))
- [ ] Código legível, testável, modular, documentado, versionado, seguro, escalável, observável ([Artigo 8](CONSTITUTION.md#artigo-8--filosofia-de-engenharia))
- [ ] Testes, documentação, logs e validação presentes; critérios de aceite atendidos ([Artigo 19](CONSTITUTION.md#artigo-19--qualidade))
- [ ] Toda tabela nova documentada com objetivo, relacionamentos, permissões, RLS, auditoria, migrations, índices e comentários, se aplicável ([Artigo 10](CONSTITUTION.md#artigo-10--banco-de-dados))
- [ ] Documentação atualizada ao final ([Artigo 15](CONSTITUTION.md#artigo-15--desenvolvimento))

## Status

🚧 Guia estruturado a partir de regras já existentes. Seções sem regra estabelecida permanecem `TODO` — não foram preenchidas com convenções inventadas.
