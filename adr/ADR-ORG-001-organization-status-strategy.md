# ADR-ORG-001 - Organization Status Strategy

## 1. Problema

[knowledge/core/objects/Organization.md](../knowledge/core/objects/Organization.md) contém duas representações de estado do Aggregate `Organization` que não coincidem entre si: `§ LIFECYCLE` desenha uma cadeia linear de 6 estados (`Created → Pending Configuration → Active → Suspended → Archived → Deleted`); `§ STATUS` lista 5 valores (`ACTIVE`, `SUSPENDED`, `TRIAL`, `BLOCKED`, `ARCHIVED`). Nenhuma fonte anterior a esta ADR reconciliava as duas — a divergência bloqueava `services/kernel/organizations/ORGANIZATION_AGGREGATE_DESIGN.md § 5` (Estado Interno) de definir um tipo real para o campo `status`.

## 2. Contexto

A divergência foi identificada em `ORGANIZATION_AGGREGATE_DESIGN.md § 10` (Missão ENG-0003.3) e resolvida provisoriamente como `DEC-ORG-001` em [services/kernel/organizations/ORGANIZATION_DOMAIN_DECISIONS.md](../services/kernel/organizations/ORGANIZATION_DOMAIN_DECISIONS.md) (Missão ENG-0003.4), que já recomendou explicitamente a formalização via ADR. Esta ADR torna oficial essa decisão, sem reabri-la.

`TRIAL` e `BLOCKED` (presentes só em `§ STATUS`) já têm evidência de suporte em outras partes do mesmo documento: o atributo `trial_end` (`§ ATRIBUTOS`) e o evento `OrganizationBillingFailed` (`§ EVENTOS`, um dos 8 eventos já citados). `Created`, `Pending Configuration` e `Deleted` (presentes só em `§ LIFECYCLE`) não têm essa mesma correspondência — `Deleted`, em particular, coincide com o atributo já existente `deleted_at` (RN005, Soft Delete obrigatório), sugerindo que já é representado por um campo diferente de `status`.

Nenhum documento — `BOM.md`, `DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md` — resolve a divergência; nenhum deles detalha o campo `status` além de citar `Organization.md` como fonte.

## 3. Opções Consideradas

- **A**: `§ STATUS` (5 valores) é canônico; `§ LIFECYCLE` é narrativa/conceitual, não um enum literal.
- **B**: `§ LIFECYCLE` (6 estados) é canônico; `§ STATUS` está incompleto.
- **C**: Unificar as duas listas num superconjunto de 8 valores.
- **D**: `§ STATUS` é o campo `status` persistido; `§ LIFECYCLE` descreve fases amplas que não mapeiam 1:1 para `status` — `Deleted` é representado por outro campo (`deleted_at`), não por um valor de `status`.

## 4. Decisão Adotada

**Opção D.** O campo `status` do Aggregate `Organization` tem exatamente 5 valores possíveis: `"active"`, `"suspended"`, `"trial"`, `"blocked"`, `"archived"` (convenção minúscula, mesmo padrão já usado em `UserStatus` no Identity Domain). `§ LIFECYCLE` de `objects/Organization.md` é tratado como descrição narrativa de fases amplas, não um enum à parte. `Deleted` **não é** um valor de `status` — é representado pelo campo `deleted_at` já existente (RN005). O mapeamento exato de `Created`/`Pending Configuration` para um valor real de `status` (provavelmente `trial`, não confirmado) fica para uma futura missão de Blueprint.

## 5. Decision Drivers

- `TRIAL` conecta-se diretamente ao atributo `trial_end` já citado em `objects/Organization.md`.
- `BLOCKED` conecta-se ao evento `OrganizationBillingFailed`, já um dos 8 eventos citados na mesma fonte.
- `STATUS` é o nome literal já usado para o campo (`status`) em `§ ATRIBUTOS`; `LIFECYCLE` não corresponde a nenhum campo nomeado.
- A opção adotada é a que **menos inventa**: explica os 5 valores de `§ STATUS` usando apenas conteúdo já citado em outro lugar do mesmo documento, sem precisar presumir um sexto ou sétimo valor sem fonte.
- Ausência de `Deleted` na lista de `§ STATUS` é evidência a favor, não contra — reforça que soft delete já é modelado por um campo separado (`deleted_at`), consistente com RN005.

## 6. Consequências

- O campo `status` tem forma definida e vinculante para qualquer Blueprint/Freeze futuro do Organization Domain.
- `Deleted` deixa de ser tratado como estado de `status` em qualquer modelagem futura — sempre representado por `deleted_at`.
- A tabela completa de transições entre os 5 valores continua **não definida** por esta ADR — só a forma do campo foi decidida, não o comportamento de transição.
- Nenhum código foi alterado — esta decisão só se torna efetiva quando uma futura missão de implementação a consumir.

## 7. Alternativas Rejeitadas

