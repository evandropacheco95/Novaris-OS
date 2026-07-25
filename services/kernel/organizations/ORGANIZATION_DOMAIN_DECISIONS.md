# Organization Domain — Decision Resolution

Versão: 1.0.0

Status: 🟢 Oficial — decisões resolvidas, sem implementação

Missão: ENG-0003.4 (Organization Domain Decision Resolution) — EPIC-003

Escopo: resolver exclusivamente as 5 decisões abertas identificadas em [ORGANIZATION_AGGREGATE_DESIGN.md §§ 15-16](ORGANIZATION_AGGREGATE_DESIGN.md) (ENG-0003.3). Nenhum código, Aggregate, Entity, Repository ou Domain Service real foi criado. **Nenhum documento existente foi alterado** — este documento **supera** partes específicas de `ORGANIZATION_DOMAIN_DISCOVERY.md`, `ORGANIZATION_DOMAIN_MODEL.md` e `ORGANIZATION_AGGREGATE_DESIGN.md` sem reescrevê-los, exatamente indicado em cada decisão abaixo.

---

## Nota de Método

Cada decisão responde às 6 perguntas exigidas pela ordem de missão. Nenhuma hipótese vira decisão sem justificativa citando fonte real — onde a base documental não permite uma resolução defensável sem inventar conteúdo, a pergunta permanece aberta (nenhuma das 5 caiu nesse caso, mas o critério foi aplicado a cada uma antes de decidir).

---

## DEC-ORG-001 — Status vs. Lifecycle

### 1. Qual problema existe?

[objects/Organization.md](../../../knowledge/core/objects/Organization.md) tem duas representações de estado que não coincidem: `§ LIFECYCLE` desenha uma cadeia linear de 6 estados (`Created → Pending Configuration → Active → Suspended → Archived → Deleted`); `§ STATUS` lista 5 valores (`ACTIVE`, `SUSPENDED`, `TRIAL`, `BLOCKED`, `ARCHIVED`). `TRIAL`/`BLOCKED` não aparecem no diagrama; `Created`/`Pending Configuration`/`Deleted` não aparecem na lista. Identificado em `ORGANIZATION_AGGREGATE_DESIGN.md § 10`.

### 2. Quais opções foram consideradas?

- **A**: `§ STATUS` (5 valores) é canônico; `§ LIFECYCLE` é narrativa/conceitual, não um enum literal.
- **B**: `§ LIFECYCLE` (6 estados) é canônico; `§ STATUS` está incompleto.
- **C**: Unificar as duas listas num superconjunto de 8 valores.
- **D**: `§ STATUS` é o campo `status` persistido; `§ LIFECYCLE` descreve fases amplas que não mapeiam 1:1 para `status` — alguns estados do diagrama (`Deleted`) são representados por outro campo (`deleted_at`), não por `status`.

### 3. Qual decisão foi tomada?

**Opção D.** `status` é um campo com exatamente os 5 valores de `§ STATUS` (`ACTIVE`, `SUSPENDED`, `TRIAL`, `BLOCKED`, `ARCHIVED`). `§ LIFECYCLE` é tratado como descrição narrativa de fases amplas, não um enum à parte. Especificamente: `Deleted` do diagrama **não é** um valor de `status` — é representado pelo campo `deleted_at` já existente em `§ ATRIBUTOS` (RN005, Soft Delete), coerente com sua ausência da lista de 5 valores. `Created`/`Pending Configuration` são fases transitórias anteriores a um `status` estável, cujo mapeamento exato para um valor de `status` real (provavelmente `TRIAL`, a decidir em Blueprint futuro) não é definido por esta decisão.

### 4. Por que essa decisão?

É a leitura que menos inventa: explica **todos** os 5 valores de `§ STATUS` usando apenas conteúdo já citado em outro lugar do mesmo documento — `TRIAL` conecta-se diretamente ao atributo `trial_end` já existente; `BLOCKED` conecta-se ao evento `OrganizationBillingFailed` (já na lista de 8 eventos de `§ EVENTOS`). A alternativa (B, `§ LIFECYCLE` canônico) deixaria `TRIAL` e `BLOCKED` sem nenhuma explicação — atributo e evento órfãos. `§ STATUS` também é o nome literal do campo já citado em `§ ATRIBUTOS` (`status`), enquanto `§ LIFECYCLE` não corresponde a nenhum campo nomeado — reforça que `STATUS` é o campo real, `LIFECYCLE` é prosa.

### 5. Qual impacto no Aggregate Design?

