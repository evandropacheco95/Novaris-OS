# Audit Domain — Bounded Context

Versão: 1.0.0

Status: 🟢 Oficial — fronteiras congeladas; decisões internas permanecem para Domain Decisions

Missão: ENG-0005.3 (Audit Bounded Context) — EPIC-005

Escopo: definir oficialmente as fronteiras do Audit Domain como Bounded Context — o que está dentro, o que está fora, e como se relaciona com os demais domínios da plataforma. Nenhum Aggregate, Entity, Repository, Mapper, Event, Domain Service, Value Object, ADR, infraestrutura, banco, fila ou API foi criado. Nenhuma decisão pendente (`AUDIT_DOMAIN_DISCOVERY.md § 7`; `AUDIT_UBIQUITOUS_LANGUAGE.md § 5`) foi resolvida. Nenhum documento existente foi alterado. Todo termo usado abaixo é exatamente um dos já congelados em `AUDIT_UBIQUITOUS_LANGUAGE.md` — nenhum termo novo introduzido.

---

## 1. Objetivo do Bounded Context

Delimitar, com precisão suficiente para impedir sobreposição futura, o que pertence à fronteira de modelagem do Audit Domain (sua própria Ubiquitous Language, já congelada) e o que pertence a outro domínio — para que `ENG-0005.4` (Domain Decisions) e toda missão futura do EPIC-005 não amplie silenciosamente o escopo do domínio para cobrir responsabilidade alheia.

## 2. Responsabilidades Exclusivas do Audit

Reafirmadas, sem alteração, de `AUDIT_DOMAIN_DISCOVERY.md § 6` e `AUDIT_EPIC_PLANNING.md § 2`:

- Definir e preservar o contrato de um `AuditEntry` — o registro individual e imutável de um fato já ocorrido.
- Garantir imutabilidade do `AuditEntry` após criado (`BOM.md § 8`: "Registro imutável de auditoria").
- Fornecer o único ponto de consulta unificado "o que aconteceu com o Subject/Target X", independentemente de qual domínio o objeto pertence.
- Ser o único lugar da plataforma com essa responsabilidade — nenhum outro domínio deve implementar sua própria trilha paralela (`SYSTEM_ARCHITECTURE.md § 4`: "nenhum domínio replica funcionalidades do Kernel").

## 3. Responsabilidades Explicitamente Fora do Escopo

Reafirmadas de `AUDIT_DOMAIN_DISCOVERY.md § 4` e `AUDIT_EPIC_PLANNING.md § 3`:

- **Logging técnico** — `services/kernel/logging/`, módulo distinto.
- **Validar ou aplicar** a regra de negócio que gerou o fato auditado — Audit registra o que já aconteceu, nunca decide se pode acontecer.
- **Autenticação/autorização** — Identity Domain.
- **Transporte de eventos** — Event Bus; Audit é, no máximo, um consumidor, nunca o transporte em si.
- **Notificação a usuários** — `services/kernel/notifications/`, se e quando existir.
- **Decidir o que é "significativo o suficiente" para ser auditado** — essa decisão pertence ao domínio de origem (quem dispara o evento), nunca ao Audit.

**Fronteira explicitamente não resolvida por este documento**: a etapa de enriquecimento entre `DomainEvent` bruto e `AuditEntry` completo (`AUDIT_DOMAIN_DISCOVERY.md § 7`) pode, ou não, pertencer ao Bounded Context do Audit — não decidido aqui (§ 8, § 9).

## 4. Relação com os Demais Domínios

