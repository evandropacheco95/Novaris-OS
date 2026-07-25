# Permission Domain — Discovery

Versão: 1.0.0

Status: 🟢 Oficial — investigação concluída, decisão registrada, nenhuma ação corretiva tomada

Missão: ENG-0004.1 (Permission Domain Discovery) — EPIC-004

Escopo: responder, com evidência rastreável e sem inventar nenhuma decisão de domínio, se `Permission` deve permanecer dentro do Identity Domain ou evoluir para um domínio próprio. Esta missão **conclui** uma decisão (exigida pela própria ordem, § 10) mas **não a executa** — nenhum código, ADR, Aggregate, Repository, Mapper, Event, ou correção a qualquer documento/código existente foi criado. A execução de uma eventual consequência desta decisão (ex.: redirecionar `services/kernel/permissions/README.md`) fica para uma missão futura, explicitamente autorizada para esse fim.

---

## 1. O que `Permission` representa conceitualmente?

Um rótulo para uma ação autorizável, no formato `<domínio>.<recurso>.<ação>` (`crm.leads.read`, `financial.invoice.delete` — [BOM.md § 4](../../../knowledge/core/BOM.md), [objects/Permission.md § 1, § 3](../../../knowledge/core/objects/Permission.md)). Conceitualmente, é vocabulário de autorização — não uma entidade de negócio com comportamento próprio, mas um identificador nomeado que outros objetos (`Role`) referenciam para expressar "o que é permitido".

## 2. `Permission` possui identidade própria?

**Não.** [`IDENTITY_TECHNICAL_BLUEPRINT.md § 3`](../identity/IDENTITY_TECHNICAL_BLUEPRINT.md) já decidiu isso explicitamente: "`Permission` é imutável, definida inteiramente pelo seu valor (`code`)... Múltiplos `Role`s podem referenciar a mesma `Permission` por valor, sem precisar de identidade compartilhada." Confirmado em código: `permission.ts` não tem `UniqueEntityId`, `extends ValueObject<PermissionProps>` (igualdade por deep equality, não por id) — duas instâncias com o mesmo `code` são, para todos os efeitos, a mesma `Permission`.

## 3. `Permission` possui ciclo de vida próprio?

**Não.** Nenhum estado, nenhuma transição, nenhum timestamp. `permission.ts` só tem `static create()` (validação de formato) e um getter (`code`) — imutável via `ValueObject` (`Object.freeze`, Shared Kernel ENG-0001.2). `objects/Permission.md §§ 6-7` ("Estados"/"Ciclo de Vida") estão marcados `TODO` desde `ARCH-001` — nunca preenchidos, porque nenhuma fonte jamais propôs um ciclo de vida para o conceito.

## 4. `Permission` pode existir sem Identity?

**Duas respostas, para não confundir duas perguntas diferentes**:

- **Como está implementada hoje**: não. `Permission` só existe como valor dentro de `Role.permissions: Permission[]` (Identity Domain) — não é persistida, consultada ou referenciada independentemente em nenhum lugar do código ou da documentação oficial.
- **Como conceito abstrato**: sim, em tese — um "vocabulário de códigos de permissão válidos" poderia, em princípio, existir independentemente de qualquer domínio que o consuma (mesmo padrão de um enum de países ou moedas). Mas nenhuma fonte oficial (`Permission.md`, `BOM.md`, `DOMAIN_MODEL.md`) jamais descreveu esse catálogo como algo que precisa de existência própria — é uma possibilidade não confirmada, não um fato já modelado.

## 5. `Permission` deve possuir Aggregate próprio?

**Não, com base na evidência disponível hoje.** Critério já usado e citável (`ENGINEERING_PLAYBOOK.md § 3`: "Aggregates: fronteira de consistência transacional"; `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 1`, usado aqui só para comparação estrutural, conforme pedido pela ordem): um Aggregate exige identidade própria (§ 2: não tem), ciclo de vida próprio (§ 3: não tem), e uma razão para ser referenciado por id por outro Aggregate (nenhuma fonte referencia `Permission` por id — `Role` a contém por valor, não por `permissionId`). `Organization` se qualificou como Aggregate porque tinha as três características (id próprio, `status` com ciclo de vida, referenciada por `organizationId` em toda a plataforma, RN001) — `Permission` não tem nenhuma delas hoje.

