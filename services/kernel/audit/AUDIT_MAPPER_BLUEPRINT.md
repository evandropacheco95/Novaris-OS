# Audit — Mapper Blueprint

Versão: 1.0.0

Status: 🟢 Oficial — contrato conceitual do Mapper, sem implementação

Missão: ENG-0005.10 (Audit Mapper Blueprint) — EPIC-005

Escopo: definir o papel, as responsabilidades e o fluxo conceitual do Mapper de `AuditEntry` — o componente que traduziria entre a representação em memória do Aggregate e um registro de persistência, quando essa camada vier a ser implementada. Nenhum Mapper real, classe, interface, código, Repository, Infrastructure, tecnologia ou ADR foi criado. Padrão estrutural seguido de [ORGANIZATION_MAPPER_BLUEPRINT.md](../organizations/ORGANIZATION_MAPPER_BLUEPRINT.md) (ENG-0003.11) — só a forma, não o conteúdo. Nenhum documento existente foi alterado.

---

## 1. Responsabilidade do Mapper

Tradutor puro, sem estado próprio, sem I/O: converte `AuditEntry` (instância em memória) em um registro de persistência abstrato, e um registro de persistência de volta em `AuditEntry`, através de `reconstitute()` (§ 7). Nunca contém regra de negócio — toda validação já vive em `AuditEntry.create()` (`AGGREGATE_IMPLEMENTATION_STANDARD.md §§ 3-4`, já implementado em `ENG-0005.7`).

## 2. Fronteira Mapper × Repository

O **Repository** coordena: chama o Mapper, orquestra a persistência real (ainda não escolhida), implementa o contrato já descrito conceitualmente (`AUDIT_REPOSITORY_CONTRACT.md`) — leitura genérica, escrita única (write-once, § 8), consulta especializada por `Target`. O **Mapper** só traduz — nunca decide, nunca consulta, nunca persiste diretamente. Mesma separação já usada em `ORGANIZATION_MAPPER_BLUEPRINT.md § 15`.

## 3. Fronteira Mapper × Aggregate

`AuditEntry` continua soberano — toda invariante já validada em `create()` (campos obrigatórios não-vazios, `AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 5, 7`) permanece intacta; `reconstitute()` não revalida porque dado já persistido é assumido válido (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`), não porque o Mapper tenha autoridade para relaxar uma invariante. O Mapper **nunca altera um valor durante a tradução** — nunca normaliza `action`, nunca trunca `origin`, nunca reordena `changeSet`.

## 4. Conversão Persistência → Domínio

1. O Repository obtém um registro bruto do mecanismo de persistência (ainda não definido).
2. O Mapper traduz tipos primitivos de volta para tipos de domínio: string → `UniqueEntityId` (para `id`, `actorId`, `organizationId`, `targetId`); string já validada pelo próprio Aggregate → `targetType`/`action`/`origin`; timestamp → `Date` (`occurredAt`); JSON (nulo permitido) → `Record<string, unknown> | undefined` (`changeSet`).
3. O Mapper chama `AuditEntry.reconstitute(props, id)` — nunca o construtor diretamente (§ 7).
4. Nenhuma validação, nenhum Domain Event — `reconstitute()` já implementado (`ENG-0005.7`) não faz nenhum dos dois.

## 5. Conversão Domínio → Persistência

1. O Repository chama o Mapper para converter uma instância de `AuditEntry` já criada.
2. O Mapper lê cada campo exclusivamente via os getters públicos já existentes (`actorId`, `organizationId`, `targetId`, `targetType`, `action`, `occurredAt`, `origin`, `changeSet`) — nunca acessa `props` diretamente (privado ao Aggregate).
3. O Mapper produz um registro plano, com os mesmos campos e a mesma obrigatoriedade/nulidade já definidos em `AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 3-4` — nenhuma transformação além de tipo primitivo.
4. **Diferente de `Organization`**: esta conversão acontece exatamente **uma vez** por instância de `AuditEntry` — nunca há uma segunda chamada de `toPersistence()` sobre a mesma instância, porque não existe operação de atualização (§ 8).

## 6. Tratamento Conceitual de Dados Inválidos

O Mapper **não corrige dados** e **não toma decisão** diante de um registro malformado ou incompleto — mesma disciplina já registrada em `ORGANIZATION_MAPPER_BLUEPRINT.md § 14`. Se um registro de persistência não contiver um campo obrigatório (`AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md § 3`) ou tiver um valor inconsistente, o tratamento dessa falha é responsabilidade do Repository, nunca do Mapper — mecanismo exato **não definido aqui** (mesma lacuna já registrada, não resolvida, em `ORGANIZATION_MAPPER_BLUEPRINT.md § 14` para o precedente de Organization).

## 7. Relação com `reconstitute()`

Toda reconstrução de `AuditEntry` a partir de dados persistidos deve usar **exclusivamente** `AuditEntry.reconstitute(props, id)` — já implementado (`ENG-0005.7`), sem validação, sem Domain Events (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`). O construtor de `AuditEntry` é `private` — tecnicamente inacessível fora da própria classe, portanto já impossível de qualquer forma para o Mapper instanciar diretamente; este documento reforça essa barreira já existente, não introduz uma nova.

