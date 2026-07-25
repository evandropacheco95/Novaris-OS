# Modelagem de Dados

Documentação do esquema de banco de dados PostgreSQL/Supabase do NOVARIS.

> 📖 Convenções e políticas de banco (tabelas, colunas, UUID, soft delete, auditoria, multi-tenant, RLS, índices, constraints, views, RPC, functions, triggers, particionamento, naming, migrations, backup, restore, performance, escalabilidade) têm fonte oficial em [knowledge/core/DATABASE_ARCHITECTURE.md](../knowledge/core/DATABASE_ARCHITECTURE.md) (Missão ARCH-002). Este arquivo permanece para o diagrama ER e a lista de entidades reais, quando existirem.

## Diagrama Entidade-Relacionamento

<!-- Inserir diagrama ER (Mermaid ou imagem) das tabelas principais. -->

🚧 A ser detalhado.

## Entidades Principais

<!-- Listar tabelas centrais do domínio (ex.: organizations, users, subscriptions, ...) com propósito de cada uma. -->

| Tabela | Propósito |
|---|---|
| 🚧 A ser detalhado | |

## Convenções de Schema

Ver [knowledge/core/DATABASE_ARCHITECTURE.md § 1-3, § 16](../knowledge/core/DATABASE_ARCHITECTURE.md) (nomenclatura, chaves primárias UUID, naming convention completa). RLS — ver também [docs/09-seguranca/README.md](../docs/09-seguranca/README.md).

## Migrações

Ver [knowledge/core/DATABASE_ARCHITECTURE.md § 17](../knowledge/core/DATABASE_ARCHITECTURE.md) — ferramenta (Supabase CLI migrations) e convenção de numeração. Detalhamento operacional adicional ainda `TODO` em [docs/05-backend/diretrizes-de-banco-de-dados.md](../docs/05-backend/diretrizes-de-banco-de-dados.md).

## Tópicos a Documentar

- Modelo de multi-tenancy a nível de dados (ver [multi-tenancy.md](multi-tenancy.md) e [DATABASE_ARCHITECTURE.md § 6-7](../knowledge/core/DATABASE_ARCHITECTURE.md))
- Estratégia de indexação e performance — ver [DATABASE_ARCHITECTURE.md § 8, § 20](../knowledge/core/DATABASE_ARCHITECTURE.md)
- Política de retenção e arquivamento de dados — parcialmente coberta em [DATABASE_ARCHITECTURE.md § 18-19](../knowledge/core/DATABASE_ARCHITECTURE.md) (backup/restore), parâmetros exatos ainda pendentes de decisão
