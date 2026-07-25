# Aggregate Implementation Standard — Business Domain Extension

Versão: 1.0.0

Status: 🟡 Extensão oficial — complementa, nunca substitui, o padrão já congelado

Missão: ENG-0038 (Aggregate Implementation Standard)

---

## ⚠️ Nota de Colisão de Nome (leia antes de tudo)

A Ordem de Missão `ENG-0038` pede a criação de `knowledge/architecture/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md` — **nome idêntico** a um documento já existente, oficial e congelado: [`knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md`](../../engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (**ENS-0001**, Missão `ENS-0001`, `Versão 1.0.0`, `Status: 🟢 Oficial — padrão obrigatório, congelado`), já validado contra código real (`User`/`Role` do Identity Domain) e já citado como autoridade em toda esta engenharia (`ARCHITECTURE_GOVERNANCE.md § 3`, `KERNEL_DOMAIN_LIFECYCLE_V2.md § 5`, `SALES_TECHNICAL_BLUEPRINT.md § 5`, `services/domains/sales/domain/aggregates/README.md`).

Aplicando o princípio já estabelecido **"Verify Before Reimplementing"** (`KERNEL_DOMAIN_LIFECYCLE_V2.md § 2`, nascido exatamente de uma situação análoga — `ENG-0003.13` descobrindo que seu próprio objetivo já estava cumprido) e **"Single Source of Truth"** (`ARCHITECTURE_GOVERNANCE.md § 2`): este documento **não duplica, não substitui e não reescreve** nenhuma regra já definida por ENS-0001. Onde a Ordem de Missão pede um tópico que ENS-0001 já cobre integralmente, este documento **cita e remete** a ENS-0001, em vez de repetir seu conteúdo. Este documento existe apenas para cobrir o que ENS-0001 — escrito no contexto do Kernel (`Identity`), antes de qualquer Business Domain ou Blueprint existir — não tinha como antecipar: múltiplos Aggregates relacionados por composição dentro do mesmo domínio (`Opportunity`+`Pipeline`, `Sales`), referências cross-domínio de negócio (não apenas cross-Organization), e a relação com artefatos que não existiam em `EPIC-002` (`DOMAIN_MODEL.md § SALES DOMAIN` já existia, mas `SALES_TECHNICAL_BLUEPRINT.md`/`ARCHITECTURE_GOVERNANCE.md` não).

**Registrado, não corrigido silenciosamente** — mesma disciplina já usada para a fragmentação de numeração `ADR-0011`/`adr/README.md`. Recomenda-se, em missão futura, decidir se este documento deve ser renomeado para evitar a colisão de nome (ex.: `BUSINESS_DOMAIN_AGGREGATE_EXTENSION.md`) — não executado aqui, pois a Ordem de Missão especificou o nome literalmente.

---

## 1. Purpose

Estender `AGGREGATE_IMPLEMENTATION_STANDARD.md` (ENS-0001) com orientação específica para **Business Domains** (`services/domains/`), usando `Sales` (`Opportunity`, `Pipeline`) como primeiro caso real — sem alterar nenhuma regra já congelada por ENS-0001, e sem introduzir nenhuma regra de negócio nova.

## 2. Aggregate Responsibilities

**Ver ENS-0001 § 1** — regra idêntica, sem extensão necessária: todo Aggregate garante suas próprias invariantes, expõe estado só por leitura, muta só por método nomeado com significado de domínio.

**Extensão para Business Domains**: quando um domínio tem mais de um Aggregate Root relacionado por composição (`Opportunity` referencia `Pipeline` por id, `ADR-0021`), cada Aggregate continua responsável **apenas** por suas próprias invariantes — nenhum Aggregate valida ou impõe invariante de outro Aggregate do mesmo domínio, mesmo que ambos pertençam ao mesmo Bounded Context.

## 3. Aggregate Root Responsibilities

**Ver ENS-0001 §§ 1-2** — sem extensão necessária.

## 4. Internal Entities

**Não coberto explicitamente por ENS-0001** (que trata do caso de um único Aggregate sem Entity interna detalhada, `User`/`Role`). Regra geral, generalizada de `ADR-0021`: uma Internal Entity pertence a **exatamente uma instância** do seu Aggregate Root — nunca compartilhada entre múltiplas instâncias. Se um objeto candidato a Entity é reutilizado por múltiplas instâncias de um Aggregate (ex.: `Pipeline` sendo usado por várias `Opportunity`s), ele **não** é Entity interna — é um Aggregate Root próprio, referenciado por id (mesmo critério que decidiu `Stage` como Entity de `Pipeline`, não de `Opportunity`, e `Pipeline` como Aggregate Root próprio, não Entity de nada).

## 5. Value Objects

**Ver ENS-0001** (uso de `ValueObject<T>` do Shared Kernel, implícito em toda a estrutura) — sem extensão de regra. Nota de aplicação: um Value Object candidato sem forma de campos definida (ex.: `Revenue`, `SALES_TECHNICAL_BLUEPRINT.md § 13`) não deve ser implementado até sua forma ser decidida — implementar uma forma não sancionada seria inventar regra de negócio.

## 6. Factory Methods

**Ver ENS-0001 § 3** — `create()`/`reconstitute()` como únicos pontos de entrada, sem extensão necessária.

## 7. Constructors

**Ver ENS-0001 § 2** — construtor `protected`/`private`, sem validação própria, sem extensão necessária.

## 8. State Mutation

**Ver ENS-0001 § 1** — só via método nomeado com significado de domínio, nunca setter genérico. Sem extensão necessária.

## 9. Invariant Enforcement

**Ver ENS-0001 § 4** — verificada em `create()` e em cada método de mutação; nunca lança exceção; toda invariante cita fonte documentada. Sem extensão necessária — reafirma-se que nenhuma das invariantes candidatas de `Sales` (`SALES_AGGREGATE_DESIGN.md § 6`, todas rotuladas "inferidas, não confirmadas") pode ser implementada como regra protegida sem antes ser formalmente confirmada.

## 10. Reference by ID

**Ver ENS-0001 § 7** (escrito no contexto de referência cross-Organization) — regra idêntica generalizada: nenhum Aggregate embute outro Aggregate, de qualquer domínio, sempre por `UniqueEntityId`. Já confirmado sem exceção nos 3 Domain Capabilities implementados (`Identity`, `Organization`, `Audit`) e reafirmado em todo Blueprint de `Sales`.

## 11. Cross-Domain References

**Extensão não coberta por ENS-0001** — que trata apenas de referência cross-Organization (multi-tenancy) dentro do mesmo domínio. Para Business Domains, a mesma regra de "só por id" se estende explicitamente a **referências entre Bounded Contexts diferentes**: `Opportunity` (`Sales`) referencia `Party` (`Customer`), `Task` (`Projects`), `Activity` (`Activity`) — todas por id, nunca por tipo concreto importado do outro domínio (`DOMAIN_MODEL.md § REGRAS`: "Um domínio nunca acessa tabelas de outro domínio"). Nenhum Aggregate de `Sales` deve importar um tipo de `Customer`/`Projects`/`Activity` além do id em si.

## 12. Repository Interaction Rules

**Estende ENS-0001 § 8** (que cobre `reconstitute()`, mas não a interação em si): um Aggregate nunca chama seu próprio Repository, nem o de outro Aggregate — quem orquestra carregar/persistir é a Application Layer. Um Aggregate nunca acessa o Repository de outro Aggregate, mesmo do mesmo domínio (`Opportunity` nunca chama `PipelineRepository` diretamente) — se precisar de dado de outro Aggregate, a Application Layer o carrega separadamente e o fornece por id/valor já resolvido.

## 13. Domain Services Interaction Rules

Regras já definidas por `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md` (ENS-0003) — não duplicadas aqui. Um Domain Service só existe se a regra envolver múltiplos Aggregates ou dependência de Repository que nenhum Aggregate resolve sozinho — critério já usado para concluir que `Sales` não tem, até agora, nenhum Domain Service confirmado (`services/domains/sales/domain/services/README.md`).

## 14. Domain Events Emission Rules

**Ver ENS-0001 § 5** — disparado via `this.addDomainEvent(...)`, nunca publicado pelo próprio Aggregate; `reconstitute()` nunca dispara evento. Sem extensão necessária.

## 15. Forbidden Dependencies

**Ver ENS-0001** (implícito em toda a estrutura) + `ARCHITECTURE_GOVERNANCE.md § 2` ("Architecture First", "No Infrastructure Before Domain"): nenhum Aggregate de Business Domain depende de Application/Infrastructure/Contracts; nenhum depende de um domínio classificado como Product Layer (`ADR-0011`, `ADR-0018`) ou Platform/Transversal Capability (`ADR-0013`, `ADR-0014`) além de consumi-los como qualquer outro domínio consumiria uma capacidade de Kernel — nunca reimplementando-os.

## 16. Allowed Dependencies

`packages/shared-kernel/` (`AggregateRoot`, `Entity`, `ValueObject`, `Result`, `DomainEvent`); Value Objects e Entities do próprio Aggregate; referências por id a qualquer domínio (§§ 10-11).

## 17. Folder Conventions

**Ver ENS-0001 § 9** — `src/domain/aggregates/<nome-kebab-case>/`, testes espelhados em `tests/domain/aggregates/<nome>/`. Extensão de localização (não de convenção interna): Business Domains vivem em `services/domains/<domínio>/`, distinto de `services/kernel/<domínio>/` — já confirmado pela estrutura criada em `ENG-0037`.

## 18. Naming Conventions

**Ver ENS-0001 § 10** — sem extensão necessária.

## 19. Testing Expectations

**Ver ENS-0001 § 11** (item de checklist: "Testes cobrem criação válida, cada invariante violada, reconstituição, cada método de mutação, geração correta de cada Domain Event"). Extensão: quando um domínio tem múltiplos Aggregates relacionados (`Opportunity`/`Pipeline`), os testes de cada um permanecem isolados — nenhum teste de `Opportunity` depende de uma instância real de `Pipeline`, só de um id/dublê mínimo.

## 20. Completion Checklist

Reprodução do checklist de ENS-0001 § 11 (sem alteração), mais 2 itens de extensão:

- [ ] Estende `AggregateRoot<TProps>` do Shared Kernel
- [ ] Construtor `protected`/`private`, sem validação
- [ ] `static create()` retornando `Result<T, DomainError>`, nunca lança exceção
- [ ] `static reconstitute()` separado, sem validação e sem Domain Events
- [ ] Toda invariante verificada em `create()` **e** em cada método de mutação relevante
- [ ] `organizationId` presente no Props (quando o Aggregate representa dado de negócio)
- [ ] Nenhuma referência embutida a outro Aggregate — só `UniqueEntityId`
- [ ] Nenhuma referência cross-Organization
- [ ] Domain Events nomeados `<Aggregate><AçãoNoPassado>`, implementando `DomainEvent`
- [ ] `Auditable`/`Versionable` implementados quando aplicável
- [ ] Nenhum setter público
- [ ] Localização em `src/domain/aggregates/<nome>/`; testes espelhados
- [ ] Testes cobrem criação, invariantes, reconstituição, mutação, eventos
- [ ] **(extensão)** Nenhum objeto candidato a Entity é compartilhado entre múltiplas instâncias do Aggregate que o possui — se compartilhado, é Aggregate Root próprio (§ 4)
- [ ] **(extensão)** Nenhuma referência cross-domínio importa tipo concreto de outro Bounded Context — só id (§ 11)

## 21. Relationship with DOMAIN_MODEL.md

Todo Aggregate de um Business Domain implementa exatamente os "Objetos" já listados na seção correspondente de `DOMAIN_MODEL.md` — nunca um objeto novo sem citação. Para `Sales`: `Opportunity`, `Pipeline`, `Stage`, `Proposal`, `Quotation`, `Contract`, `Revenue` (`DOMAIN_MODEL.md § SALES DOMAIN`).

## 22. Relationship with SALES_TECHNICAL_BLUEPRINT.md

Este Standard não redefine nenhuma classificação já feita em [`SALES_TECHNICAL_BLUEPRINT.md § 3`](../blueprints/SALES_TECHNICAL_BLUEPRINT.md) (Aggregate Structure) — aplica as regras genéricas de implementação (ENS-0001 + extensões acima) à estrutura já definida lá. Qualquer Aggregate implementado para `Sales` deve satisfazer simultaneamente este Standard e o Blueprint.

## 23. Relationship with ARCHITECTURE_GOVERNANCE.md

Reafirma, sem alterar, os princípios já nomeados em [`ARCHITECTURE_GOVERNANCE.md § 2`](../governance/ARCHITECTURE_GOVERNANCE.md): "Architecture First", "Shared Kernel First", "No Infrastructure Before Domain", "No Hidden Decisions", "Evidence Before Freeze" — todos diretamente aplicáveis à implementação de qualquer Aggregate de Business Domain.

---

## Vigência

Este documento **não está congelado da mesma forma que ENS-0001** — é uma extensão viva, que pode ganhar novos itens à medida que novos Business Domains (além de `Sales`) revelarem padrões não antecipados aqui, sem exigir ADR para extensões puramente aditivas (mesmo critério já usado em `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16`: decidir algo pela primeira vez não exige ADR; contrariar algo já decidido, sim). Alterar ENS-0001 em si continua exigindo ADR, sem exceção.

## Relação com Outros Módulos

- [knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md](../../engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — padrão canônico, estendido, nunca substituído por este documento
- [knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../../engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (ENS-0003) — citado em § 13
- [knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md](../../engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) — processo que posiciona este Standard na Fase 2
- [knowledge/core/DOMAIN_MODEL.md § SALES DOMAIN](../../core/DOMAIN_MODEL.md) — fonte dos Objetos de `Sales`
- [../blueprints/SALES_TECHNICAL_BLUEPRINT.md](../blueprints/SALES_TECHNICAL_BLUEPRINT.md) — Blueprint que este Standard operacionaliza
- [../governance/ARCHITECTURE_GOVERNANCE.md](../governance/ARCHITECTURE_GOVERNANCE.md) — princípios gerais reafirmados
- [adr/ADR-0021-pipeline-nature.md](../../../adr/ADR-0021-pipeline-nature.md) — origem da regra de § 4 (Internal Entity vs. Aggregate Root próprio)
- [services/domains/sales/](../../../services/domains/sales/README.md) — primeiro consumidor deste Standard

## Status

🟡 Extensão criada (Missão ENG-0038). Nenhum código, classe, Entity, Aggregate, Repository, evento, interface, banco, schema ou teste criado. Colisão de nome com ENS-0001 registrada, não corrigida (fora de escopo desta missão renomear o arquivo).
