# Audit Domain — Ubiquitous Language

Versão: 1.0.0

Status: 🟡 Oficial — vocabulário congelado como referência; 2 ambiguidades explícitas deferidas a Domain Decisions (§ 8)

Missão: ENG-0005.2 (Audit Ubiquitous Language) — EPIC-005

Escopo: construir o glossário oficial do Audit Domain, eliminando ambiguidade terminológica antes de `ENG-0005.4` (Domain Decisions). Nenhum Aggregate, Entity, Repository, Mapper, Event, Domain Service, Value Object, ADR, tecnologia ou infraestrutura foi criado. Nenhuma decisão de domínio pendente (`AUDIT_DOMAIN_DISCOVERY.md §§ 7, 9`) foi resolvida. Nenhum documento existente foi alterado.

---

## 1. Objetivo da Linguagem Ubíqua

Eliminar, antes de qualquer modelagem real, a possibilidade de dois documentos futuros do EPIC-005 usarem o mesmo termo com significados diferentes, ou termos diferentes para o mesmo conceito — o mesmo problema que `AUDIT_DOMAIN_DISCOVERY.md § 5` começou a consolidar, agora tratado com rigor de glossário, termo a termo, com proveniência explícita para cada um.

## 2. Princípios Terminológicos

- **Todo termo declara sua proveniência** — `Citada` (já usada em fonte anterior e independente deste Epic: `CONSTITUTION.md`, `objects/Organization.md`, `audit/CONTRACT.md`, Shared Kernel), `Proposta` (introduzida por `AUDIT_EPIC_PLANNING.md`/`AUDIT_DOMAIN_DISCOVERY.md`, generalizando um termo já citado, mas sem fonte anterior a este Epic), ou `Não definida` (nenhuma fonte, nem anterior nem desta cadeia).
- **Termos do Shared Kernel nunca são redefinidos localmente** — `DomainEvent`, `Aggregate`, `Metadata` (via `HasMetadata<T>`) são usados exatamente como já definidos em `packages/shared-kernel/`, ou não são usados.
- **Termos que já pertencem a outro domínio são referenciados, nunca redefinidos** — `Organization` (Organization Domain), `Session` (Identity, ainda fora de escopo).
- **Um termo `Proposto` promovido a oficial por este glossário continua marcado como `Proposto`** — proveniência não muda retroativamente.
- **Ambiguidade real não é resolvida por conveniência** — quando dois termos foram usados de forma intercambiável sem fonte que escolha um, isso é registrado em § 5, não decidido aqui.

## 3. Glossário Oficial