## 6. `Permission` deve possuir Repository próprio?

**Não — e esta não é só uma escolha de estilo, é uma restrição estrutural do próprio sistema de tipos.** `Repository<T>`/`ReadRepository<T>`/`WriteRepository<T>` do Shared Kernel são genéricos com a restrição `T extends AggregateRoot<unknown>` (`packages/shared-kernel/src/core/repositories/*.ts`). `Permission extends ValueObject<PermissionProps>`, não `AggregateRoot` — um `Repository<Permission>` sequer compilaria sob a arquitetura atual sem antes tornar `Permission` um Aggregate (o que a § 5 já concluiu não ter base). `IDENTITY_TECHNICAL_BLUEPRINT.md § 3` já registrou a consequência: "`Permission` não tem `Repository` próprio — é persistida como parte do Aggregate `Role`."

## 7. `Permission` deve possuir Domain Events próprios?

**Não, sob a arquitetura atual — e os únicos eventos já existentes confirmam isso.** `PermissionGrantedToRole`/`PermissionRevokedFromRole` (Identity, ENG-0002.7/.8) já existem — mas pertencem a `Role`, não a `Permission`: são disparados por `Role.grantPermission()`/`revokePermission()`, porque `AGGREGATE_IMPLEMENTATION_STANDARD.md § 5` (ENS-0001) restringe emissão de Domain Event a Aggregates, e `Permission` não é um. Um evento pertencente à própria `Permission` (ex.: `PermissionRegistered`) só faria sentido se a § 5 concluísse diferente — o que a evidência atual não sustenta.

## 8. Classificação: Value Object, Aggregate, Supporting Domain, Shared Kernel, Bounded Context, ou Outro?

# Value Object

**Justificativa técnica** — os 4 critérios clássicos de DDD (Evans) para Value Object vs. Entity, todos confirmados pela evidência acima:
1. Definido por seus atributos, não por identidade — `code` é o único atributo, sem id (§ 2).
2. Imutável — `Object.freeze` via `ValueObject<T>` do Shared Kernel.
3. Intercambiável quando igual — duas `Permission`s com o mesmo `code` são equivalentes em qualquer contexto (§ 2).
4. Sem ciclo de vida próprio (§ 3).

**Por que não as outras opções**:
- **Aggregate**: descartado em § 5 — nenhuma identidade, ciclo de vida ou referência por id.
- **Shared Kernel**: descartado — `packages/shared-kernel/` contém abstrações técnicas genéricas e cross-domain (`Result`, `AggregateRoot`, `Entity`), nunca vocabulário específico de um domínio de negócio. `Permission` é vocabulário de autorização, pertence dentro de um domínio (Identity), não na camada técnica compartilhada.
- **Bounded Context**: descartado por definição — um Bounded Context é uma fronteira de modelagem que pode conter múltiplos Aggregates/VOs com sua própria Ubiquitous Language; nenhuma fonte descreve uma Ubiquitous Language de "Permission" distinta da já usada dentro de Identity (`IDENTITY_DOMAIN_MODEL.md`).
- **Supporting Domain**: a única opção que exigiria evidência adicional além do que existe — ver § 9 e § 10 sobre por que a evidência atual não sustenta essa classificação para o conceito `Permission` como definido hoje.

## 9. Existe duplicação entre Identity e `kernel/permissions`?