`ORGANIZATION_AGGREGATE_DESIGN.md § 5` (Estado Interno) — o campo `status` passa a ter tipo definido: `"active" | "suspended" | "trial" | "blocked" | "archived"` (5 valores, convenção minúscula já usada em `UserStatus` do Identity Domain). `§ 10` (Estados e Transições) — a tabela de transições completas entre esses 5 valores **continua não definida** (não é o que esta decisão resolve) — permanece pendência para uma futura missão de Freeze.

### 6. Exige ADR?

**Sim, recomendado** — resolve uma contradição interna entre duas seções de um documento já oficial (`objects/Organization.md`) e define a forma real de um campo que será implementado. Não criado nesta missão (fora do escopo documental) — fica registrado como necessário antes de uma futura missão de Freeze/implementação.

---

## DEC-ORG-002 — Organization vs. Workspace

### 1. Qual problema existe?

`Workspace` é Aggregate Root independente ou Entity interna de `Organization`? `BOM.md` só tem uma linha para `Workspace`, sem atributos, relacionamentos ou eventos — insuficiente para decidir sem critério adicional. Identificado em `ORGANIZATION_DOMAIN_DISCOVERY.md § 13`, mantido aberto em `ORGANIZATION_AGGREGATE_DESIGN.md §§ 6, 15`.

### 2. Quais opções foram consideradas?

- **A**: `Workspace` é Aggregate Root próprio, referenciando `organizationId`.
- **B**: `Workspace` é Entity interna de `Organization`, dentro da mesma fronteira transacional.
- **C**: Adiar completamente — não modelar nem como Aggregate nem como Entity até uma Object Specification própria existir.

### 3. Qual decisão foi tomada?

**Opção A**, provisoriamente. `Workspace` é modelado como candidato a Aggregate Root independente, referenciando `Organization` só por `organizationId` — nunca embutido.

### 4. Por que essa decisão?

Argumento de consistência estrutural: [objects/Organization.md § RELACIONAMENTOS](../../../knowledge/core/objects/Organization.md) lista `Workspaces` na **mesma** enumeração que `Pipelines`, `Projects`, `Campaigns`, `CRM`, `Financial` — todos eles, sem exceção, já são Aggregates (ou Bounded Contexts inteiros) de **outros** domínios, relacionados a `Organization` só por referência, nunca embutidos. Tratar `Workspace` de forma diferente dos demais itens da mesma lista, sem nenhuma fonte que justifique a exceção, seria uma escolha arbitrária — inventar uma diferença que nenhum documento sugere. A opção C (adiar) foi descartada porque a ordem de missão pede resolução, não mais adiamento — o critério de consistência estrutural já é suficiente para decidir sem inventar conteúdo de negócio.

### 5. Qual impacto no Aggregate Design?

`ORGANIZATION_AGGREGATE_DESIGN.md § 6` (Entidades Internas Candidatas) — a listagem de `Workspace` como candidato a Entity interna é **superada**: `Workspace` deixa de ser candidato a Entity, passa a candidato a Aggregate Root próprio (ainda não confirmado — falta Object Specification própria, mesmo padrão que `objects/Organization.md` já é para `Organization`). `§ 14` (Limites Transacionais) — o princípio condicional ("se Aggregate próprio, referência por id, nunca embedding") deixa de ser condicional, passa a ser a diretriz vigente para quando `Workspace` for desenhado.

### 6. Exige ADR?