## 8. Preservação da Imutabilidade

`AuditEntry` é write-once (`AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 2, 10`) — isto simplifica o Mapper em relação ao de `Organization`: `toPersistence()` nunca precisa reconciliar um estado anterior com um novo (não existe "diff" entre duas versões da mesma instância, porque só existe uma versão, para sempre). O Mapper nunca implementa nem participa de qualquer operação de atualização — se ela vier a existir tecnicamente (§ 11, ainda bloqueado), não é papel do Mapper decidir isso.

## 9. Campos Mapeados

Reafirmação direta de `AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 3-4` — nenhum campo novo introduzido: `id`, `actorId`, `organizationId`, `targetId`, `targetType`, `action`, `occurredAt`, `origin` (obrigatórios); `changeSet` (opcional). O Mapper não define nenhum campo — só traduz os já congelados.

## 10. Dados Proibidos

- Qualquer tecnologia de persistência (Prisma, SQL, ORM) na assinatura pública do Mapper.
- Qualquer campo além dos já congelados em § 9.
- Validação de regra de negócio (§ 3) — exclusiva do Aggregate.
- Decisão sobre o que deve ser auditado — exclusiva do domínio de origem (`AUDIT_BOUNDED_CONTEXT.md §§ 2-3`).
- Enriquecimento de dados (`actorId`/`organizationId`/`changeSet` ausentes) — exclusivo da Application Layer do domínio de origem (`AUDIT_DOMAIN_DECISIONS.md § 5`); o Mapper nunca completa um dado ausente.
- Importação de tipos concretos de outro domínio — o Mapper só conhece `AuditEntry` e tipos primitivos.
- Disparo de Domain Event — `AuditEntry` não confirma nenhum (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 11`); o Mapper não presume nem inventa um.

## 11. Decisões Bloqueadas

- Forma real de `Target`/`Actor` (Value Object vs. par simples) — afeta a assinatura exata da tradução (`AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 13-14`).
- Se `AuditEntry` emite algum Domain Event — afeta se o Mapper (ou a Infrastructure ao redor dele) precisa lidar com um padrão de publicação (ex.: outbox) no momento da escrita.
- Necessidade real de uma operação de remoção (`delete`) — se confirmada, o Mapper precisaria de uma direção adicional (`toPersistence` para remoção); hoje não definida (`AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md § 10`).
- Mecanismo exato de tratamento de dado inválido (§ 6) — mesma lacuna do precedente de Organization, não resolvida.
- ADR do mecanismo de enriquecimento (`AUDIT_DOMAIN_DECISIONS.md § 5`) — não bloqueia o Mapper em si (que nunca enriquece), mas bloqueia qualquer fluxo real de dados chegando a ele already enriquecidos.

---

## Relação com Outros Módulos

- [AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md](AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md) (ENG-0005.9) — contrato de campos, base direta de §§ 4-5, 9
- [AUDIT_AGGREGATE_DESIGN_FREEZE.md](AUDIT_AGGREGATE_DESIGN_FREEZE.md) (ENG-0005.5) — fonte de §§ 7-8, 11
- [AUDIT_REPOSITORY_CONTRACT.md](AUDIT_REPOSITORY_CONTRACT.md) (ENG-0005.8) — fonte de § 2
- [src/domain/aggregates/audit-entry/audit-entry.ts](src/domain/aggregates/audit-entry/audit-entry.ts) (ENG-0005.7) — implementação real da qual todo getter/campo foi extraído

## Status

🟢 Blueprint do Mapper concluído (Missão ENG-0005.10). Nenhum Mapper, Repository ou tecnologia implementada. Aguardando aprovação do CTO.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Rastreabilidade**: toda seção cita a decisão exata de `AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md`, `AUDIT_AGGREGATE_DESIGN_FREEZE.md`, `AUDIT_TECHNICAL_BLUEPRINT.md` ou `AUDIT_REPOSITORY_CONTRACT.md`.
- **Comparação com Persistence Mapping**: nenhum campo de § 9 diverge de `AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 3-4`; § 10 reproduz exatamente os dados proibidos já lá registrados, sem adição.

## DMV

1. Alguma Entity foi criada? Não. 2. Algum Aggregate foi alterado? Não. 3. Algum Value Object foi criado? Não. 4. Alguma regra nova foi criada? Não. 5. Alguma decisão do Freeze/Persistence Mapping foi modificada? Não. 6. Há necessidade de ADR? Não para este documento; a ADR já recomendada (`AUDIT_DOMAIN_DECISIONS.md § 5`) permanece registrada, não criada aqui.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum Mapper real, classe, interface, código, Repository, Infrastructure ou ADR criado | ✅ |
| Todo campo/fluxo rastreável a decisão já tomada | ✅ |
| Consistente com `AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md`, nenhuma contradição | ✅ |
| Itens não decididos explicitamente listados (§ 11), não presumidos | ✅ |
| Nenhum documento existente alterado | ✅ |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`ORGANIZATION_MAPPER_BLUEPRINT.md`) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **A característica write-once de `AuditEntry` foi refletida de forma real no Mapper, ou apenas mencionada?** Refletida — § 5 (item 4) e § 8 explicam concretamente por que isso simplifica o Mapper (nenhum diff a reconciliar), não apenas repetida como fato isolado.
2. **Algum Mapper real, classe ou interface foi criado, mesmo como pseudocódigo?** Não — toda estrutura é descrita em prosa, sem bloco de código.
3. **A fronteira Mapper × Aggregate reabre alguma invariante já congelada?** Não — reafirma que o Aggregate permanece soberano, sem introduzir nenhuma exceção.
4. **Este documento seria suficiente para orientar uma futura implementação real de Mapper sem reler todo o Epic?** Sim — §§ 4-5 já descrevem o fluxo completo nas duas direções; § 11 já aponta exatamente o que falta decidir antes.

## Relatório Final

**Arquivos criados**: `services/kernel/audit/AUDIT_MAPPER_BLUEPRINT.md`.

**Arquivos alterados**: nenhum.

**Validações**: Link Checker (ver abaixo), rastreabilidade, comparação com `AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md` — nenhuma divergência.

**Conclusão**: Mapper conceitual de `AuditEntry` definido — fluxo nas duas direções, fronteiras com Repository e Aggregate, e a simplificação estrutural trazida pela natureza write-once do Aggregate. 5 itens permanecem bloqueados (§ 11), nenhum resolvido.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
