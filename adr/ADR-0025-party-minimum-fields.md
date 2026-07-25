# ADR-0025 — Party: Campos Mínimos de Conteúdo (`name`, `document`)

## Problema

`RELATIONSHIP_AGGREGATE_DESIGN.md` (`ENG-0119`) concluiu o desenho tático de `Party` como Aggregate Root único do Customer Domain, mas registrou explicitamente que nenhum campo de conteúdo (nome, documento) está catalogado em `BOM.md` — apenas o conceito ("Representa uma entidade de negócio... Especializações: Person, Organization"). Implementar `Party` como está documentado hoje produziria um Aggregate sem nenhum campo exibível (só `id`/`organizationId`/`partyType`/timestamps) — tecnicamente correto, mas inutilizável em qualquer tela real (nenhuma lista de clientes pode mostrar apenas UUIDs). Esta ADR resolve o bloqueio mínimo necessário para a implementação (`ENG-0125`, Customer Domain), sem inventar o catálogo completo de campos de Party/Person/External Organization.

## Contexto

`BOM.md § Party/Person/External Organization` não lista nenhum campo — confirmado por leitura direta, zero ocorrências de "Campos"/"Atributos" nessas 3 entradas (diferente de `Organization`, que já tem `slug`/`name`/`legalName`/`document`/`address` congelados em `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`). `PROJECT_RULES.md § Regras de Banco de Dados` exige catálogo em `BOM.md` (ou extensão por ADR) antes de qualquer campo de entidade ser implementado — esta ADR é essa extensão.

## Decision Drivers

- Um Aggregate sem nenhum campo de identificação humana não serve ao propósito documentado do próprio `Party` ("entidade de negócio... que pode participar de processos") — nenhuma tela, relatório ou busca poderia referenciar um `Party` por algo além de um UUID.
- `Organization` (Kernel) já estabeleceu o precedente de campos mínimos obrigatórios (`name`, `legalName`, `document`) para um conceito estruturalmente análogo (entidade de negócio com nome e documento) — reaproveitar esse precedente evita inventar uma convenção nova.
- `Contact`/`Address`/`Phone`/`Email`/`Social Profile` (§ 6 de `RELATIONSHIP_AGGREGATE_DESIGN.md`) permanecem **fora do escopo** desta ADR — são objetos distintos, ainda bloqueados por ausência total em `BOM.md`, e não são "obviamente necessários" da mesma forma que um nome (um `Party` sem telefone/e-mail ainda é minimamente utilizável; um `Party` sem nome não é).

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Campos mínimos: `name` + `document`** | Adiciona só o que é indispensável para exibir/identificar um `Party` em qualquer tela | Escolhida — menor extensão possível que resolve o bloqueio real |
| B. Catálogo completo (`Contact`, `Address`, `Phone`, `Email`, `Social Profile` também) | Resolveria todos os "Needs Evidence" de uma vez | Rejeitada — nenhum desses 5 objetos tem qualquer campo ou forma sugerida em nenhuma fonte; decidiriam uma estrutura de dados inteira sem evidência nenhuma, ao contrário de `name`/`document`, que têm precedente direto em `Organization` |
| C. Não estender agora, implementar `Party` sem nome | Mantém disciplina "zero campo inventado" ao pé da letra | Rejeitada — inviabiliza qualquer uso real do domínio; CTO optou explicitamente por resolver agora (decisão direta, não inferida) |

## Decision

**Opção A.** `Party` ganha 2 campos de conteúdo, ambos mínimos:

- **`name: string`** (obrigatório) — nome da pessoa física ou razão social da organização externa, dependendo de `partyType`. Um único campo, não dois (`personName`/`organizationName`) — mesmo princípio já usado para `partyType` como discriminador único (`RELATIONSHIP_AGGREGATE_DESIGN.md § 4`).
- **`document: string`** (opcional) — CPF (pessoa) ou CNPJ (organização externa), sem validação de formato específica por tipo nesta ADR (fica para o Technical Blueprint/implementação, mesmo padrão de `Organization.document`, que também não valida formato). Opcional porque nem toda captura inicial de um `Party` necessariamente já tem o documento (ex.: um lead ainda não qualificado) — diferente de `Organization.document`, que é obrigatório porque toda Organization (tenant) da NOVARIS já é uma empresa formalmente constituída no momento do cadastro.

Nenhum outro campo (`email`, `phone`, `address`, dados de contato) é adicionado — permanecem bloqueados, como já registrado em `RELATIONSHIP_AGGREGATE_DESIGN.md § 6`, sem alteração desta ADR.

## Rejected Alternatives

Ver tabela acima (Opções B e C).

## Consequences

- `BOM.md § Party` recebe uma nota de extensão não-destrutiva, citando esta ADR, com os 2 campos.
- `RELATIONSHIP_AGGREGATE_DESIGN.md § 4` (tabela de campos de `Party`) pode ser implementada com `name`/`document` incluídos — as demais linhas (`Contact` etc., § 6) permanecem bloqueadas.
- Nenhuma mudança em `Organization`, `Sales` ou qualquer Aggregate já congelado.
- `Person`/`External Organization` continuam como especializações internas (discriminadas por `partyType`), nunca subclasses — `name`/`document` são campos comuns a ambas, não duplicados por especialização.

## Responsável

CTO / Arquiteto Chefe, decisão direta em resposta a bloqueio reportado no início da implementação do Customer Domain (`ENG-0125`).

## Data

2026-07-23

## Impactos

- `knowledge/core/BOM.md § Party` — nota de extensão não-destrutiva.
- `adr/README.md` — nova entrada no índice.
- Nenhum outro documento ou código alterado por esta ADR em si (a implementação real é `ENG-0125`).

## Plano de Migração

Nenhum — nenhum código de `Party` existe ainda. Esta ADR desbloqueia a primeira implementação, não migra nada existente.

## Status

Aceito
