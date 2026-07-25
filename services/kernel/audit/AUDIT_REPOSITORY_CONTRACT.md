# Audit — Repository Contract (Conceitual)

Versão: 1.0.0

Status: 🟢 Oficial — contrato conceitual de persistência, sem interface real, sem implementação

Missão: ENG-0005.8 (Audit Repository Contract) — EPIC-005

Escopo: definir as responsabilidades conceituais do Repository de `AuditEntry` — o que ele deve e não deve fazer, seus limites em relação à Application Layer e ao Aggregate, e o tratamento da imutabilidade já congelada. **Nenhuma interface real, código, banco, query, ORM, Mapper, infraestrutura, teste ou ADR foi criado.** Nenhum outro documento foi alterado. Diferente de `organization-repository.ts`/`user-repository.ts`/`role-repository.ts` (que já são código real, implementado em `ENG-0002.9`/`ENG-0003.9`), este documento permanece inteiramente conceitual — a implementação real do Repository Contract de Audit é trabalho de uma missão futura, ainda não aberta.

---

## 1. Responsabilidade do Repository

Persistir e recuperar instâncias de `AuditEntry` sem conhecer nenhuma tecnologia — mesma responsabilidade genérica já atribuída a todo Repository do Kernel (`ENGINEERING_PLAYBOOK.md § 3`: "interface (port) para persistência de um Aggregate — implementação concreta vive em `infrastructure/`"). Confirmado como necessário em `AUDIT_DOMAIN_DECISIONS.md § 7`, condicionado à confirmação do Aggregate no Freeze — condição já satisfeita (`AUDIT_AGGREGATE_DESIGN_FREEZE.md`, `ENG-0005.7`).

## 2. O que o Repository Deve Fazer

- Persistir um `AuditEntry` já criado e validado pelo próprio Aggregate (`AuditEntry.create()`) — nunca antes disso.
- Recuperar um `AuditEntry` por sua identidade própria (`id`) — operação genérica, mesma forma de `findById` já usada em `ReadRepository<T>` (Shared Kernel).
- Consultar o histórico de `AuditEntry` associado a um `Target` — a operação especializada já confirmada como necessária (`AUDIT_DOMAIN_DECISIONS.md § 8`; `audit/CONTRACT.md`, `getAuditTrail(objectId)`, terminologia atualizada para `Target`, `AUDIT_DOMAIN_DECISIONS.md § 6`), devolvida em ordem cronológica.
- Devolver falha de infraestrutura através do mesmo padrão já estabelecido (`Result<T, InfrastructureError>`, Shared Kernel) — nunca lançar exceção.

## 3. O que o Repository NÃO Deve Fazer