| Domínio | Relação |
|---|---|
| **Shared Kernel** | Dependência obrigatória — `AggregateRoot<T>`, `Result<T,E>`, `Repository`/`ReadRepository`/`WriteRepository`, `DomainEvent` reutilizados integralmente, nenhuma abstração nova |
| **Identity** | Dependência de referência — `Actor` referenciado por id (`UniqueEntityId` de um `User`), nunca embutido |
| **Organization** | Dependência de referência — `organizationId` referenciado por id, nunca embutido (mesmo princípio já congelado em `IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 8-9`, generalizado aqui) |
| **Event Bus** | Candidata a dependência estrutural — se a decisão de acoplamento (ainda pendente) confirmar consumo assíncrono, Event Bus torna-se o único canal de entrada de fatos; hoje, nem Event Bus nem essa decisão existem |
| **CRM** | Nenhuma dependência de Audit sobre CRM — relação estritamente inversa (mesma regra já aplicada a `Permission`/CRM, `PERMISSION_EPIC_PLANNING.md § 3`); não implementado (`KERNEL_MATURITY_ASSESSMENT.md § 2`, mais próximo é `services/domains/customer/`, scaffolding vazio) |
| **Automation** | Idem CRM — não implementado (`services/kernel/automation-runtime/`, scaffolding vazio) |
| **AI** | Idem CRM — não implementado (`packages/ai/`, scaffolding vazio); se algum dia existir, publicaria eventos como qualquer outro domínio, sem tratamento especial |
| **Marketplace** | Idem CRM — não existe nenhuma pasta correspondente em `services/domains/` |
| **Billing** | Idem CRM — não implementado; `billingStatus`/`trialEnd` são campos do Blueprint técnico de Organization ainda excluídos do Aggregate real (`ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3`) |

Para os 5 últimos (CRM, Automation, AI, Marketplace, Billing): nenhum depende de Audit hoje porque nenhum existe implementado; quando existirem, a relação será sempre a mesma — eles publicam fatos, Audit os consome, nunca o contrário.

## 5. Pontos de Entrada (sem definir implementação)

Candidatos, nenhum confirmado:

- **Consumo de `DomainEvent` via Event Bus** — candidato preferencial para desacoplamento (`AUDIT_EPIC_PLANNING.md § 4`), condicionado à existência do Event Bus e à decisão de enriquecimento (§ 3, § 8).
- **Chamada direta** (`logEvent(entry: AuditEntry)`, já proposta em `audit/CONTRACT.md`) — candidato alternativo, já identificado como risco de acoplamento (`AUDIT_EPIC_PLANNING.md § 7`, "Alto").

Nenhum dos dois é escolhido aqui — ambos permanecem candidatos até `ENG-0005.4`.

## 6. Pontos de Saída (sem definir implementação)

- Consulta por `Subject`/`Target` (equivalente a `getAuditTrail`, `audit/CONTRACT.md`) — candidato de leitura mais citado.
- Consulta por `Actor`, por período, ou por `Organization` — candidatos especulativos, nenhuma fonte oficial os confirma ainda (mesma disciplina de "não antecipar decisão de infraestrutura" já usada nos Repository Contracts de Identity/Organization).
- Nenhuma saída de escrita além da criação inicial — imutabilidade (§ 2) implica que não existe "atualizar" ou "corrigir" um `AuditEntry` já criado.

## 7. Dependências Conceituais

| Categoria | Domínios/Módulos |
|---|---|
| **Obrigatórias** | Shared Kernel (base arquitetural); Identity (referência de `Actor`); Organization (referência de `organizationId`) |
| **Opcionais hoje — candidata a obrigatória** | Event Bus: hoje opcional só porque não existe e a decisão de acoplamento não foi tomada; se `ENG-0005.4` confirmar consumo assíncrono, torna-se obrigatória por definição |
| **Inexistentes** | CRM, Automation, AI, Marketplace, Billing — nenhuma dependência de Audit sobre qualquer um deles, em nenhuma direção que importe código ou tipo concreto |

## 8. Fronteiras Arquiteturais

**Quem produz informação?** Cada domínio de origem, ao disparar seus próprios Domain Events já implementados (`OrganizationCreated`, os 9 eventos de Identity) — o fato bruto nasce fora da fronteira do Audit Domain, sempre.

**Quem enriquece?** **Não decidido** — candidatos, nenhum confirmado: o próprio domínio de origem antes de publicar; o Audit Domain ao consumir; um Adapter do Event Bus. Independentemente de qual for a resposta, o resultado enriquecido (`AuditEntry`) pertence à fronteira do Audit Domain; o `DomainEvent` bruto nunca pertence a ela — só é consumido, nunca possuído.