- **Opção B** (`§ LIFECYCLE` canônico) — rejeitada porque deixaria `TRIAL` e `BLOCKED` (atributo e evento já citados) sem nenhuma explicação, como se fossem órfãos dentro do próprio documento-fonte.
- **Opção C** (superconjunto de 8 valores) — rejeitada porque nenhuma fonte sustenta a existência simultânea de 8 valores de `status`; seria inventar um novo enum não pedido por nenhum documento, misturando fases narrativas (`Created`) com estados persistidos reais (`ACTIVE`) sem justificativa.

## 8. Impacto no Organization Domain

`ORGANIZATION_AGGREGATE_DESIGN.md § 5` (Estado Interno) — o campo `status` passa a ter tipo definido e vinculante: `"active" | "suspended" | "trial" | "blocked" | "archived"`. Nenhum outro campo ou seção daquele documento é afetado.

## 9. Impacto no Futuro Aggregate Freeze

Uma futura missão de Freeze (análoga a `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`, `ENG-0002.5`) não precisa mais reabrir a pergunta "`§ STATUS` ou `§ LIFECYCLE`?" — pode citar esta ADR diretamente como fonte do tipo `status`. A tabela de transições entre os 5 valores, porém, continua uma decisão em aberto que essa futura missão de Freeze precisará resolver — esta ADR não a antecipa.

## 10. Impacto no Blueprint

Uma futura Technical Blueprint do Organization Domain (análoga a `IDENTITY_TECHNICAL_BLUEPRINT.md`) deve declarar `OrganizationStatus` com exatamente os 5 valores desta ADR, e precisará decidir — como parte própria do Blueprint, não desta ADR — qual valor inicial um `Organization` recém-criado recebe (candidato mais provável: `"trial"`, dado `trial_end` já existir como atributo, mas não confirmado aqui).

## 11. Compatibilidade com Identity Domain

Compatível por convenção de nomenclatura — `UserStatus` (`"created" | "invited" | "active" | "disabled"`, `services/kernel/identity/src/domain/aggregates/user/user.ts`) já usa o mesmo padrão de union type de strings minúsculas em inglês. Nenhuma dependência direta entre `OrganizationStatus` (proposto aqui) e `UserStatus` — domínios distintos, sem acoplamento. Nenhuma alteração ao Identity Domain foi feita ou é necessária.

## 12. Compatibilidade com ENS

Compatível com [AGGREGATE_IMPLEMENTATION_STANDARD.md § 4](../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001): "Toda invariante deve ter fonte documentada... nunca inventada durante a implementação" — esta ADR passa a ser essa fonte documentada para o campo `status`, quando uma futura implementação do Aggregate `Organization` precisar validar transições. Nenhuma alteração a nenhum ENS foi feita.

## 13. Situações Explicitamente NÃO Resolvidas

- Tabela completa de transições válidas entre os 5 valores de `status` (ex.: `suspended → active` é uma transição real, ou o endpoint `activate` de `objects/Organization.md § API` só cobre a ativação inicial?) — `requer decisão`, não resolvida aqui.
- Valor inicial de `status` na criação de uma `Organization` — não confirmado.
- Mapeamento exato de `Created`/`Pending Configuration` (fases de `§ LIFECYCLE`) para um valor real de `status` — não confirmado.
- Reconciliação entre os 5 valores desta ADR e os 6 estados do diagrama `§ LIFECYCLE` em termos de fluxo de UI/produto (fora do escopo arquitetural desta ADR).

## 14. Plano de Migração

Nenhum. Nenhum dado real existe ainda para nenhuma `Organization` — nenhuma implementação de código, banco ou Infrastructure foi criada em nenhuma missão do EPIC-003 até esta ADR.

## 15. Status

Aceito

---

## Responsável

Arquiteto-Chefe do NOVARIS Kernel, via Ordem de Missão `ADR-ORG-001` ("Organization Status Strategy"), formalizando `DEC-ORG-001` de `ORGANIZATION_DOMAIN_DECISIONS.md` (Missão ENG-0003.4).

## Data

2026-07-15

## Impactos

- `services/kernel/organizations/ORGANIZATION_AGGREGATE_DESIGN.md § 5` — fonte formal do tipo `status`, documento não alterado (ver §§ 8-10 acima).
- `adr/README.md` — nova linha no índice de ADRs.

## Nota sobre Nomenclatura

Esta ADR usa o padrão `ADR-ORG-NNN` (escopado ao Organization Domain), diferente da numeração sequencial `ADR-NNNN` já em uso desde `ADR-0001` (`adr/README.md § Convenção de Nomenclatura`). Este é o primeiro uso desse padrão alternativo — registrado aqui como fato, não reconciliado com a convenção `ADR-NNNN` já vigente. A convenção formal para ADRs escopadas a um domínio específico (`ADR-<DOMÍNIO>-NNN` vs. continuar a sequência única `ADR-NNNN`) permanece uma decisão de governança em aberto, fora do escopo desta ADR resolver.
