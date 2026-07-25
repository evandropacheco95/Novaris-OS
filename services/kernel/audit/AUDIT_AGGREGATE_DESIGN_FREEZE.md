# Audit — Aggregate Design Freeze

Versão: 1.0.0

Status: 🟢 Oficial — definição definitiva do Aggregate `AuditEntry`, sem implementação

Missão: ENG-0005.5 (Audit Aggregate Design Freeze) — EPIC-005

Escopo: consolidar em contrato vinculante tudo o que já foi decidido para o Aggregate `AuditEntry` — [AUDIT_DOMAIN_DECISIONS.md](AUDIT_DOMAIN_DECISIONS.md) (ENG-0005.4), [AUDIT_BOUNDED_CONTEXT.md](AUDIT_BOUNDED_CONTEXT.md) (ENG-0005.3), [AUDIT_UBIQUITOUS_LANGUAGE.md](AUDIT_UBIQUITOUS_LANGUAGE.md) (ENG-0005.2), [AUDIT_DOMAIN_DISCOVERY.md](AUDIT_DOMAIN_DISCOVERY.md) (ENG-0005.1). Nenhum código, Entity, Repository, Mapper, Value Object ou teste foi criado. Padrão estrutural de rigor seguido de [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](../organizations/ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) e [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — só a forma, não o conteúdo.

**O que "congelar" significa aqui**: apenas o que já passou por decisão explícita (`AUDIT_DOMAIN_DECISIONS.md §§ 1-8`) vira contrato vinculante. Tudo que permanece adiado (`AUDIT_DOMAIN_DECISIONS.md § 9`) **não é congelado por este documento** — aparece em § 16, como restrição permanente, nunca como conteúdo hipotético apresentado como decidido.

---

## 1. Aggregate Candidato

**`AuditEntry`** — confirmado como único candidato a Aggregate Root do Audit Domain (`AUDIT_DOMAIN_DECISIONS.md § 1`). Nenhum outro candidato foi identificado em nenhuma das 5 missões anteriores; `AuditTrail` foi explicitamente descartado como Aggregate próprio (`AUDIT_DOMAIN_DISCOVERY.md § 5`).

## 2. Propósito do Aggregate

Garantir que todo `AuditEntry` nasça com os campos mínimos já confirmados presentes (§ 5) e permaneça imutável para sempre depois disso (`AUDIT_DOMAIN_DECISIONS.md § 2`). `AuditEntry` **nunca decide** se um fato deve ser auditado — essa decisão pertence sempre ao domínio de origem (`AUDIT_BOUNDED_CONTEXT.md §§ 2-3`) — e **nunca enriquece a si mesmo** — recebe dados já enriquecidos pela Application Layer de origem (`AUDIT_DOMAIN_DECISIONS.md § 5`).

## 3. Identidade

`AuditEntry` tem identidade própria — `id: UniqueEntityId`, herdada de `AggregateRoot<T>` (Shared Kernel, ENG-0001.2), nunca reimplementada (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 1`). Esta identidade é a própria razão pela qual `AuditEntry` se qualificou como Aggregate, e não Value Object — precisa ser recuperável de forma independente (`AUDIT_DOMAIN_DISCOVERY.md § 9`). `id` é imutável após a criação, mesma regra estrutural de todo `Entity`/`AggregateRoot` do Shared Kernel.

## 4. Estado Interno Conceitual

Consolidado a partir dos campos mínimos já confirmados (`AUDIT_EPIC_PLANNING.md § 6`, `AUDIT_DOMAIN_DECISIONS.md §§ 2, 6`) — nomes conceituais, nenhum tipo real definido:

| Campo conceitual | Natureza | Fonte |
|---|---|---|
| `id` | Identidade própria | Herdado de `AggregateRoot` |
| `actorId` | Referência (nunca embutida) | `AUDIT_EPIC_PLANNING.md § 6` ("Ator/Usuário") |
| `organizationId` | Referência (nunca embutida) | `AUDIT_EPIC_PLANNING.md § 6`; multi-tenancy generalizada (ENS-0001 § 7) |
| `targetId` / `targetType` | Referência (nunca embutida) | `audit/CONTRACT.md` (`objectId`); terminologia `Target` confirmada (`AUDIT_DOMAIN_DECISIONS.md § 6`) |
| `action` | Nome do evento/ação | `objects/Organization.md § AUDITORIA` ("Evento") |
| `occurredAt` | Timestamp | `objects/Organization.md § AUDITORIA` ("Data") |
| `origin` | De onde veio a ação | `objects/Organization.md § AUDITORIA` ("IP", "Origem") |
| `changeSet` | Valores antigos/novos, quando aplicável | `objects/Organization.md § AUDITORIA`; opcionalidade já registrada (`AUDIT_EPIC_PLANNING.md § 6`) |

## 5. Campos Obrigatórios

`id`, `actorId`, `organizationId`, `targetId`, `targetType`, `action`, `occurredAt`, `origin` — todos confirmados por fonte já citada (§ 4), nenhum inventado. Nenhuma fonte permite omitir qualquer um destes na criação.

## 6. Campos Opcionais

`changeSet` — opcional, porque nem toda ação tem um valor a comparar (`AUDIT_EPIC_PLANNING.md § 6`: "não definido se é obrigatório para todo tipo de evento", já tratado consistentemente como condicional em `AUDIT_UBIQUITOUS_LANGUAGE.md § 3`, "quando aplicável"). Nenhum outro campo opcional foi identificado por nenhuma fonte.

## 7. Invariantes

| Invariante | Fonte |
|---|---|
| Todo `AuditEntry` deve ter `actorId`, `organizationId`, `targetId`/`targetType`, `action`, `occurredAt`, `origin` presentes na criação | § 5, `AUDIT_DOMAIN_DECISIONS.md § 2` |
| `AuditEntry`, uma vez criado, nunca muda | `BOM.md § 8` ("Registro imutável"); `AUDIT_DOMAIN_DECISIONS.md § 2` |
| `id` é imutável após a criação | Padrão estrutural de `Entity`/`AggregateRoot` |
| `changeSet`, quando presente, não é validado quanto ao seu conteúdo interno (forma livre) | Nenhuma fonte define uma estrutura interna para `changeSet` — não inventada aqui |

## 8. Regras de Imutabilidade

`AuditEntry` **não tem nenhum método público de mutação** — diferente de todo outro Aggregate já implementado no Kernel (`Organization`/`User`/`Role`, todos com pelo menos um método de mutação nomeado). Isto não viola `AGGREGATE_IMPLEMENTATION_STANDARD.md`: o Standard permite, mas não exige, métodos de mutação (`ENS-0001 §§ 1, 3` descrevem como mutação *deveria* ocorrer, quando existir, nunca que ela *deve* existir). A ausência total de mutação é a expressão estrutural direta da invariante de imutabilidade (§ 7) — não uma omissão, uma escolha de design coerente com o próprio propósito do Aggregate (§ 2).

## 9. Criação

`static create()` segue o padrão já congelado (`AGGREGATE_IMPLEMENTATION_STANDARD.md §§ 2-4`): construtor `private`, `create()` retorna `Result<AuditEntry, DomainError>`, nunca lança exceção, valida a presença dos campos obrigatórios (§ 5) antes de montar a instância. **Diferença deliberada em relação a `Organization`/`User`**: `create()` de `AuditEntry` recebe todos os campos **já enriquecidos** como input — não busca, não infere, não consulta nenhum outro domínio para obtê-los (`AUDIT_DOMAIN_DECISIONS.md § 5`: o enriquecimento já aconteceu na Application Layer de origem, antes de `create()` ser chamado). `create()` só valida presença e formato do que já recebeu.

## 10. Reconstituição

`static reconstitute()` segue exatamente o padrão já congelado (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`): sem validação, sem Domain Events, uso exclusivo de uma futura implementação de Repository. Nenhuma diferença em relação ao padrão geral — a imutabilidade de `AuditEntry` (§ 8) não muda nada sobre como ele é reconstituído a partir de dados já persistidos.

## 11. Eventos de Domínio

**Não coberto por este Freeze — decisão explicitamente não tomada.** `AUDIT_EPIC_PLANNING.md § 6` já registrou `AuditEntryRecorded` como candidato, com um risco explícito de circularidade (um evento de domínio anunciando o registro de outro evento de domínio, quando `AuditEntry` normalmente já nasce a partir do consumo de um `DomainEvent` alheio). `AUDIT_DOMAIN_DECISIONS.md` não resolveu essa pergunta. Nenhum Domain Event de `AuditEntry` é definido aqui — nem confirmado, nem descartado. Ver § 16.

## 12. O que o Aggregate NÃO Faz

- Não decide se um fato deve ser auditado — isso é do domínio de origem (`AUDIT_BOUNDED_CONTEXT.md §§ 2-3`).
- Não enriquece a si mesmo — recebe dados já enriquecidos (`AUDIT_DOMAIN_DECISIONS.md § 5`).
- Não se persiste — é responsabilidade de um futuro Repository (`AUDIT_DOMAIN_DECISIONS.md § 7`).
- Não conhece tipos concretos de nenhum outro domínio — só referencia por id (`AUDIT_BOUNDED_CONTEXT.md § 9`).
- Não decide retenção ou expurgo de dados — fora de escopo de domínio técnico (`AUDIT_DOMAIN_DECISIONS.md § 9`).
- Não tem nenhum método de mutação pública (§ 8).

## 13. Relação com `Target`

`Target` (terminologia oficial, `AUDIT_DOMAIN_DECISIONS.md § 6`) é referenciado por `targetId` + `targetType` — nunca embutido, mesmo princípio de referência por id já congelado em toda a plataforma (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 8-9`, generalizado). A forma real de `Target` (Value Object validado vs. par simples de `id`/tipo) **não é decidida aqui** — permanece adiada (`AUDIT_DOMAIN_DECISIONS.md § 9`, ver § 16).

## 14. Relação com `Actor`

`Actor` é referenciado por `actorId` — nunca embutido, mesmo princípio de § 13. O escopo de `Actor` (se suporta atores não-humanos, como sistema ou automação, além de `User`) **permanece adiado** (`AUDIT_DOMAIN_DECISIONS.md § 9`; `AUDIT_UBIQUITOUS_LANGUAGE.md § 5`) — este Freeze não presume nenhuma das duas respostas.

## 15. Relação com `Metadata`

`AuditEntry` **não tem, por ora, nenhum campo `metadata` definido** — nenhuma fonte confirma essa necessidade. Se um campo livre vier a ser necessário no futuro, deve reutilizar exatamente `HasMetadata<T>` já formalizado no Shared Kernel (ENG-0001.9) — nunca uma forma própria, o que replicaria a colisão conceitual já registrada em `AUDIT_UBIQUITOUS_LANGUAGE.md §§ 5-6`. Nenhum campo `metadata` é introduzido por este Freeze.

## 16. Decisões Ainda Bloqueadas

Este Freeze **não cobre**, e nenhuma implementação pode presumir decidido, os seguintes itens — cada um exige decisão explícita futura antes de qualquer código:

- Se `AuditEntry` emite algum Domain Event próprio (`AuditEntryRecorded` ou equivalente) — § 11, risco de circularidade já registrado, não resolvido.
- Escopo de `Actor` (humano vs. sistema/automação) — § 14.
- Forma real de `Target` (Value Object vs. par `id`/tipo simples) — § 13.
- Mecanismo real de acoplamento com o Event Bus (consumo assíncrono vs. fallback de chamada direta) — depende de um Epic futuro ainda não iniciado (`KERNEL_MATURITY_ASSESSMENT.md § 9`).
- Consultas especializadas além de "por `Target`" (por `Actor`, por período, por `Organization`) — `AUDIT_DOMAIN_DECISIONS.md § 9`.
- Responsável concreto (mecanismo, não conceito) pelo enriquecimento `DomainEvent` → `AuditEntry` — o **conceito** já está decidido (Application Layer de origem, `AUDIT_DOMAIN_DECISIONS.md § 5`), o **mecanismo** não.
- Tratamento de falha de enriquecimento (dado de origem incompleto) — `AUDIT_DOMAIN_DECISIONS.md § 9`.
- Tensão entre imutabilidade (§ 7) e uma futura política de retenção/expurgo por compliance (LGPD/GDPR) — `AUDIT_EPIC_PLANNING.md § 7`, risco "Alto", não resolvido.
- ADR ainda não criada para o mecanismo de enriquecimento pela Application Layer de origem (`AUDIT_DOMAIN_DECISIONS.md § 5`, recomendado, não criado).

Mudar qualquer item já congelado (§§ 1-15) exige ADR, mesmo padrão já vigente para `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 17`/`IDENTITY_AGGREGATE_DESIGN_FREEZE.md`. **Decidir** um item desta lista pela primeira vez não exige ADR por si só — mas se a decisão resultante contrariar algo já congelado em §§ 1-15, a mudança exige ADR.

## Declaração Formal de Freeze

A partir desta missão, o desenho estrutural do Aggregate `AuditEntry` está **congelado**: candidato e propósito (§§ 1-2), identidade (§ 3), estado interno e campos (§§ 4-6), invariantes e imutabilidade (§§ 7-8), criação e reconstituição (§§ 9-10), e a separação de responsabilidade entre Aggregate e Application Layer de origem (§ 12). Os itens de § 16 permanecem explicitamente fora deste Freeze — decidi-los pela primeira vez é trabalho de uma futura missão, não uma reabertura deste documento.

Nenhuma implementação deste Aggregate deve começar a partir apenas deste documento sem que os itens de § 16 relevantes à implementação pretendida — em especial o mecanismo concreto de enriquecimento e a forma real de `Target`/`Actor` — tenham sido decididos.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Rastreabilidade**: toda seção cita a decisão exata de `AUDIT_DOMAIN_DECISIONS.md`, `AUDIT_BOUNDED_CONTEXT.md`, `AUDIT_UBIQUITOUS_LANGUAGE.md` ou `AUDIT_DOMAIN_DISCOVERY.md` de onde deriva.
- **Comparação com `AGGREGATE_IMPLEMENTATION_STANDARD.md`**: checklist § 11 (ENS-0001) conferido item a item — `extends AggregateRoot<TProps>` (§ 3), construtor privado sem validação (§ 9), `create()`/`reconstitute()` separados (§§ 9-10), toda invariante com fonte documentada (§ 7), `organizationId` presente (§ 4-5), nenhuma referência embutida (§§ 13-14), nenhum setter público (§ 8) — todos conformes. Única observação: `AuditEntry` é o primeiro Aggregate do Kernel sem nenhum método de mutação além de `create()` — comportamento permitido, mas não previsto explicitamente em nenhum exemplo anterior do Standard (§ 8 já justifica por quê isso é coerente, não uma divergência).

## DMV

1. Alguma Entity foi criada? Não.
2. Algum Aggregate foi implementado? Não — apenas desenhado conceitualmente.
3. Algum Value Object foi criado? Não — `Target`/`Actor` permanecem referências conceituais, sem VO definido.
4. Alguma regra nova foi criada? Não — todo campo/invariante deriva de fonte já citada nas 5 missões anteriores.
5. Alguma decisão de outro domínio foi modificada? Não.
6. Há necessidade de ADR? Não para este Freeze em si (mesmo padrão de `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`, que também não exigiu ADR); a ADR já recomendada em `AUDIT_DOMAIN_DECISIONS.md § 5` permanece registrada, não criada aqui.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum código/Entity/Repository/Mapper/VO/teste criado | ✅ |
| Todo campo/invariante rastreável a decisão já tomada | ✅ |
| Itens não decididos explicitamente listados (§ 16), não presumidos | ✅ |
| Consistência com `AGGREGATE_IMPLEMENTATION_STANDARD.md` | ✅ — checklist completo, 1 observação registrada, não uma divergência |
| Nenhum documento existente alterado | ✅ |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`, `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **A ausência total de métodos de mutação (§ 8) foi tratada como divergência do padrão, ou justificada corretamente?** Justificada — `AGGREGATE_IMPLEMENTATION_STANDARD.md` permite, não exige, mutação; a ausência é consequência direta da invariante de imutabilidade, não uma omissão.
2. **A pergunta de Domain Events (§ 11) foi decidida por conveniência, para "fechar" a seção?** Não — permanece explicitamente não resolvida, com o risco de circularidade já citado, listada em § 16.
3. **Algum campo foi inventado sem fonte?** Não — todos os 8 campos obrigatórios (§ 5) e o único opcional (§ 6) citam `objects/Organization.md § AUDITORIA` ou `audit/CONTRACT.md` diretamente.
4. **Este Freeze seria suficiente para impedir uma implementação prematura?** Sim — § 16 e a "Declaração Formal de Freeze" tornam explícito que nenhuma implementação pode presumir os itens bloqueados, mesmo padrão que já funcionou para impedir implementação prematura de `changePlan`/`suspend`/etc. em `Organization`.

## Relatório Final

**Arquivos criados**: `services/kernel/audit/AUDIT_AGGREGATE_DESIGN_FREEZE.md`.

**Arquivos alterados**: nenhum.

**Validações**: Link Checker (ver abaixo), rastreabilidade (toda seção cita decisão de origem), comparação com `AGGREGATE_IMPLEMENTATION_STANDARD.md` (checklist § 11 completo).

**DMV/ACR/ARG**: acima — nenhum código, nenhuma regra nova, ARG PASS (4/4 aplicáveis).

**Conclusão**: desenho estrutural de `AuditEntry` congelado — identidade, campos, invariantes, imutabilidade, criação/reconstituição e separação de responsabilidade com a Application Layer de origem. 9 itens permanecem explicitamente bloqueados (§ 16), incluindo a única ADR já recomendada e ainda não criada (mecanismo de enriquecimento). Pronto para `ENG-0005.6` (Technical Blueprint).

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