| Termo | Proveniência | Definição / Significado no Domínio | Quando Usar | Quando NÃO Usar |
|---|---|---|---|---|
| **Audit** | Citada — `CONSTITUTION.md` Artigos 10, 12, 18 ("Auditoria"); `BOM.md § 8` ("Audit Log") | O domínio transversal responsável por registrar, de forma imutável, fatos já ocorridos na plataforma | Para referenciar o domínio/Bounded Context como um todo | Como sinônimo de logging técnico (`services/kernel/logging/`, módulo distinto) |
| **AuditEntry** | Citada — `audit/CONTRACT.md § Interface Pública` (`logEvent(entry: AuditEntry)`) | O registro individual e imutável de um fato já ocorrido | Para referenciar um único registro | Como sinônimo de `AuditTrail` (uma sequência, não um registro) |
| **AuditTrail** | Citada (parcial) — `audit/CONTRACT.md` usa o termo só como nome de método (`getAuditTrail`); o substantivo como conceito de consulta é Proposta, `AUDIT_DOMAIN_DISCOVERY.md § 5` | A sequência de `AuditEntry` relativa a um Subject/Target — conceito de consulta, não confirmado como objeto persistido próprio | Para referenciar o resultado de uma consulta por objeto afetado | Como se já fosse um Aggregate confirmado — não foi (`AUDIT_DOMAIN_DISCOVERY.md § 9` só confirma `AuditEntry` como candidato) |
| **DomainEvent** | Citada — Shared Kernel (`packages/shared-kernel/src/core/domain-events/domain-event.ts`, ENG-0001.5): `eventId`, `aggregateId`, `occurredAt`, `eventName` | O contrato genérico de evento de domínio, já implementado, consumido por todo Aggregate do Kernel | Para referenciar o evento bruto transportado pelo Event Bus | Como sinônimo de `AuditEntry` — `AUDIT_DOMAIN_DISCOVERY.md § 7` já confirmou que não são equivalentes; falta uma etapa de enriquecimento entre os dois |
| **Actor** | Proposta — `AUDIT_DOMAIN_DISCOVERY.md § 5`, generalizando "usuário" (`objects/Organization.md § AUDITORIA`) | Quem realizou a ação — referenciado por id, nunca embutido | Para referenciar a origem humana ou de sistema de uma ação | Sem confirmar se atores não-humanos (sistema, automação) são suportados — não decidido, ver § 5 |
| **Subject** | Proposta — `AUDIT_DOMAIN_DISCOVERY.md § 5` (generaliza `objectId` de `audit/CONTRACT.md`) | O objeto afetado pela ação — id + tipo/domínio de origem | Candidato a termo oficial para "o quê foi afetado" | Ver ambiguidade com `Target`, § 5 — **não usar até Domain Decisions escolher um dos dois** |
| **Target** | Proposta — usada como sinônimo de `Subject` no próprio `AUDIT_DOMAIN_DISCOVERY.md § 5`, sem disambiguação | Mesmo significado atribuído a `Subject` nesta cadeia | Idem `Subject` | Idem `Subject` — ambos não devem ser usados de forma intercambiável (§ 5, § 6) |
| **Resource** | Não definida | Nenhuma fonte (anterior ou desta cadeia) usa este termo para o Audit Domain | — | Não usar — nenhum significado atribuído |
| **Aggregate** | Citada — termo arquitetural genérico do Shared Kernel/DDD (`AGGREGATE_IMPLEMENTATION_STANDARD.md`, ENS-0001), não específico de Audit | Um Aggregate Root, conforme já definido pelo Standard; sua aplicação a `AuditEntry` é candidata, não confirmada | Para referenciar o padrão arquitetural em geral | Como se `AuditEntry` já fosse um Aggregate confirmado |
| **Snapshot** | Não definida | Nenhuma fonte introduz este conceito para Audit | — | Não usar — implicaria uma estratégia de Event Sourcing nunca decidida |
| **Change** | Não definida (isolado) | `objects/Organization.md § AUDITORIA` usa "Valores antigos"/"Valores novos", nunca a palavra "Change" isolada | — | Preferir os termos já citados ("valores antigos/novos") ou `ChangeSet` (abaixo) |
| **ChangeSet** | Proposta — `AUDIT_DOMAIN_DISCOVERY.md § 5` ("Change Set"), agrupando "valores antigos/novos" já citados | O par de valores antes/depois de uma mutação, quando aplicável | Para referenciar o conjunto de alterações de um `AuditEntry` | Presumir que é sempre obrigatório — `AUDIT_EPIC_PLANNING.md § 6` já registrou que nem toda ação tem um valor a comparar |
| **Metadata** | Citada — mas com significado **já estabelecido e diferente** no Shared Kernel: `HasMetadata<T>` (ENG-0001.9), `OrganizationMetadata`/`UserMetadata` (`Record<string, unknown>`) | Um campo livre e não estruturado, já com um contrato formal no Shared Kernel | Se o Audit Domain vier a ter seu próprio campo livre, reutilizar exatamente `HasMetadata<T>` | Não introduzir um "Metadata" próprio do Audit com forma diferente do contrato já existente — ver § 5, § 6 |
| **Context** | Não definida | Nenhuma fonte usa este termo para Audit | — | Não usar |
| **Correlation** | Não definida | Nenhuma fonte (Audit, Event Bus, Shared Kernel) introduz "correlation ID" ou conceito equivalente | — | Não usar até uma decisão de Infrastructure sobre tracing distribuído existir |
| **Causation** | Não definida | Mesma situação de `Correlation` — conceito comum de Event Sourcing, nunca introduzido aqui | — | Não usar |
| **Origin** | Citada — traduz "Origem" (`objects/Organization.md § AUDITORIA`), já usada em `AUDIT_DOMAIN_DISCOVERY.md § 5` | De onde veio a ação — IP, canal, sistema vs. humano | Para referenciar a origem técnica de uma ação | — |
| **Tenant** | Citada, uso único e informal — `objects/Organization.md § DESCRIÇÃO` ("empresa, unidade empresarial ou cliente (SaaS Tenant)"), parentético, nunca um conceito próprio | Sinônimo informal de `Organization` num único ponto de uma fonte; não é um termo de domínio com definição própria | Nunca, no Audit Domain | Usar em vez de `Organization`/`organizationId` — toda a plataforma já usa esse par consistentemente (RN001-RN004, `ENS-0001 § 7`) |
| **Organization** | Citada extensivamente — Organization Domain completo (EPIC-003) | Já definida integralmente por `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`; no Audit, referenciada só por `organizationId` | Para referenciar a Organization a que um `AuditEntry` pertence | Nunca embutida — só referência por id (mesmo princípio já congelado para todo domínio, `IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 8-9`) |
| **Request** | Não definida | Nenhuma fonte usa este termo para Audit | — | Não usar |
| **Session** | Citada, mas pertence a outro domínio — `IDENTITY_TECHNICAL_BLUEPRINT.md` (cabeçalho): "`Session`... está fora do escopo técnico" do Identity Domain, ainda não implementado | Um conceito de Identity/Authentication, deliberadamente não modelado em nenhum domínio ainda | — | Não usar no Audit Domain — importaria um conceito de outro domínio que nem esse domínio já resolveu |
| **Timestamp** | Citada — traduz "Data" (`objects/Organization.md § AUDITORIA`); já convenção consistente em todo o Kernel (`occurredAt`, `createdAt`, `updatedAt: Date`) | Quando a ação ocorreu | Para referenciar o momento de um `AuditEntry`, mesma convenção `Date` já usada em todo domínio | — |