**Não há duplicação de código ou de decisão arquitetural — há duplicação de intenção de escopo, nunca resolvida.** `services/kernel/permissions/` não tem nenhuma implementação (`README.md`: "🚧 Estrutura criada... Nenhuma implementação de código ainda"); não existe nenhum `Permission` diferente ali para comparar com o de Identity. A duplicação real é esta: a lista original de 20 módulos (`ADR-0003`/`ADR-0004`, "Fase B — Identidade": `identity`, `organizations`, `users`, `roles`, `permissions`, cinco pastas distintas) presumia que `Permission` seria um módulo de Kernel independente — mas a modelagem posterior e mais rigorosa (`IDENTITY_DOMAIN_MODEL.md` → `IDENTITY_TECHNICAL_BLUEPRINT.md`, ENG-0002.1/.2) reclassificou `Permission` como Value Object interno a Identity, sem que ninguém formalmente revogasse ou redirecionasse a existência do módulo `permissions/`. É o mesmo padrão de duplicação já resolvido para `NES`/`NEF` (`ADR-0009`) e para as 5 áreas de `ADR-0008` — dois lugares no repositório reivindicando (um por scaffolding original, outro por implementação real) autoridade sobre o mesmo conceito, sem que um tenha formalmente cedido ao outro ainda.

`users/` e `roles/` sofreram exatamente a mesma sobreposição (também absorvidos por `identity/` durante EPIC-002) e permanecem, até hoje, no mesmo estado de scaffolding vazio não resolvido — este não é um problema isolado de `permissions/`.

## 10. Decisão Final

# PERMISSION REMAINS INSIDE IDENTITY

**Justificativa técnica**: as perguntas 2 a 7 convergem, de forma consistente e sem exceção, para a mesma conclusão — `Permission` não tem identidade, não tem ciclo de vida, não justifica Aggregate, estruturalmente não pode ter Repository próprio sob o sistema de tipos já implementado, e os únicos Domain Events relacionados já pertencem corretamente a `Role`. Esta não é uma decisão nova: é a mesma conclusão a que `IDENTITY_TECHNICAL_BLUEPRINT.md § 3` já havia chegado em `ENG-0002.2`, agora verificada de forma independente, a partir de critérios de DDD e de uma comparação estrutural direta com `Organization` (que se qualificou como Aggregate exatamente pelos critérios que `Permission` não atende).

Descartada **`INSUFFICIENT INFORMATION`**: a evidência não é escassa — é convergente e já implementada em código real, testado e congelado (`IDENTITY_DOMAIN_CLOSURE.md`). Escolher "informação insuficiente" aqui ignoraria evidência concreta já disponível.

Descartada **`PERMISSION BECOMES A NEW DOMAIN`**: nenhuma fonte oficial (`Permission.md`, 85% `TODO`; `BOM.md`; `DOMAIN_MODEL.md`) descreve um problema de negócio que exija um Aggregate/domínio próprio para `Permission` como definida hoje. A única lacuna real e documentada (`Permission.md § 10`, resolução de conflito entre permissão negada e herdada) é genuína, mas **não tem nenhuma definição** em nenhuma fonte — não pode, por si só, justificar um domínio novo sem inventar o problema que esse domínio resolveria. Essa lacuna permanece registrada (era já candidata em `PERMISSION_EPIC_PLANNING.md §§ 1, 4`) como possível iniciativa **futura e distinta**, não como parte deste Epic.

## Comparação Estrutural com Organization (só para validação do método, não decisão nova)