**Não para esta decisão provisória** — mesmo padrão do Identity Domain, onde o desenho estrutural de Aggregates não exigiu ADR para ser proposto (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md` não é um ADR). Uma futura missão de Freeze que confirme `Workspace` como Aggregate Root definitivo também não precisará de ADR para a confirmação inicial — mas qualquer mudança **depois** de congelado exigirá, mesmo padrão já vigente para `User`/`Role`.

---

## DEC-ORG-003 — Subscription Ownership

### 1. Qual problema existe?

`DOMAIN_MODEL.md` lista `Subscription` como objeto do Workspace Domain **e** do Financial Domain — duplicidade já registrada em `UBIQUITOUS_LANGUAGE.md § Nota de Método 3`, nunca resolvida. Identificado em `ORGANIZATION_DOMAIN_DISCOVERY.md §§ 4, 12, 13`.

### 2. Quais opções foram consideradas?

- **A**: Organization/Workspace Domain é dono de `Subscription`.
- **B**: Financial Domain é dono de `Subscription`.
- **C**: Ownership dividido — Organization possui a referência ao plano atual (já embutida como atributo `plan` em `Organization`), Financial possui o ciclo de vida de cobrança (`Payment`, fatura, proração) como objeto(s) separado(s).

### 3. Qual decisão foi tomada?

**Opção A** (com a distinção já latente da opção C reconhecida, não modelada). `Subscription` pertence ao Organization/Workspace Domain — representa o vínculo entre uma `Organization` e um plano pago. A menção em Financial Domain (`DOMAIN_MODEL.md`) é tratada como a entrada duplicada, resolvida pela mesma regra já aplicada em `UBIQUITOUS_LANGUAGE.md § Nota de Método 3`: "cada termo aparece uma vez, no domínio mais específico".

### 4. Por que essa decisão?

A própria definição já oficial em [UBIQUITOUS_LANGUAGE.md § Domínio: Workspace](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md) já traça essa distinção sem que esta decisão precise inventá-la: "`Subscription`... Para o vínculo de uma Organization a um plano pago — **Não usar para o pagamento individual (ver `Payment`, domínio Financial)**". A própria fonte já separa "vínculo a um plano" (Workspace) de "pagamento individual" (`Payment`, Financial) — esta decisão só formaliza uma distinção que o dicionário oficial já registrava, sem resolver explicitamente qual domínio "possui" `Subscription` em si. `Organization.md § ATRIBUTOS` reforça isso: `plan`, `billing_status`, `trial_end` já são campos diretos de `Organization`, não de um objeto `Payment`/Financial.

### 5. Qual impacto no Aggregate Design?

Nenhuma mudança na estrutura já proposta em `ORGANIZATION_AGGREGATE_DESIGN.md § 5` — `plan`/`billingStatus`/`trialEnd` continuam candidatos a campos de `Organization`. Esta decisão resolve **onde** `Subscription` deveria ser modelada no futuro (Organization/Workspace Domain), não **como** — a natureza de `Subscription` (Aggregate próprio vs. Value Object embutido) continua uma pergunta separada, não respondida aqui.

### 6. Exige ADR?

**Sim, recomendado** — resolve uma sobreposição registrada entre dois domínios distintos (mesma categoria de decisão do [ADR-0009](../../../adr/ADR-0009-engineering-entry-point-authority.md), que resolveu sobreposição entre documentos). Como o Financial Domain ainda não tem sua própria Discovery, o ADR fica mais bem posicionado quando essa missão futura existir e puder confirmar a ausência de objeção do lado Financial — não criado agora.

---

## DEC-ORG-004 — Team Boundary

### 1. Qual problema existe?

`Team` é Aggregate Root próprio, Entity interna de `Organization`, ou Entity interna de `Workspace`? Mesma limitação documental de `Workspace` — `BOM.md`: "Agrupamento de usuários", sem mais detalhe. Identificado em `ORGANIZATION_DOMAIN_DISCOVERY.md § 13`, mantido aberto em `ORGANIZATION_AGGREGATE_DESIGN.md §§ 6, 15`.

### 2. Quais opções foram consideradas?

- **A**: `Team` é Aggregate Root próprio, referenciando `organizationId`.
- **B**: `Team` é Entity interna de `Organization`.
- **C**: `Team` é Entity interna de `Workspace` (se `Workspace` for confirmado como Aggregate, `Team` viveria dentro dele, não diretamente de `Organization`).

### 3. Qual decisão foi tomada?

**Opção A**, provisoriamente — mesmo raciocínio e mesmo nível de confiança de `DEC-ORG-002`. `Team` é modelado como candidato a Aggregate Root independente, referenciando `organizationId`.

### 4. Por que essa decisão?

Mesmo argumento de consistência estrutural de `DEC-ORG-002`: `Teams` está na mesma lista de `§ RELACIONAMENTOS` que `Workspaces`, `Pipelines`, `Projects` — tratado de forma diferente dos demais sem fonte que justifique seria arbitrário. A opção C foi descartada por depender de `Workspace` já estar confirmado como Aggregate com uma relação de posse sobre `Team` — nenhuma fonte declara essa hierarquia (`UBIQUITOUS_LANGUAGE.md` usa "dentro de uma Organization**/**Workspace", alternância que não define posse exclusiva de um sobre o outro). Decidir C exigiria inventar uma hierarquia não documentada — rejeitada por esse motivo, não por ser tecnicamente implausível.

### 5. Qual impacto no Aggregate Design?

Mesmo impacto de `DEC-ORG-002`, aplicado a `Team`: `§ 6` de `ORGANIZATION_AGGREGATE_DESIGN.md` é superado — `Team` deixa de ser candidato a Entity interna, passa a candidato a Aggregate Root próprio, ainda sem Object Specification própria.

### 6. Exige ADR?

**Não para esta decisão provisória** — mesma resposta e mesmo motivo de `DEC-ORG-002`.

---

## DEC-ORG-005 — Multi-Tenancy Boundary

### 1. Qual problema existe?

RN001-RN004 (`objects/Organization.md`) estabelecem que toda informação pertence a uma Organization e que nenhuma consulta pode cruzar tenants — mas `ORGANIZATION_AGGREGATE_DESIGN.md §§ 4, 11` já concluiu que o Aggregate `Organization` não pode ser o responsável por **impor** essa regra sozinho. Falta confirmar formalmente quem é responsável, e se essa responsabilidade é exclusiva do Organization Domain ou vale para toda a plataforma.

### 2. Quais opções foram consideradas?

- **A**: Cada domínio implementa seu próprio isolamento de forma independente (descentralizado), Organization Domain só define a regra.
- **B**: Isolamento centralizado numa camada de Infrastructure compartilhada (Repository base + RLS), usada por todo domínio — já é o padrão vigente, não específico deste domínio.
- **C**: O próprio Aggregate `Organization` valida acesso cross-tenant em runtime (já descartada em `ORGANIZATION_AGGREGATE_DESIGN.md § 4`).

### 3. Qual decisão foi tomada?

**Opção B, já vigente** — não uma decisão nova, uma **confirmação formal** de uma regra que já existe platform-wide. [AGGREGATE_IMPLEMENTATION_STANDARD.md § 7](../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) já estabelece, para **todo** Aggregate de **todo** domínio: "A responsabilidade de nunca vazar dado entre Organizations é em camadas: RLS no banco... como última barreira, mas a Application Layer e o Repository já devem escopar toda consulta por `organizationId`". O Organization Domain não centraliza essa responsabilidade — ele só é a **origem** do campo `organizationId` que todo outro Aggregate carrega (RN001), e `objects/Organization.md § RLS` já aponta a direção técnica (`organization_id = auth.organization_id`) para quando a Infrastructure Layer for implementada.

### 4. Por que essa decisão?

Porque já é a decisão vigente — resolvê-la de outra forma (opção A, por exemplo) contradiria `ENS-0001 § 7`, já congelado e aplicável a toda a plataforma, não só a este domínio. Reconhecer isso evita reinventar uma regra que já existe, e evita o risco já registrado em `ORGANIZATION_DOMAIN_DISCOVERY.md § 12` ("Organization Domain ser tratado como dono de uma regra que, na prática, todo domínio precisa implementar por conta própria").

### 5. Qual impacto no Aggregate Design?

Nenhuma mudança — `ORGANIZATION_AGGREGATE_DESIGN.md §§ 4, 11` já estavam corretos ao não atribuir essa responsabilidade ao Aggregate `Organization`. Esta decisão apenas torna explícito, com fonte formal (`ENS-0001 § 7`), o que antes era só uma observação dentro de uma tabela.

### 6. Exige ADR?

**Não** — confirma uma decisão platform-wide já vigente desde `ENS-0001`, não cria nenhuma nova.

---

## Resumo das 5 Decisões

| ID | Decisão | Exige ADR |
|---|---|---|
| DEC-ORG-001 | `status` = 5 valores de `§ STATUS`; `§ LIFECYCLE` é narrativa, `Deleted` = `deleted_at` | Sim, recomendado |
| DEC-ORG-002 | `Workspace` = candidato a Aggregate Root próprio (provisório) | Não agora; sim se alterado após Freeze |
| DEC-ORG-003 | `Subscription` pertence ao Organization/Workspace Domain | Sim, recomendado |
| DEC-ORG-004 | `Team` = candidato a Aggregate Root próprio (provisório) | Não agora; sim se alterado após Freeze |
| DEC-ORG-005 | Multi-tenancy enforcement é Infrastructure/Application, já vigente (`ENS-0001 § 7`) | Não |

---

## Relação com Outros Módulos

- [ORGANIZATION_DOMAIN_DISCOVERY.md](ORGANIZATION_DOMAIN_DISCOVERY.md) (ENG-0003.1), [ORGANIZATION_DOMAIN_MODEL.md](ORGANIZATION_DOMAIN_MODEL.md) (ENG-0003.2), [ORGANIZATION_AGGREGATE_DESIGN.md](ORGANIZATION_AGGREGATE_DESIGN.md) (ENG-0003.3) — documentos parcialmente superados por estas 5 decisões, não reescritos
- [knowledge/core/objects/Organization.md](../../../knowledge/core/objects/Organization.md), [knowledge/core/DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md), [knowledge/core/UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md), [knowledge/core/BOM.md](../../../knowledge/core/BOM.md) — fontes usadas em cada decisão
- [knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — fonte de DEC-ORG-005
- [services/kernel/identity/IDENTITY_DOMAIN_CLOSURE.md](../identity/IDENTITY_DOMAIN_CLOSURE.md) — precedente e contrato de fronteira já fechado, consultado para consistência de método

## Status

🟢 5 decisões resolvidas (Missão ENG-0003.4). Nenhuma implementação de código. Aguardando aprovação formal do CTO antes de `ENG-0003.5`.