- **Validar regra de negócio** — isso é exclusivo do Aggregate (`AuditEntry.create()`, já implementado, `ENG-0005.7`).
- **Decidir o que deve ser auditado** — pertence ao domínio de origem (`AUDIT_BOUNDED_CONTEXT.md §§ 2-3`).
- **Enriquecer dados** (`actorId`/`organizationId`/`changeSet`) — pertence à Application Layer do domínio de origem, nunca ao Repository (`AUDIT_DOMAIN_DECISIONS.md § 5`).
- **Conhecer tipos concretos de outro domínio** — o Repository só recebe/devolve `AuditEntry`, nunca importa `Organization`/`User` (`AUDIT_BOUNDED_CONTEXT.md § 9`).
- **Modificar um `AuditEntry` já persistido** — não existe operação de atualização; `AuditEntry` é imutável por design (§ 6).
- **Decidir sozinho sobre retenção ou expurgo de dados** — questão de compliance, fora de escopo do Repository (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 16`).
- **Expor qualquer detalhe de tecnologia** (Prisma, SQL) em sua assinatura pública.

## 4. Operações Obrigatórias Conceituais

| Operação | Natureza | Fonte |
|---|---|---|
| Salvar um `AuditEntry` | Escrita, uma única vez por instância (nunca atualização) | Consequência de § 6; mesma forma de `save` em `WriteRepository<T>` |
| Recuperar um `AuditEntry` por `id` | Leitura genérica | Mesma forma de `findById`/`findAll`/`exists` já herdados de `ReadRepository<T>` |
| Consultar histórico por `Target` | Leitura especializada, responsabilidade primária do domínio | `AUDIT_DOMAIN_DECISIONS.md § 8`; `audit/CONTRACT.md` |

Nenhuma assinatura, nome de método ou tipo de retorno real é definido aqui — apenas a existência conceitual de cada operação.

## 5. Limites entre Repository, Application Layer e Aggregate

- **Aggregate (`AuditEntry`)**: garante que a instância nasça válida e permaneça imutável (`ENG-0005.7`); nunca se persiste sozinho, nunca conhece o Repository.
- **Application Layer do próprio Audit Domain**: orquestra a chamada a `AuditEntry.create()` seguida da chamada ao Repository para persistir; orquestra as consultas de leitura, delegando ao Repository — nunca enriquece, nunca valida regra de negócio (`AUDIT_TECHNICAL_BLUEPRINT.md §§ 2-3`).
- **Application Layer de cada domínio de origem** (Identity, Organization, futuros): enriquece o fato bruto antes de qualquer chamada chegar ao Audit Domain — nunca chama o Repository de Audit diretamente; a forma exata de comunicação (chamada direta vs. Event Bus) permanece bloqueada (§ 8).
- **Repository**: só traduz entre a representação em memória do Aggregate e a persistência real (quando implementado) — nunca decide, nunca valida, nunca enriquece.

## 6. Tratamento Conceitual de Imutabilidade

Porque `AuditEntry` nunca muda após criado (`AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 7-8`), o Repository **nunca precisa de uma operação de atualização** — apenas de uma operação de escrita chamada exatamente uma vez por instância. A composição genérica já usada em todo Repository do Kernel (`WriteRepository<T>`, Shared Kernel) inclui, além de `save`, uma operação de remoção (`delete`) — se essa operação genérica é sequer apropriada para um registro cuja natureza é "nunca deve ser removido" (`BOM.md § 8`: "Registro imutável") é uma tensão **não resolvida aqui**, já registrada como bloqueio (§ 8; `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 16`, tensão entre imutabilidade e uma futura política de retenção/expurgo).

## 7. Relação com Consultas Históricas

A consulta por `Target` é a materialização de `AuditTrail` (`AUDIT_UBIQUITOUS_LANGUAGE.md § 3`: "conceito de consulta, não necessariamente um objeto próprio") — o Repository devolve uma coleção de `AuditEntry` já existentes, filtrados por `targetId`/`targetType` e ordenados cronologicamente (mesma semântica de `audit/CONTRACT.md`: "ordenado cronologicamente"). `AuditTrail` nunca é persistido como entidade própria — é sempre o resultado de uma consulta sobre `AuditEntry`.

## 8. Decisões Ainda Bloqueadas

- **Nome e assinatura exata** do método de consulta por `Target` — `AUDIT_DOMAIN_DECISIONS.md § 8` já registrou que isso fica para a missão de implementação real do Repository Contract (ainda não aberta).
- **Se a operação de remoção (`delete`) genérica é apropriada** para `AuditEntry`, dada sua imutabilidade — não resolvido (§ 6).
- **Consultas adicionais** (por `Actor`, por período, por `Organization`) — especulativas, nenhuma fonte oficial as confirma (`AUDIT_DOMAIN_DECISIONS.md § 9`).
- **Paginação** — registrada como pendência desde `audit/CONTRACT.md` (ARCH-001), nunca resolvida.
- **Tecnologia de persistência** — inteiramente fora de escopo desta e de toda missão conceitual do EPIC-005 até agora.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Rastreabilidade**: toda seção cita a decisão exata de `AUDIT_AGGREGATE_DESIGN_FREEZE.md`, `AUDIT_TECHNICAL_BLUEPRINT.md`, `AUDIT_DOMAIN_DECISIONS.md` ou `AUDIT_BOUNDED_CONTEXT.md`.
- **Comparação com Repository Contracts existentes**: `organization-repository.ts` (ENG-0003.9) e `user-repository.ts`/`role-repository.ts` (ENG-0002.9) são todos `extends ReadRepository<T>, WriteRepository<T> {}` — **zero métodos próprios**, decisão explicitamente justificada por "nenhuma fonte define índices/consultas reais... acrescentar um método agora seria antecipar uma decisão de infraestrutura". O Repository de Audit **diverge dessa composição** — precisa de ao menos uma consulta especializada (por `Target`) porque essa consulta não é uma conveniência antecipada, é a responsabilidade primária que já justificou `AuditEntry` como Aggregate (`AUDIT_DOMAIN_DISCOVERY.md § 9`; já registrado como divergência esperada em `AUDIT_DOMAIN_DECISIONS.md § 8` e nas Validações de `AUDIT_DOMAIN_DISCOVERY.md`). Esta é a única divergência de padrão entre Audit e os dois precedentes — nenhuma outra foi encontrada.

## DMV

1. Alguma Entity foi criada? Não. 2. Algum Aggregate foi alterado? Não — `AuditEntry` intocado. 3. Algum Value Object foi criado? Não. 4. Alguma regra nova foi criada? Não — toda responsabilidade deriva de decisão já tomada. 5. Alguma decisão do Freeze/Decisions foi modificada? Não. 6. Há necessidade de ADR? Não para este documento — a única ADR já recomendada (`AUDIT_DOMAIN_DECISIONS.md § 5`, mecanismo de enriquecimento) permanece registrada, não criada aqui; a divergência de composição do Repository (§ 8 acima) não exige ADR por si só (é decorrência de uma necessidade já confirmada, não uma decisão de arquitetura nova).

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhuma interface real, código, banco, query, ORM, Mapper, infraestrutura, teste ou ADR criado | ✅ |
| Toda responsabilidade rastreável a decisão já tomada | ✅ |
| Comparação com Repository Contracts reais feita sem propor implementação | ✅ |
| Itens não decididos explicitamente listados (§ 8), não presumidos | ✅ |
| Nenhum outro documento alterado | ✅ |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`organization-repository.ts`/`user-repository.ts`, com divergência justificada) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **A divergência do padrão "zero métodos" foi apresentada como fato consumado ou como decisão já tomada em missão anterior?** Como decisão já tomada — citada exatamente a `AUDIT_DOMAIN_DECISIONS.md § 8`, não reapresentada como nova aqui.
2. **Alguma interface real foi criada, mesmo como pseudocódigo?** Não — toda operação é descrita em prosa e tabela (§ 4), sem nome de método, assinatura ou tipo de retorno real.
3. **A tensão entre imutabilidade e a operação `delete` genérica foi resolvida por conveniência?** Não — permanece explicitamente listada como bloqueio (§ 6, § 8), sem escolha feita.
4. **Este documento seria suficiente para orientar uma futura missão real de Repository Contract sem reler todo o histórico do Epic?** Sim — §§ 1-7 já consolidam responsabilidade, limites e operações; § 8 já aponta exatamente o que essa missão futura precisa decidir.

## Relatório Final

**Arquivos criados**: `services/kernel/audit/AUDIT_REPOSITORY_CONTRACT.md`.

**Arquivos alterados**: nenhum.

**Validações**: Link Checker (ver abaixo), rastreabilidade, comparação com `organization-repository.ts`/`user-repository.ts`/`role-repository.ts` — 1 divergência de padrão identificada e justificada (necessidade de consulta especializada), nenhuma outra encontrada.

**Conclusão**: contrato conceitual de Repository definido — responsabilidades, limites entre camadas, tratamento de imutabilidade e 5 itens ainda bloqueados, prontos para orientar uma futura missão real de Repository Contract.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
