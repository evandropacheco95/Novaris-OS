# Diretrizes de Banco de Dados

> 📖 Convenções e políticas oficiais de banco (tabelas, colunas, UUID, soft delete, auditoria, multi-tenant, RLS, índices, constraints, views, RPC, functions, triggers, particionamento, naming, migrations, backup, restore, performance, escalabilidade): [knowledge/core/DATABASE_ARCHITECTURE.md](../../knowledge/core/DATABASE_ARCHITECTURE.md) (Missão ARCH-002). Este arquivo cobre o que for específico do processo operacional de backend, não a arquitetura em si.

## Migrações

Ferramenta e convenção de nomenclatura: ver [DATABASE_ARCHITECTURE.md § 17](../../knowledge/core/DATABASE_ARCHITECTURE.md). Processo de revisão obrigatória específico deste time: 🚧 a ser detalhado.

## Convenções de Schema

Ver [architecture/modelagem-de-dados.md](../../architecture/modelagem-de-dados.md) e [DATABASE_ARCHITECTURE.md § 1-3, § 16](../../knowledge/core/DATABASE_ARCHITECTURE.md).

## Row Level Security (RLS)

Ver [DATABASE_ARCHITECTURE.md § 7](../../knowledge/core/DATABASE_ARCHITECTURE.md) e [docs/09-seguranca/protecao-de-dados.md](../09-seguranca/protecao-de-dados.md).

## Performance

Ver [DATABASE_ARCHITECTURE.md § 8, § 20](../../knowledge/core/DATABASE_ARCHITECTURE.md) (índices obrigatórios, proibição de N+1). Metas numéricas de SLA continuam `TODO` — não definidas em nenhum documento.

## Tópicos a Documentar

- Processo de revisão de migrações destrutivas
- Estratégia de seed/fixtures para desenvolvimento e testes
