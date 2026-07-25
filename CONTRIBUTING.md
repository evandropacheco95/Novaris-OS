# Contribuindo com o NOVARIS

Este documento descreve o processo esperado para contribuir com o repositório.

## Ambiente de Desenvolvimento (Missão ENG-0000)

```
pnpm install                # instala dependências de todo o monorepo (workspaces em pnpm-workspace.yaml)
cp .env.example .env.local  # preencha com valores reais — nunca commitar .env.local
docker compose up -d        # sobe o Postgres local
pnpm dev                    # roda todos os apps/services em modo dev via Turborepo
pnpm lint / pnpm test / pnpm build   # via Turborepo, cacheado por pacote
```

Requer Node ≥ 20 e pnpm (ver `packageManager` em `package.json`). Stack de tooling decidida em [ADR-0005](adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md).

## Antes de Contribuir

1. Leia [docs/00-visao-geral/README.md](docs/00-visao-geral/README.md) para entender o propósito do produto.
2. Leia [engineering/README.md](engineering/README.md) para entender os padrões de engenharia adotados.
3. Verifique se já existe uma issue ou discussão sobre o que você pretende propor.

## Fluxo de Contribuição (proposto)

1. Abra uma issue descrevendo o problema ou a proposta antes de codificar.
2. Crie um branch a partir de `main` seguindo a convenção descrita em [engineering/git-workflow.md](engineering/git-workflow.md).
3. Siga os [padrões de código](engineering/padroes-de-codigo.md).
4. Abra um Pull Request usando o template em [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md).
5. Garanta que o PR passe pela revisão descrita em [engineering/diretrizes-de-code-review.md](engineering/diretrizes-de-code-review.md).

## Documentação Primeiro

No NOVARIS, toda decisão de arquitetura relevante deve ser registrada como um ADR em [adr/](adr/README.md), seguindo [adr/TEMPLATE.md](adr/TEMPLATE.md), antes da implementação. Código sem documentação correspondente não deve ser mesclado. Antes de implementar, ver também [engineering/decision-tree.md](engineering/decision-tree.md).

## Status

🚧 Este documento é um esqueleto inicial e será detalhado conforme o processo de engenharia for formalizado.