## 4. Relações Conceituais (sem modelo de domínio, sem UML)

Descrição textual apenas — nenhuma `Props`, nenhuma classe, nenhum diagrama:

- `Audit` (domínio) produz `AuditEntry` (candidato a Aggregate).
- `AuditEntry` referencia `Actor` (por id, nunca embutido).
- `AuditEntry` referencia `Subject`/`Target` (por id + tipo — termo ainda não escolhido, § 5).
- `AuditEntry` referencia `Organization` (por `organizationId`, nunca embutida).
- `AuditEntry` pode conter um `ChangeSet` (quando aplicável).
- `AuditEntry` tem um `Origin` e um `Timestamp`.
- `AuditEntry` é derivado de um `DomainEvent` bruto através de uma etapa de enriquecimento cuja responsabilidade permanece indefinida (`AUDIT_DOMAIN_DISCOVERY.md § 7`).
- `AuditTrail` é uma consulta sobre múltiplos `AuditEntry` filtrados por `Subject`/`Target`.

## 5. Ambiguidades Encontradas

1. **`Subject` vs. `Target`** — usados de forma intercambiável em `AUDIT_DOMAIN_DISCOVERY.md § 5` ("Subject (ou Target)"), sem que nenhuma fonte escolha um. Esta é uma ambiguidade introduzida pela própria cadeia de missões deste Epic, não corrigida aqui — registrada para `ENG-0005.4` decidir.
2. **`Metadata`** — se o Audit Domain vier a propor seu próprio campo "metadata", colide conceitualmente com `HasMetadata<T>` já formalizado no Shared Kernel; nenhuma fonte ainda propôs isso, mas o risco de reintroduzir um conceito já existente com forma diferente é real.
3. **`AuditTrail`** — existe como nome de método (`getAuditTrail`, `audit/CONTRACT.md`) mas não como substantivo/tipo formalmente definido em nenhuma fonte anterior a este Epic; o uso como "conceito de consulta" em `AUDIT_DOMAIN_DISCOVERY.md § 5` é uma interpretação, não uma citação direta.
4. **`Tenant` vs. `Organization`** — `objects/Organization.md` usa "Tenant" uma única vez, de forma parentética e informal; um risco latente de alguém usar os dois como se fossem termos de domínio equivalentes, quando só `Organization`/`organizationId` é o padrão real.
5. **Escopo de `Actor`** — não confirmado se atores não-humanos (sistema, automação) precisam ser suportados da mesma forma que um `User` — nenhuma fonte resolve isso.

