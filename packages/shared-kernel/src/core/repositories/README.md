# repositories

## Objetivo

Interfaces (ports) para persistência de um Aggregate — a implementação concreta vive na Infrastructure Layer de cada serviço, nunca aqui. Definição: [ENGINEERING_PLAYBOOK.md § 3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer).

## Conteúdo (Missão ENG-0001.7 — Repository Contracts)

- [repository.ts](repository.ts) — `Repository<T extends AggregateRoot<unknown>>`: interface base vazia; a regra "só Aggregate Roots têm Repository" é expressa pela constraint no parâmetro de tipo, não por operações.
- [read-repository.ts](read-repository.ts) — `ReadRepository<T>` (estende `Repository<T>`): `findById(id): Promise<Result<Option<T>, InfrastructureError>>`, `findAll(): Promise<Result<T[], InfrastructureError>>`, `exists(id): Promise<Result<boolean, InfrastructureError>>`.
- [write-repository.ts](write-repository.ts) — `WriteRepository<T>` (estende `Repository<T>`): `save(entity): Promise<Result<void, InfrastructureError>>`, `delete(id): Promise<Result<void, InfrastructureError>>`.

Todo método usa as primitivas já implementadas — [`Result<T,E>`](../../types/README.md) para sucesso/falha de infraestrutura, [`Option<T>`](../../types/README.md) para achar/não achar em `findById`, [`InfrastructureError`](../../errors/README.md) como canal de erro fixo (falha de infraestrutura, não regra de negócio — a validação de negócio já aconteceu antes de chamar `save`).

Nenhuma implementação concreta (Prisma, Supabase, in-memory de produção) foi feita — apenas os contratos. Um fake em memória existe só dentro de `repository.test.ts`, para testar os contratos.

## Status

🟢 3 interfaces implementadas e testadas (Missão ENG-0001.7). Nenhuma implementação concreta.
