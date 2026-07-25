# Audit Domain — Decision Resolution

Versão: 1.0.0

Status: 🟢 Oficial — decisões de domínio resolvidas, sem implementação

Missão: ENG-0005.4 (Audit Domain Decisions) — EPIC-005

Escopo: resolver as decisões arquiteturais fundamentais do Audit Domain, exclusivamente a partir da evidência já coletada em `AUDIT_EPIC_PLANNING.md`, `AUDIT_DOMAIN_DISCOVERY.md`, `AUDIT_UBIQUITOUS_LANGUAGE.md` e `AUDIT_BOUNDED_CONTEXT.md`. Nenhum Aggregate, Repository, Mapper, código, infraestrutura ou ADR foi criado. Nenhum documento existente foi alterado.

**Nota de método**: cada decisão abaixo segue o mesmo formato já usado em `ORGANIZATION_DOMAIN_DECISIONS.md` — problema, evidência, decisão, justificativa, necessidade de ADR. Nenhuma decisão inventa conteúdo sem fonte; onde a evidência não permite decidir sem inventar, a decisão é marcada como adiada (§ 9), nunca forçada.

---

## 1. Aggregate Root Candidato

**Problema**: confirmar, ou não, `AuditEntry` como o candidato a Aggregate Root do domínio.

**Evidência**: `AUDIT_DOMAIN_DISCOVERY.md § 9` já identificou `AuditEntry` como candidato com base estrutural real (identidade própria necessária para recuperação independente, `getAuditTrail(objectId)` já citado em `audit/CONTRACT.md`) — diferente de `Permission`, que falhou esse mesmo teste (`PERMISSION_DOMAIN_DISCOVERY.md §§ 2, 6`). `AuditTrail` foi explicitamente descartado como Aggregate próprio (`AUDIT_DOMAIN_DISCOVERY.md § 5`: "conceito de consulta, não necessariamente um objeto próprio"). Nenhum outro candidato foi identificado em nenhuma das 4 missões anteriores.

**Decisão**: **Confirmado.** `AuditEntry` é o único e definitivo candidato a Aggregate Root a levar para `ENG-0005.5` (Aggregate Design Freeze).

