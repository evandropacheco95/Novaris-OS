# sales / tests / domain / repositories

## Purpose

Testes do contrato `OpportunityRepository`/`PipelineRepository` — espelha [domain/repositories/](../../../domain/repositories/README.md).

## Conteúdo (Missão ENG-0052)

- [opportunity-repository.contract.test.ts](opportunity-repository.contract.test.ts) — 7 testes: composição estrutural com `ReadRepository<Opportunity>`/`WriteRepository<Opportunity>`; `save`/`findById`/`findAll`/`exists`/`delete`, todos exercitando `InMemoryOpportunityRepository` (`infrastructure/repositories/`, `ENG-0050`) diretamente.
- [pipeline-repository.contract.test.ts](pipeline-repository.contract.test.ts) — 7 testes, mesma cobertura, via `InMemoryPipelineRepository`, para `Pipeline`.

**Diferença deliberada dos dois padrões já existentes no monorepo**: `organization-repository.contract.test.ts` (Organization, `ENG-0003.10`) é inteiramente checagem em tempo de compilação — Fake/Mock/InMemory proibidos explicitamente por aquela missão, já que `Organization` não tinha implementação real de Infrastructure Layer. `user-repository.test.ts`/`role-repository.test.ts` (Identity, `ENG-0002.9`) e `repository.test.ts` (Shared Kernel, `ENG-0001.7`) usam uma classe `InMemory*Repository` **Fake, definida dentro do próprio arquivo de teste**, pela mesma razão — nenhuma implementação real existia ainda. `Sales` diverge de ambos porque já possui uma implementação real e funcional (`InMemoryOpportunityRepository`/`InMemoryPipelineRepository`, `ENG-0050`, não é um Fake de teste) e a Ordem de Missão ENG-0052 pede explicitamente para validar essa infraestrutura já existente — por isso esta suíte importa e exercita as classes reais, sem redefinir nenhuma Fake local. Nenhum banco, ORM, Prisma, migration, mock externo, Command, Handler ou Application Layer foi criado.

Nenhuma regra de negócio nova, Entity, Aggregate, Value Object ou Domain Event foi criado — `Opportunity`, `Pipeline`, `Proposal`, `Stage` e as interfaces `OpportunityRepository`/`PipelineRepository` permanecem inalterados.

## Status

🟢 14 testes implementados (Missão ENG-0052). Sem banco, ORM, schema, migration ou API real.
