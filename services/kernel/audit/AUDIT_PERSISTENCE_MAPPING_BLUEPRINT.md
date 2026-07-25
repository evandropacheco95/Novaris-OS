# Audit — Persistence Mapping Blueprint

Versão: 1.0.0

Status: 🟢 Oficial — contrato de persistência, sem tecnologia definida, sem implementação

Missão: ENG-0005.9 (Audit Persistence Mapping Blueprint) — EPIC-005

Escopo: definir, para o Aggregate `AuditEntry` já implementado ([audit-entry.ts](src/domain/aggregates/audit-entry/audit-entry.ts), ENG-0005.7) e já congelado ([AUDIT_AGGREGATE_DESIGN_FREEZE.md](AUDIT_AGGREGATE_DESIGN_FREEZE.md), ENG-0005.5), o contrato de **como** ele será persistido — nunca **com o quê**. Nenhuma tecnologia, banco, tabela, ORM, Mapper, Migration, código ou Repository real foi criado. Padrão estrutural seguido de [ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md](../organizations/ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md) (ENG-0003.10.5) — só a forma, não o conteúdo. Nenhum documento existente foi alterado.

---

## 1. Objetivo do Mapping

Definir o contrato de persistência de `AuditEntry` — o mapeamento entre seu estado em memória (`AuditEntryProps`, `audit-entry.ts`) e uma futura camada de persistência — sem escolher banco, ORM ou tecnologia. Vinculante para toda implementação futura de Mapper, Repository concreto e Migrations do Audit Domain.

## 2. Aggregate → Persistência

`AuditEntry` é a única unidade persistida do Audit Domain — único Aggregate Root já implementado (`ENG-0005.7`) e congelado (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 1`). **Diferença estrutural em relação a `Organization`**: `AuditEntry` é **write-once** — nunca atualizado após persistido, consequência direta de sua imutabilidade (`AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 7-8`). Nenhuma outra unidade (`AuditTrail`) é persistida separadamente — é sempre resultado de consulta sobre `AuditEntry` (`AUDIT_REPOSITORY_CONTRACT.md § 7`).

## 3. Campos Obrigatórios

| Campo | Tipo de domínio | Tipo esperado em persistência | Observações |
|---|---|---|---|
| `id` | `UniqueEntityId` | string (UUID) | Chave primária |
| `actorId` | `UniqueEntityId` | string (UUID) | Referência — nunca embutido (§ 8) |
| `organizationId` | `UniqueEntityId` | string (UUID) | Referência — mesma razão de multi-tenancy já generalizada (ENS-0001 § 7) |
| `targetId` | `UniqueEntityId` | string (UUID) | Referência — nunca embutido (§ 7) |
| `targetType` | `string` | string | Nome do tipo/domínio de origem do `Target` |
| `action` | `string` | string | Validado como não-vazio em `create()` |
| `occurredAt` | `Date` | timestamp | — |
| `origin` | `string` | string | Validado como não-vazio em `create()` |

Nenhum tipo de banco (`Prisma.String`, `varchar`, etc.) aparece acima — só forma e obrigatoriedade.

## 4. Campos Opcionais

| Campo | Tipo de domínio | Tipo esperado em persistência | Observações |
|---|---|---|---|
| `changeSet` | `Record<string, unknown> \| undefined` | JSON, nulo permitido | Forma interna livre, não validada (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 7`) |

## 5. Campos Derivados

**Nenhum existe hoje.** Todo getter de `audit-entry.ts` reflete exatamente 1:1 um campo de `AuditEntryProps` (`actorId`, `organizationId`, `targetId`, `targetType`, `action`, `occurredAt`, `origin`, `changeSet`) — nenhum valor computado ou inferido. `AuditTrail` (a sequência de `AuditEntry` relativa a um `Target`) é um **conceito de consulta** (`AUDIT_UBIQUITOUS_LANGUAGE.md § 3`), não um campo derivado de uma instância individual de `AuditEntry` — não é persistido nem calculado por instância, é resultado de uma consulta sobre múltiplas instâncias.

## 6. Identidade do Aggregate

`id` (`UniqueEntityId`) — persistido como string (UUID v4, gerado via `node:crypto` quando não fornecido, ENG-0001.2), mesma estratégia já usada por `User`/`Role`/`Organization`. Chave primária.

## 7. Representação de `Target`

`targetId` + `targetType` — par de campos simples, sem Value Object real (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 13`: forma real ainda bloqueada — VO validado vs. par simples). Persistido, hoje, como dois campos primitivos (string UUID + string). Estratégia de índice (simples vs. composto) é decisão de tecnologia, fora de escopo (`AUDIT_REPOSITORY_CONTRACT.md § 8`).

## 8. Representação de `Actor`

`actorId` — referência simples (string UUID), sem Value Object. O escopo de `Actor` (se suporta atores não-humanos, `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 14`) permanece bloqueado — a representação em persistência é a mesma (uma referência por id) independentemente da resposta a essa pergunta.

## 9. Representação de `changeSet`

Campo único, tipo JSON, forma interna livre — mesma estratégia de persistência já aceita para `OrganizationMetadata`/`UserMetadata` (campo JSON não estruturado), **mas não é o mesmo conceito**: `AuditEntry` não tem nenhum campo `metadata` (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 15`, ausência confirmada) — `changeSet` é um campo distinto, já congelado por si só (§ 4), não uma reintrodução de `HasMetadata<T>`.

## 10. Regras de Imutabilidade