**Quem persiste?** Um Repository do próprio Audit Domain (ainda não criado) persistiria `AuditEntry` — nunca o Repository de outro domínio, e o Audit nunca persiste dados de outro domínio além da referência por id (`Actor`, `organizationId`, `Subject`/`Target`).

**Quem consulta?** Qualquer domínio ou camada de Application/Interface que precise de rastreabilidade consultaria através do próprio contrato de leitura do Audit Domain (ainda não definido) — nunca acessando a persistência do Audit diretamente, mesma regra já congelada para todo domínio (`DOMAIN_MODEL.md § REGRAS`: "um domínio nunca acessa tabelas de outro domínio").

**Nada disto define *como*** (tecnologia, Repository real, Mapper) — apenas *quem* é responsável por cada papel conceitual.

## 9. Riscos de Contaminação

Registrados, não resolvidos:

1. **Audit importar tipos concretos de outro domínio** (ex.: `import { OrganizationCreated } from "@novaris/organizations"`) para "enriquecer" um evento — violaria a fronteira já identificada em `AUDIT_DOMAIN_DISCOVERY.md § 8` como proibida.
2. **Domínio de negócio chamando `logEvent()` diretamente** em vez de publicar um evento genérico — acopla domínios de negócio à existência do Audit Domain de forma síncrona (mesmo risco de `AUDIT_EPIC_PLANNING.md § 7`, "Alto").
3. **Audit decidindo regra de negócio do domínio de origem** (ex.: "esta mutação é significativa o suficiente para gerar auditoria?") — violaria § 2/§ 3 acima; essa decisão pertence sempre ao domínio de origem.
4. **`AuditEntry` introduzindo um campo "metadata" com forma diferente de `HasMetadata<T>`** já existente no Shared Kernel — ambiguidade já registrada em `AUDIT_UBIQUITOUS_LANGUAGE.md §§ 5-6`.
5. **`getAuditTrail` sobrevivendo como método de conveniência** do futuro Repository Contract, divergindo do padrão já estabelecido (zero métodos de conveniência, `UserRepository`/`OrganizationRepository`) sem uma decisão formal que justifique a exceção.

## 10. Conclusão

O Bounded Context do Audit Domain está **pronto para orientar a fase de Domain Decisions** — as fronteiras (§§ 2-7) são claras o suficiente para impedir sobreposição de responsabilidade com qualquer outro domínio já implementado ou planejado. Isto não significa que todas as perguntas internas estejam resolvidas: "quem enriquece" (§ 8), a escolha entre `Subject`/`Target` (`AUDIT_UBIQUITOUS_LANGUAGE.md § 5`), e o mecanismo exato de acoplamento com o Event Bus (§ 5, § 7) permanecem deliberadamente em aberto — são perguntas de **conteúdo dentro da fronteira**, não perguntas sobre onde a fronteira está. Um Bounded Context não precisa resolvê-las para estar pronto; precisa apenas garantir que, sejam quais forem as respostas, elas não vazem para dentro de outro domínio nem tragam responsabilidade alheia para dentro deste.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Revisão de rastreabilidade**: toda responsabilidade/relação/risco cita a seção exata de `AUDIT_EPIC_PLANNING.md`, `AUDIT_DOMAIN_DISCOVERY.md` ou `AUDIT_UBIQUITOUS_LANGUAGE.md` de onde deriva — nenhuma afirmação nova sem fonte.
- **Comparação entre fronteiras definidas e arquitetura atual**: confirmado por inspeção (`KERNEL_MATURITY_ASSESSMENT.md § 2`) que CRM/Automation/AI/Marketplace/Billing realmente não têm implementação — a relação "inexistente" declarada em § 4/§ 7 corresponde ao estado real do repositório, não a uma suposição.
- **Verificação de consistência com o Shared Kernel**: `AggregateRoot`/`Result`/`Repository`/`DomainEvent` referenciados exatamente como já implementados, nenhuma extensão proposta.