**Justificativa**: nenhuma evidência contrária foi encontrada em 4 missões de investigação; a razão estrutural (identidade + recuperação independente) é a mesma que qualificou `Organization` como Aggregate (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 1`) e desqualificou `Permission`.

**Exige ADR?** Não — confirmação de candidato a Aggregate é modelagem de domínio específico, mesma categoria de decisão que `Organization`/`User`/`Role` não exigiram ADR para serem confirmados como Aggregates.

## 2. Responsabilidade do Aggregate

**Problema**: definir o que `AuditEntry`, como Aggregate, é responsável por proteger.

**Evidência**: `AUDIT_BOUNDED_CONTEXT.md §§ 2-3` já delimita que Audit "registra o que já aconteceu, nunca decide"; `BOM.md § 8` exige imutabilidade; `AGGREGATE_IMPLEMENTATION_STANDARD.md § 6` (ENS-0001) já estabelece que `createdBy`/`updatedBy` são sempre fornecidos pela Application Layer, nunca inferidos pelo Aggregate.

**Decisão**: `AuditEntry` é responsável exclusivamente por (a) garantir que todo campo mínimo já confirmado (`AUDIT_EPIC_PLANNING.md § 6`: Actor, Timestamp, Origin, Action, ChangeSet quando aplicável, `organizationId`, Target) esteja presente no momento da criação; (b) garantir sua própria imutabilidade — nenhum método público de mutação, por design, nunca. `AuditEntry` **não é responsável** por decidir se um fato deve ser auditado (isso é do domínio de origem, `AUDIT_BOUNDED_CONTEXT.md § 3`) nem por executar o enriquecimento em si (§ 4, § 5 abaixo) — recebe dados já enriquecidos como input do seu próprio `create()`.

**Justificativa**: mantém `AuditEntry` consistente com o padrão geral de Aggregate (ENS-0001) sem inventar uma responsabilidade que nenhuma fonte atribui a ele — a diferença em relação a um Aggregate típico é que `AuditEntry`, uma vez criado, nunca muda (§ 1), então sua "responsabilidade contínua" é zero, apenas a responsabilidade pontual de nascer válido.

**Exige ADR?** Não — elaboração direta do padrão já congelado em `AGGREGATE_IMPLEMENTATION_STANDARD.md`, sem regra de negócio nova.

## 3. Fronteira entre DomainEvent e AuditEntry

**Problema**: definir onde termina o `DomainEvent` (Shared Kernel) e começa o `AuditEntry` (Audit Domain).

**Evidência**: `DomainEvent` (`packages/shared-kernel/src/core/domain-events/domain-event.ts`, ENG-0001.5) tem exatamente 4 campos: `eventId`, `aggregateId`, `occurredAt`, `eventName`. Os campos mínimos de `AuditEntry` já confirmados (`AUDIT_EPIC_PLANNING.md § 6`) incluem `Actor`, `organizationId`, `ChangeSet` — nenhum presente em `DomainEvent`. Comparação direta, não inferida.

**Decisão**: a fronteira é estrutural, não uma escolha: **um `DomainEvent` bruto nunca é, por si só, suficiente para construir um `AuditEntry`.** `DomainEvent` pertence inteiramente ao domínio de origem (é disparado por `Organization`/`User`/`Role`); `AuditEntry` pertence inteiramente ao Audit Domain. Não existe sobreposição de tipo entre os dois — apenas uma relação de derivação unidirecional (`DomainEvent` → [enriquecimento] → `AuditEntry`).

**Justificativa**: comparação direta de assinatura de tipo, sem interpretação — os campos simplesmente não existem no `DomainEvent` real.

**Exige ADR?** Não — é reconhecimento de uma diferença estrutural já visível no código, não resolução de contradição entre fontes.

## 4. Necessidade (ou não) de Enriquecimento

**Problema**: confirmar se a etapa de enriquecimento identificada em `AUDIT_DOMAIN_DISCOVERY.md § 7` é, de fato, necessária.

**Evidência**: decorrência direta de § 3 acima — se `DomainEvent` não carrega `Actor`/`organizationId`/`ChangeSet`, e esses campos são obrigatórios em `AuditEntry`, então uma etapa de enriquecimento é estruturalmente necessária, não opcional.

**Decisão**: **Sim, o enriquecimento é necessário.** Não é uma escolha de design — é uma consequência direta da diferença de forma entre os dois tipos (§ 3).

**Justificativa**: mesma evidência de § 3, sem necessidade de argumento adicional.

**Exige ADR?** Não — decorrência lógica direta de uma decisão (§ 3) que também não exigiu ADR.

## 5. Responsável Conceitual pelo Enriquecimento (sem definir implementação)

**Problema**: `AUDIT_DOMAIN_DISCOVERY.md § 7` e `AUDIT_BOUNDED_CONTEXT.md § 8` deixaram 3 candidatos em aberto: (a) o domínio de origem, antes de publicar; (b) o próprio Audit Domain, ao consumir; (c) um Adapter do Event Bus.

**Evidência**: `AGGREGATE_IMPLEMENTATION_STANDARD.md § 6` (ENS-0001) já estabelece, para todo Aggregate, que `createdBy`/`updatedBy` "são sempre fornecidos pela Application Layer (quem está executando a operação) — o Aggregate nunca infere 'usuário atual' sozinho". Isso significa que a Application Layer do domínio de origem **já possui**, no momento da execução de qualquer caso de uso, exatamente os dados que faltam ao `DomainEvent` (quem está executando, em qual Organization) — sem precisar consultar nenhum outro domínio. Se o Audit Domain tentasse enriquecer sozinho (opção b), precisaria consultar Identity/Organization diretamente, violando a fronteira já registrada como risco de contaminação (`AUDIT_BOUNDED_CONTEXT.md § 9`, item 1: "Audit importar tipos concretos de outro domínio"). Um Adapter do Event Bus (opção c) só reposicionaria o mesmo problema — teria que receber essa informação de algum lugar, e o único lugar que já a possui sem consulta extra é a Application Layer de origem.

**Decisão**: **A Application Layer do domínio de origem** é conceitualmente responsável pelo enriquecimento — ela anexa `Actor`/`organizationId`/`ChangeSet` (dados que já possui, por já estar executando a operação) antes de o fato ser publicado. Isto é uma decisão **conceitual** (quem é responsável), não de implementação: não define se isso acontece via um wrapper, um Decorator, ou qualquer mecanismo concreto — apenas que a responsabilidade pertence à camada e ao domínio que já possui a informação, nunca ao Audit Domain nem a um Adapter de transporte.

**Justificativa**: única opção que não exige que Audit (ou o Event Bus) consulte outro domínio diretamente — preserva a fronteira já congelada (`DOMAIN_MODEL.md § REGRAS`: "um domínio nunca acessa [dados de] outro diretamente") e reutiliza um padrão arquitetural já existente (ENS-0001 § 6) em vez de inventar um novo.

**Exige ADR?** **Sim, recomendado.** Este é um mecanismo vinculante para **toda a plataforma** — todo domínio futuro que quiser ser auditado precisará seguir esse padrão de enriquecimento em sua própria Application Layer. Mesma categoria de decisão que já exigiu ADR anteriormente (`ADR-0010`, mecanismo de infraestrutura vinculante para toda a plataforma). Não criado nesta missão — fica registrado como necessário antes de `ENG-0005.7` (Aggregate Implementation) ou de qualquer domínio de origem real implementar a publicação enriquecida.

> **Nota de Resolução (`ADR-0035`, `ENG-0135`)**: ADR criada. Mecanismo concreto decidido — chamada direta via Dependency Injection (Handler de origem recebe `CreateAuditEntryHandler` injetado, chama após sua própria operação ter sucesso; falha no enriquecimento não reverte nem falha a operação primária). Primeira integração real: `UpdateOrganizationProfileHandler` (Organization Domain).

## 6. Terminologia Oficial: Subject, Target ou Alternativa

**Problema**: `AUDIT_UBIQUITOUS_LANGUAGE.md §§ 5-6` registrou `Subject`/`Target` como usados de forma intercambiável, sem fonte que escolha um, proibindo o uso ambíguo até esta decisão.

**Evidência**: a única fonte anterior a este Epic (`audit/CONTRACT.md § Interface Pública`) usa literalmente `objectId` como nome de parâmetro — nem "Subject" nem "Target" aparecem em nenhuma fonte anterior a este Epic; ambos são `Proposta` (`AUDIT_UBIQUITOUS_LANGUAGE.md § 3`). Considerando terminologia já usada na plataforma: "Object" colidiria com "Object Specification" (`OBJECT_SPECIFICATION_TEMPLATE.md`, `knowledge/core/objects/`), um conceito já consolidado e completamente diferente — descartado por esse motivo. "Subject", em terminologia comum de segurança/autorização, frequentemente se refere ao **ator** que executa uma ação (não ao que é afetado) — risco real de confusão com `Actor`, já definido de forma distinta neste mesmo glossário.

**Decisão**: **`Target`.** Termo oficial a partir desta missão para "o objeto afetado por uma ação".

**Justificativa**: é a opção que menos risco de colisão carrega — não conflita com "Object Specification" (como "Object" conflitaria) nem com o significado comum de "Subject" em terminologia de autorização (que se aproximaria de `Actor`). Esta é uma escolha de nomenclatura específica do domínio, não uma leitura de fonte que já decidia isso — reconhecida explicitamente como julgamento técnico, não citação.

**Exige ADR?** Não — nomenclatura de domínio específico, mesma categoria de decisão que a nomeação de Value Objects (`Email`, `Permission`) nunca exigiu ADR.

## 7. Necessidade de Repository Próprio

**Problema**: confirmar se `AuditEntry` precisa de um Repository próprio.

**Evidência**: consequência direta de § 1 — se `AuditEntry` for confirmado como `AggregateRoot` (Freeze, `ENG-0005.5`), a restrição de tipo já existente no Shared Kernel (`Repository<T extends AggregateRoot<unknown>>`) torna um Repository não apenas possível, mas a única forma correta de persistência — exatamente o oposto do que `PERMISSION_DOMAIN_DISCOVERY.md § 6` concluiu para `Permission` (estruturalmente impedida de ter Repository).

**Decisão**: **Sim, necessário** — condicionado à confirmação formal de `AuditEntry` como `AggregateRoot` no Freeze (`ENG-0005.5`). A base já demonstrada (§ 1) é suficiente para prever essa necessidade agora; a decisão vinculante e definitiva só se torna real após o Freeze confirmar a estrutura completa do Aggregate.

**Justificativa**: mesma lógica estrutural já usada para `Organization`/`User`/`Role` (Aggregates têm Repository) e para `Permission` (Value Objects não têm) — nenhum critério novo, aplicação consistente do já estabelecido.

**Exige ADR?** Não — decorrência estrutural direta do Shared Kernel já implementado, não uma decisão de arquitetura nova.

## 8. Necessidade de Consultas Especializadas (sem definir interface)

**Problema**: confirmar se, além dos métodos genéricos (`findById`/`findAll`/`exists`/`save`/`delete`), o Repository de Audit precisa de alguma consulta especializada.

**Evidência**: `audit/CONTRACT.md § Interface Pública` já propõe `getAuditTrail(objectId): AuditEntry[]` — consulta por `Target` (§ 6). Diferente do padrão já estabelecido para `Organization`/`Identity` (onde consultas de conveniência foram explicitamente rejeitadas — "acrescentar um método agora seria antecipar uma decisão de infraestrutura", `organization-repository.ts`), a consulta por `Target` não é uma conveniência adicionada depois: é a **responsabilidade primária** que já justificou `AuditEntry` como candidato a Aggregate (§ 1; `AUDIT_DOMAIN_DISCOVERY.md § 9`: precisa ser "recuperável de forma independente"). Sem uma consulta por `Target`, o próprio motivo de existência do domínio (`AUDIT_BOUNDED_CONTEXT.md § 2`: "único ponto de consulta unificado") não se sustenta.

**Decisão**: **Sim, ao menos uma consulta especializada por `Target` é necessária** — nome e assinatura exatos não definidos aqui (restrição explícita da ordem). Isto pode significar que o Repository Contract de Audit (`ENG-0005.9`, futuro) legitimamente diverge do padrão "zero métodos de conveniência" já usado por `Organization`/`Identity` — mas essa divergência específica (nome, assinatura, se outras consultas como "por `Actor`" ou "por período" também se justificam) é decisão daquela missão futura, não travada aqui.

**Justificativa**: distinção clara entre "conveniência antecipando infraestrutura" (rejeitada para Organization/Identity) e "responsabilidade primária do domínio" (o caso de Audit) — nenhum critério novo inventado, apenas reconhecimento de que os dois casos são estruturalmente diferentes.

**Exige ADR?** Não agora — é reconhecimento de necessidade, não uma interface real. Se `ENG-0005.9` formalizar uma divergência do padrão "zero métodos" já estabelecido, essa missão futura deve avaliar se isso exige ADR (mesma categoria de decisão que estabelece precedente de arquitetura) — não antecipado aqui.

## 9. Decisões Adiadas (com justificativa)

| Decisão adiada | Por quê |
|---|---|
| Se `Actor` suporta atores não-humanos (sistema, automação) | `AUDIT_UBIQUITOUS_LANGUAGE.md § 5` já registrou como ambiguidade; nenhuma fonte oficial confirma ou nega a necessidade — decidir agora seria inventar um caso de uso sem evidência |
| Mecanismo exato de acoplamento com Event Bus (consumo assíncrono real vs. fallback de chamada direta até Event Bus existir) | Depende de um Epic futuro (Event Bus) que ainda não começou (`KERNEL_MATURITY_ASSESSMENT.md § 9`, recomendado como o Epic seguinte a este) |
| Consultas especializadas além de "por `Target`" (por `Actor`, por período, por `Organization`) | Nenhuma fonte oficial as confirma; `audit/CONTRACT.md` só cita `getAuditTrail(objectId)` |
| Forma real de `Target`/`Actor` (Value Object com validação vs. string/id simples) | Decisão de `ENG-0005.5` (Aggregate Design Freeze), não deste documento |
| Nome e assinatura exata de qualquer método de consulta especializada | Decisão de `ENG-0005.9` (Repository Contract), não deste documento |
| Tensão entre imutabilidade (`BOM.md § 8`) e futura política de retenção/expurgo (LGPD/GDPR) | Decisão de compliance/produto, já registrada como risco em `AUDIT_EPIC_PLANNING.md § 7`, fora do escopo de decisão de domínio técnico |
| Tratamento se o enriquecimento falhar (dado de origem incompleto) | Decisão de tratamento de erro pertencente a uma fase de implementação futura, não de modelagem de domínio |

## 10. Status das Decisões

| # | Decisão | Status | Exige ADR |
|---|---|---|---|
| 1 | `AuditEntry` confirmado como candidato a Aggregate Root | ✅ Confirmado | Não |
| 2 | Responsabilidade do Aggregate (nascer válido, imutável, nunca decidir) | ✅ Confirmado | Não |
| 3 | Fronteira `DomainEvent` × `AuditEntry` (estrutural, sem sobreposição) | ✅ Confirmado | Não |
| 4 | Enriquecimento é necessário | ✅ Confirmado | Não |
| 5 | Application Layer do domínio de origem enriquece | ✅ Confirmado (conceitual) | **Sim, recomendado** |
| 6 | Terminologia oficial: `Target` | ✅ Confirmado | Não |
| 7 | Repository próprio necessário (condicionado ao Freeze) | ✅ Confirmado (condicional) | Não |
| 8 | Consulta especializada por `Target` necessária | ✅ Confirmado (sem interface) | Não agora; possível em `ENG-0005.9` |
| 9 | 7 decisões adiadas | 📋 Registradas | N/A |

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Revisão de rastreabilidade**: toda decisão cita a seção exata de `AUDIT_EPIC_PLANNING.md`, `AUDIT_DOMAIN_DISCOVERY.md`, `AUDIT_UBIQUITOUS_LANGUAGE.md`, `AUDIT_BOUNDED_CONTEXT.md`, ou um Standard/ADR já existente (`ENS-0001`, `ADR-0010`).
- **Comparação entre decisões e evidências coletadas**: nenhuma decisão introduz um fato não presente nas 4 missões anteriores ou nos Standards já congelados — verificado item a item acima.

## DMV

1. Alguma Entity foi criada? Não.
2. Algum Aggregate foi criado? Não — `AuditEntry` confirmado como candidato, sem `Props`, sem método, sem implementação.
3. Algum Value Object foi criado? Não.
4. Alguma regra de negócio nova foi criada? Não — toda decisão deriva de evidência já coletada ou de um padrão arquitetural já congelado (ENS-0001).
5. Alguma decisão de outro domínio (Identity, Organization) foi modificada? Não — `ENS-0001 § 6` foi citado, não alterado.
6. Há necessidade de ADR? Sim, para 1 decisão (§ 5) — registrada, não criada aqui.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum Aggregate/Repository/Mapper/código/infraestrutura/ADR criado | ✅ |
| Toda decisão rastreável a evidência já coletada | ✅ |
| Nenhuma regra criada por conveniência | ✅ — inclusive a terminologia (§ 6) foi explicitamente marcada como julgamento técnico, não citação |
| Decisões adiadas justificadas, não forçadas | ✅ — 7 itens em § 9 |
| Nenhum documento existente alterado | ✅ |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`ORGANIZATION_DOMAIN_DECISIONS.md`, mesmo formato) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado (nenhum código, nenhuma tecnologia, nenhum ADR criado) | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **Alguma decisão foi tomada por conveniência, sem evidência suficiente?** Não — as 7 decisões (§§ 1-8, exceto o item adiado de cada uma) citam evidência específica; onde a evidência não bastava, a decisão foi para § 9, não forçada.
2. **A escolha de `Target` (§ 6) foi apresentada como mais certa do que é?** Não — explicitamente rotulada "julgamento técnico, não citação", com o raciocínio de descarte de alternativas exposto.
3. **A decisão sobre o responsável pelo enriquecimento (§ 5) reabre a fronteira já congelada em `AUDIT_BOUNDED_CONTEXT.md`?** Não — reforça a mesma fronteira (Audit nunca consulta outro domínio diretamente), apenas resolve quem, dentro dela, faz o trabalho.
4. **A necessidade de ADR foi subestimada ou superestimada?** Calibrada por comparação direta com precedentes já existentes (`ADR-0010` para § 5; ausência de ADR para nomeação de Value Object em § 6) — não um critério novo.

## Relatório Final

**Arquivos criados**: `services/kernel/audit/AUDIT_DOMAIN_DECISIONS.md`.

**Arquivos alterados**: nenhum.

**Fontes consultadas**: `AUDIT_EPIC_PLANNING.md`, `AUDIT_DOMAIN_DISCOVERY.md`, `AUDIT_UBIQUITOUS_LANGUAGE.md`, `AUDIT_BOUNDED_CONTEXT.md`, `KERNEL_DOMAIN_LIFECYCLE_V2.md`, `PROJECT_RULES.md`, `CONSTITUTION.md`, `DomainEvent` (Shared Kernel), `audit/CONTRACT.md`, `event-bus/CONTRACT.md`; adicionalmente `AGGREGATE_IMPLEMENTATION_STANDARD.md § 6` (fonte de § 2, § 5), `ADR-0010` (precedente de necessidade de ADR, § 5), `ORGANIZATION_DOMAIN_DECISIONS.md` (padrão de formato).

**Validações**: Link Checker (ver abaixo), revisão de rastreabilidade, comparação decisões↔evidência — nenhuma divergência.

**Conclusão**: 8 decisões resolvidas (§§ 1-8), 7 decisões adiadas com justificativa (§ 9), 1 necessidade de ADR registrada (§ 5, enriquecimento pela Application Layer de origem). Conjunto suficiente para `ENG-0005.5` (Aggregate Design Freeze) prosseguir com rastreabilidade integral.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