| Critério | Organization | Permission |
|---|---|---|
| Identidade própria (`UniqueEntityId`) | Sim | Não |
| Ciclo de vida (`status`, mesmo incompleto) | Sim | Não |
| Referenciada por id por outros Aggregates | Sim (RN001, `organizationId` em toda a plataforma) | Não (`Role` a contém por valor) |
| Confirmada como Aggregate por processo formal (Discovery→Freeze) | Sim (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`) | Já decidida como VO por processo formal equivalente (`IDENTITY_TECHNICAL_BLUEPRINT.md § 3`) |

A mesma disciplina de investigação que confirmou `Organization` como Aggregate confirma `Permission` como Value Object — nenhum critério tratado de forma diferente entre os dois domínios.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Revisão de rastreabilidade**: toda resposta (§§ 1-9) cita código real ou documento oficial específico.
- **Comparação entre código e documentação**: `permission.ts` conferido linha a linha contra `IDENTITY_TECHNICAL_BLUEPRINT.md § 3` — nenhuma divergência encontrada; código e documento dizem exatamente a mesma coisa.

## DMV

1. Alguma Entity foi criada? Não.
2. Algum Aggregate foi alterado? Não.
3. Algum Value Object foi criado? Não — `Permission` já existe, apenas analisada.
4. Alguma regra nova foi criada? Não.
5. Alguma decisão do Freeze/Closure de Identity foi modificada? Não — a decisão de `IDENTITY_TECHNICAL_BLUEPRINT.md § 3` foi confirmada, não alterada.
6. Há necessidade de ADR? Não para esta missão — nenhuma decisão já congelada foi mudada, apenas reafirmada com evidência independente. Uma eventual missão futura que decida redirecionar `services/kernel/permissions/` não precisa de ADR pelo mesmo critério já usado para `NES/README.md`/`playbooks/` (`ADR-0008`/`ADR-0009`: redirecionamento de scaffolding vazio para conteúdo real já existente, sem mudar decisão de arquitetura).

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum código/Aggregate/Repository/Event/ADR criado | ✅ |
| Nenhum documento existente alterado | ✅ |
| Decisão fundamentada em evidência, não em preferência | ✅ — todas as 10 respostas citam fonte |
| Comparação estrutural com Organization sem inventar critério novo | ✅ — mesmos 3 critérios (identidade/ciclo de vida/referência por id) usados em ambas as análises |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (Discovery de Organization, como comparação) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido respeitado (nenhuma correção, nenhum ADR, nenhuma alteração) | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **A conclusão foi alcançada por evidência ou por conveniência (evitar trabalho)?** Por evidência — cada uma das perguntas 2-7 tem uma razão técnica específica e citável, incluindo uma restrição estrutural do sistema de tipos (§ 6) que não é apenas estilística.
2. **A lacuna real de `Permission.md § 10` foi descartada sem reconhecimento, ou tratada com o devido peso?** Reconhecida explicitamente em § 10 como "genuína", mas corretamente separada de "justifica um domínio agora" — sem informação suficiente sobre ela seria inventar, não descobrir.
3. **A missão resolveu o problema (proibido) ou apenas o diagnosticou?** Apenas diagnosticou — nenhum arquivo além do autorizado foi tocado; a decisão § 10 é uma conclusão de análise, não uma ação corretiva (redirecionar `permissions/README.md`, fechar o Epic, etc. permanecem para uma missão futura autorizada).
4. **A comparação com Organization foi genuína ou forçada para caber na conclusão desejada?** Genuína — os mesmos 3 critérios estruturais (identidade, ciclo de vida, referência por id) foram aplicados a ambos sem ajuste; `Organization` passa nos 3, `Permission` em nenhum.

## Relatório Final

**Arquivos criados**: `services/kernel/permissions/PERMISSION_DOMAIN_DISCOVERY.md`.

**Arquivos alterados**: nenhum.

**Fontes consultadas**: `PERMISSION_EPIC_PLANNING.md`, `IDENTITY_TECHNICAL_BLUEPRINT.md`, `IDENTITY_DOMAIN_CLOSURE.md`, `permission.ts`, `objects/Permission.md`, `BOM.md`, `KERNEL_DOMAIN_LIFECYCLE_V2.md`, `PROJECT_RULES.md`, `ADR-0003`/`ADR-0004`/`ADR-0006` (ADRs de Kernel), `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md` (comparação estrutural), `ENGINEERING_PLAYBOOK.md § 3`, `AGGREGATE_IMPLEMENTATION_STANDARD.md § 5`, `packages/shared-kernel/src/core/repositories/*.ts` (verificação da restrição de tipo `T extends AggregateRoot<unknown>`).

**Validações**: Link Checker (ver abaixo), revisão de rastreabilidade, comparação código↔documentação — nenhuma divergência.

**Conclusão**: **PERMISSION REMAINS INSIDE IDENTITY**. Evidência suficiente para o CTO decidir o encerramento do EPIC-004 por sobreposição arquitetural (caminho "encerramento antecipado" já previsto em `PERMISSION_EPIC_PLANNING.md § 9`), ou para autorizar uma missão futura específica de redirecionamento de `services/kernel/permissions/`. Nenhuma das duas ações foi executada aqui.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