## DMV

1. Alguma Entity foi criada? Não.
2. Algum Aggregate foi modelado? Não — `AuditEntry` continua candidato, sem `Props` nem método.
3. Algum Value Object foi criado? Não.
4. Alguma regra nova foi criada? Não.
5. Alguma decisão pendente foi resolvida? Não — enriquecimento, `Subject`/`Target`, e acoplamento com Event Bus permanecem explicitamente em aberto.
6. Há necessidade de ADR? Não para esta missão — delimitação de fronteira não é decisão de arquitetura vinculante; as decisões que esta fronteira aponta para `ENG-0005.4` podem exigir ADR quando tomadas, não antecipado aqui.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum Aggregate/Entity/Repository/Mapper/Event/Domain Service/VO/ADR/infraestrutura/banco/fila/API criado | ✅ |
| Nenhuma decisão pendente resolvida | ✅ — 3 questões centrais permanecem explicitamente abertas |
| Nenhum documento existente alterado | ✅ |
| Todo termo usado é um dos já congelados em `AUDIT_UBIQUITOUS_LANGUAGE.md` | ✅ — nenhum termo novo introduzido |
| Relações com domínios não implementados verificadas por inspeção real, não presumidas | ✅ |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (mesmo formato de `IDENTITY_DOMAIN_CLOSURE.md § 8`, "Boundary do Identity Domain", usado como referência) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado (nenhuma resolução de decisão pendente) | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **Algum termo fora dos já congelados em `AUDIT_UBIQUITOUS_LANGUAGE.md` foi introduzido?** Não — toda referência usa exatamente `Actor`, `Subject`/`Target` (mantido como par não resolvido), `AuditEntry`, `ChangeSet`, `Origin`, sem nenhum sinônimo novo.
2. **A pergunta "quem enriquece" foi resolvida, mesmo que implicitamente?** Não — § 8 explicitamente lista os 3 candidatos sem escolher nenhum, e § 3 reafirma que essa fronteira específica não é resolvida por este documento.
3. **As relações "inexistentes" (CRM, Automation, AI, Marketplace, Billing) foram verificadas ou presumidas?** Verificadas — conferidas contra `KERNEL_MATURITY_ASSESSMENT.md § 2` e a inspeção de estrutura real já feita naquela missão, não presumidas por analogia.
4. **A conclusão (§ 10) confunde "fronteira pronta" com "tudo decidido"?** Não — § 10 distingue explicitamente as duas coisas, afirmando que perguntas de conteúdo interno permanecem abertas sem que isso invalide a prontidão da fronteira.

## Relatório Final

**Arquivos criados**: `services/kernel/audit/AUDIT_BOUNDED_CONTEXT.md`.

**Arquivos alterados**: nenhum.

**Fontes consultadas**: `AUDIT_EPIC_PLANNING.md`, `AUDIT_DOMAIN_DISCOVERY.md`, `AUDIT_UBIQUITOUS_LANGUAGE.md`, `KERNEL_DOMAIN_LIFECYCLE_V2.md`, `PROJECT_RULES.md`, `CONSTITUTION.md`, `DomainEvent` (Shared Kernel), `audit/CONTRACT.md`, `event-bus/CONTRACT.md`, `IDENTITY_DOMAIN_CLOSURE.md`, `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md`, `KERNEL_MATURITY_ASSESSMENT.md`.

**Validações**: Link Checker (ver abaixo), revisão de rastreabilidade, comparação fronteiras↔arquitetura real, verificação de consistência com Shared Kernel — todas executadas, nenhuma divergência encontrada além das já conhecidas.

**Conclusão**: Bounded Context do Audit Domain congelado e pronto para orientar `ENG-0005.4` (Domain Decisions). Três questões de conteúdo interno permanecem explicitamente abertas (enriquecimento, `Subject`/`Target`, acoplamento com Event Bus) — corretamente fora do escopo de uma definição de fronteira.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