Consequência direta de `AuditEntry` nunca ser atualizado (`AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 7-8`): a camada de persistência nunca precisa de uma operação de atualização para este Aggregate — apenas escrita única (write-once) e leitura. A tensão sobre se uma operação de remoção (`delete`) é sequer apropriada para um registro imutável (`BOM.md § 8`) permanece **não resolvida** — já registrada em `AUDIT_REPOSITORY_CONTRACT.md §§ 6, 8`, reafirmada aqui, não decidida.

## 11. Reconstituição Futura

Toda reconstrução de `AuditEntry` a partir de dados persistidos deve usar exclusivamente `AuditEntry.reconstitute(props, id)` — já implementado (`ENG-0005.7`), sem validação, sem Domain Events (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`), mesmo padrão já usado por `Organization`/`User`/`Role`. Nenhuma diferença especial é introduzida pela imutabilidade de `AuditEntry` — `reconstitute()` já era, por padrão, livre de validação para todo Aggregate.

## 12. Dados Proibidos

- Qualquer tecnologia de banco, ORM, Migration ou Schema real (§ 2 do escopo desta missão).
- Qualquer campo além dos já congelados em §§ 3-4 — nenhum campo novo pode ser persistido sem nova decisão/ADR.
- Um campo `metadata` próprio de `AuditEntry` — confirmado ausente (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 15`).
- Uma tabela/entidade `AuditTrail` própria — é sempre resultado de consulta, nunca uma unidade persistida separada (§ 2, § 5).
- Qualquer Domain Event de `AuditEntry` persistido como parte deste mapeamento — `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 11` não confirma que `AuditEntry` emite nenhum; não presumido aqui.

## 13. Decisões Ainda Bloqueadas

- Forma real de `Target`/`Actor` (Value Object vs. par simples de `id`/tipo) — §§ 7-8.
- Se `AuditEntry` emite algum Domain Event próprio — afetaria a necessidade de um padrão de outbox na Infrastructure Layer; não decidido (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 11`).
- Necessidade real da operação de remoção (`delete`) genérica — § 10.
- Índices reais (candidatos: por `Target`, confirmado necessário na aplicação; por `Actor`/período/`Organization`, especulativos) — nenhum confirmado tecnicamente.
- Tensão entre imutabilidade e uma futura política de retenção/expurgo por compliance (LGPD/GDPR) — `AUDIT_EPIC_PLANNING.md § 7`, "Alto", não resolvida.
- Mecanismo real de enriquecimento (`DomainEvent` → dados prontos para `create()`) — a ADR já recomendada (`AUDIT_DOMAIN_DECISIONS.md § 5`) ainda não criada; não bloqueia este mapeamento em si, mas bloqueia qualquer fluxo real de dados chegando à persistência.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Rastreabilidade**: toda seção cita a decisão exata de `AUDIT_AGGREGATE_DESIGN_FREEZE.md`, `AUDIT_TECHNICAL_BLUEPRINT.md`, `AUDIT_REPOSITORY_CONTRACT.md` ou `AUDIT_DOMAIN_DECISIONS.md`.
- **Comparação com o Freeze**: nenhum campo de §§ 3-4 diverge de `AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 4-6`; nenhum item de § 13 contradiz `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 16` — mesma lista de bloqueios, sem nenhum resolvido silenciosamente.

## DMV

1. Alguma Entity foi criada? Não. 2. Algum Aggregate foi alterado? Não — `audit-entry.ts` intocado, apenas lido e mapeado. 3. Algum Value Object foi criado? Não. 4. Alguma regra nova foi criada? Não — todo campo já existe no código real (`ENG-0005.7`). 5. Alguma decisão do Freeze foi modificada? Não. 6. Há necessidade de ADR? Não para este documento; a ADR já recomendada (enriquecimento, `AUDIT_DOMAIN_DECISIONS.md § 5`) permanece registrada, não criada aqui.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhuma tecnologia/banco/tabela/ORM/Mapper/Migration/Repository criado | ✅ |
| Todo campo rastreável ao código real (`audit-entry.ts`) e ao Freeze | ✅ |
| Itens não decididos explicitamente listados (§ 13), não presumidos | ✅ |
| Distinção `changeSet` × `metadata` explicitada, evitando colisão já registrada (`AUDIT_UBIQUITOUS_LANGUAGE.md §§ 5-6`) | ✅ |
| Nenhum documento existente alterado | ✅ |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md`) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **Os campos de §§ 3-4 correspondem exatamente ao código real, ou a uma versão hipotética?** Ao código real — `audit-entry.ts` (`ENG-0005.7`) foi conferido diretamente, nenhum campo inventado ou omitido.
2. **A diferença entre `changeSet` e `metadata` foi tratada com clareza suficiente para não reabrir a ambiguidade já registrada?** Sim — § 9 é explícito: mesma estratégia de persistência (JSON), conceitos distintos, `AuditEntry` não tem `metadata`.
3. **Algum item de bloqueio do Freeze foi resolvido silenciosamente aqui?** Não — todos os itens de `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 16` relevantes à persistência reaparecem em § 13, sem nenhuma resolução.
4. **A "write-once" característica de `AuditEntry` foi tratada como uma simplificação do mapeamento ou obscurecida?** Tratada explicitamente (§§ 2, 10) como a diferença estrutural mais importante em relação a `Organization`.

## Relatório Final

**Arquivos criados**: `services/kernel/audit/AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md`.

**Arquivos alterados**: nenhum.

**Validações**: Link Checker (ver abaixo), rastreabilidade, comparação com o Freeze — nenhuma divergência.

**Conclusão**: contrato de persistência de `AuditEntry` definido — 8 campos obrigatórios, 1 opcional, zero campos derivados, identidade e representação de `Target`/`Actor`/`changeSet` mapeadas, regras de imutabilidade (write-once) explicitadas, 6 itens ainda bloqueados (§ 13), nenhum resolvido.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