## 6. Termos Proibidos

- **`Tenant`** — usar `Organization`/`organizationId`, já padrão em toda a plataforma.
- **`Session`** — pertence a Identity/Authentication, ainda fora de escopo até para o próprio Identity Domain; não importar para Audit.
- **`Snapshot`** — implicaria uma estratégia de Event Sourcing nunca decidida.
- **`Correlation`**/**`Causation`** — termos de tracing distribuído sem nenhuma fonte que os introduza ou decisão de Infrastructure que os exija.
- **Usar `Subject` e `Target` como sinônimos intercambiáveis** — proibido a partir desta missão; um dos dois deve ser escolhido explicitamente em `ENG-0005.4`, não presumido.
- **Introduzir um "Metadata" próprio do Audit** com forma diferente de `HasMetadata<T>` já existente no Shared Kernel.

## 7. Impacto nas Próximas Missões

- **Domain Decisions (`ENG-0005.4`)**: deve resolver, como itens específicos e já formulados por este glossário: (a) escolher `Subject` ou `Target`, nunca ambos; (b) confirmar ou negar suporte a `Actor` não-humano; (c) decidir a responsabilidade da etapa de enriquecimento `DomainEvent` → `AuditEntry` (já formulada em `AUDIT_DOMAIN_DISCOVERY.md § 7`).
- **Aggregate Freeze (`ENG-0005.5`)**: deve nomear toda `Props`/getter de `AuditEntry` usando exclusivamente os termos aqui congelados — nenhum sinônimo novo introduzido sem passar por este glossário.
- **Repository Contract (`ENG-0005.9`)**: deve decidir se `getAuditTrail` sobrevive como método próprio (usando o termo já citado em `audit/CONTRACT.md`) ou se é substituído por composição pura de `ReadRepository<AuditEntry>` — tensão já registrada em `AUDIT_DOMAIN_DISCOVERY.md`, Validações.
- **Mapper (persistência, missão futura equivalente a `ENG-0005.11`)**: usará `ChangeSet` e `Origin` como nomes de campo, se confirmados em Decisions — nunca "Change" isolado ou "Snapshot".
- **Event Bus (Epic futuro, recomendado em `KERNEL_MATURITY_ASSESSMENT.md`)**: a responsabilidade de enriquecimento pode recair sobre um Adapter do Event Bus — este glossário não decide isso, mas nomeia o conceito ("etapa de enriquecimento") para que a decisão futura o use sem precisar redescobrir o vocabulário.

## 8. Conclusão

A linguagem ubíqua está **pronta como referência** — todo termo tem proveniência explícita (`Citada`/`Proposta`/`Não definida`), nenhum é apresentado como mais decidido do que realmente está. **Não está "fechada" no sentido de zero ambiguidade**: duas escolhas explícitas (`Subject` vs. `Target`; escopo de `Actor`) permanecem para `ENG-0005.4` resolver antes de qualquer modelagem real prosseguir sem ambiguidade. Isto não é uma falha desta missão — é exatamente o tipo de lacuna que um glossário rigoroso deve expor, não esconder.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Revisão de rastreabilidade**: cada um dos 21 termos avaliados cita sua fonte exata ou é marcado "não definida" — nenhum termo apresentado sem proveniência.
- **Comparação terminológica entre documentos**: `audit/CONTRACT.md`, `event-bus/CONTRACT.md`, `objects/Organization.md § AUDITORIA`, `AUDIT_EPIC_PLANNING.md`, `AUDIT_DOMAIN_DISCOVERY.md` comparados termo a termo — 5 ambiguidades encontradas (§ 5).
- **Verificação de consistência com Shared Kernel**: `DomainEvent`, `Aggregate`, `Metadata`/`HasMetadata<T>` conferidos diretamente contra `packages/shared-kernel/src/`, sem redefinição local proposta.

## DMV

1. Alguma Entity foi criada? Não.
2. Algum Aggregate foi criado ou confirmado? Não — `AuditEntry` permanece candidato (`AUDIT_DOMAIN_DISCOVERY.md § 9`), não confirmado por este glossário.
3. Algum Value Object foi criado? Não.
4. Alguma regra nova foi criada? Não — todo termo deriva de fonte já citada ou é marcado como proposto/não definido.
5. Alguma decisão de domínio pendente foi resolvida? Não — `Subject` vs. `Target` e o escopo de `Actor` permanecem explicitamente em aberto (§ 5, § 8).
6. Há necessidade de ADR? Não para esta missão — glossário não é decisão de arquitetura. As decisões que este glossário aponta para `ENG-0005.4` podem exigir ADR quando resolvidas (ex.: responsabilidade de enriquecimento), não antecipado aqui.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum Aggregate/Entity/Repository/Mapper/Event/Domain Service/ADR/VO/infraestrutura criado | ✅ |
| Nenhuma decisão pendente resolvida | ✅ — 2 ambiguidades explicitamente deferidas |
| Nenhum documento existente alterado | ✅ |
| Todo termo com proveniência declarada, nenhum apresentado sem fonte | ✅ |
| Consistência com Shared Kernel verificada, nenhuma redefinição proposta | ✅ |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (mesmo formato de glossário implícito em `AUDIT_DOMAIN_DISCOVERY.md § 5`, agora formalizado) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado (nenhuma resolução de decisão pendente) | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **Algum termo foi marcado "Citada" sem verificação direta da fonte?** Não — cada termo citado foi conferido contra o arquivo real (`CONSTITUTION.md`, `objects/Organization.md`, `audit/CONTRACT.md`, `packages/shared-kernel/`), não presumido da memória da sessão.
2. **A ambiguidade `Subject`/`Target` foi resolvida em vez de registrada?** Não — permanece explicitamente como proibição de uso intercambiável (§ 6) e item pendente para `ENG-0005.4` (§ 7), nenhuma escolha feita aqui.
3. **A colisão com `Metadata`/`HasMetadata<T>` foi tratada com o mesmo rigor de uma inconsistência real, ou minimizada?** Tratada como ambiguidade real (§ 5) e termo com regra de uso restrita (§ 3, § 6) — não uma nova definição, apenas reconhecimento do contrato já existente.
4. **O documento seria suficiente, sozinho, para orientar `ENG-0005.4` sem reler `AUDIT_DOMAIN_DISCOVERY.md`?** Sim — § 7 já lista, de forma acionável, exatamente quais decisões cada missão futura precisa tomar, citando a seção de origem de cada uma.

## Relatório Final

**Arquivos criados**: `services/kernel/audit/AUDIT_UBIQUITOUS_LANGUAGE.md`.

**Arquivos alterados**: nenhum.

**Fontes consultadas**: `AUDIT_EPIC_PLANNING.md`, `AUDIT_DOMAIN_DISCOVERY.md`, `KERNEL_DOMAIN_LIFECYCLE_V2.md`, `CONSTITUTION.md` (Artigos 10, 12, 18), `PROJECT_RULES.md`, `DomainEvent` (Shared Kernel), `audit/CONTRACT.md`, `event-bus/CONTRACT.md`, `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md`; adicionalmente `objects/Organization.md § AUDITORIA`/`§ DESCRIÇÃO`, `IDENTITY_TECHNICAL_BLUEPRINT.md` (cabeçalho, para `Session`), `HasMetadata<T>`/`OrganizationMetadata`/`UserMetadata` (Shared Kernel/Identity/Organization, para `Metadata`).

**Validações**: Link Checker (ver abaixo), revisão de rastreabilidade, comparação terminológica entre 5 documentos, verificação de consistência com Shared Kernel — 5 ambiguidades encontradas, 6 termos proibidos, nenhuma corrigida ou resolvida.

**Conclusão**: linguagem ubíqua pronta como referência oficial (21 termos avaliados, proveniência declarada para cada um), com 2 escolhas explícitas (`Subject`/`Target`, escopo de `Actor`) deferidas a `ENG-0005.4` — não uma linguagem "fechada", mas uma base sólida e honesta sobre o que já está decidido e o que ainda não está.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
