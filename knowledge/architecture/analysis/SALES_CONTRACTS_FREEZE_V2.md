# Sales — Contracts Freeze V2

Versão: 2.0.0

Status: 🟢 Contracts Layer formalmente congelada (baseline V2)

Missão: ENG-0118 (Sales Contracts Freeze V2)

**Verify Before Reimplementing**: busca executada por "SALES_CONTRACTS_FREEZE_V2", "Contracts Freeze V2", "Contracts Layer Freeze", "SALES_CONTRACTS_FREEZE", "Freeze V2" em todo o repositório. Resultado: `SALES_CONTRACTS_FREEZE.md` (V1, `ENG-0087`, escopo parcial — apenas `CreateOpportunity`) e uma única menção de referência futura em `SALES_CONTRACTS_ARCHITECTURE_GATE_V2.md` (linha 122, "candidato a superação por um futuro Freeze V2 (`ENG-0118`)") — uma citação antecipando exatamente esta missão, não um documento equivalente já existente. Nenhum `SALES_CONTRACTS_FREEZE_V2.md` pré-existente. Nenhum conflito — prossegue-se normalmente.

---

## 1. Objetivo

Este documento oficializa o congelamento arquitetural completo da Contracts Layer do Sales Domain — os 6 casos de uso implementados entre `ENG-0078` e `ENG-0113`, auditados por `ENG-0114`, realinhados por `ENG-0115`/`ENG-0116`, e aprovados formalmente por `ENG-0117` (`CONTRACTS ARG PASS 15/15, READY FOR FREEZE`). A partir da aprovação deste documento, nenhuma alteração estrutural, de campo, de export ou de dependência pode ocorrer sem a sequência completa de 4 etapas descrita em § 11. Este Freeze substitui, em cobertura, o escopo parcial de `SALES_CONTRACTS_FREEZE.md` (V1, `ENG-0087`, apenas `CreateOpportunity`) — o V1 não é removido nem invalidado, permanece como registro histórico do primeiro congelamento parcial.

## 2. Escopo

Este Freeze cobre integralmente os 6 casos de uso da Contracts Layer:

- `CreateOpportunity`
- `AdvanceOpportunityStage`
- `SubmitProposal`
- `ApproveProposal`
- `MarkOpportunityWon`
- `MarkOpportunityLost`

## 3. Documentos Consolidados (Baseline)

| Documento | Missão |
|---|---|
| `SALES_CONTRACTS_LAYER_ARCHITECTURE.md` | ENG-0078 (corrigida ENG-0085, ENG-0116) |
| `SALES_CONTRACTS_COMPLETION_AUDIT.md` | ENG-0084 (V1, escopo parcial) |
| `SALES_CONTRACTS_COMPLETION_AUDIT_V2.md` | ENG-0114 (escopo completo, 6 casos de uso) |
| `SALES_CONTRACTS_ALIGNMENT_DECISION.md` | ENG-0085 (V1, localização de pasta) |
| `SALES_CONTRACTS_ALIGNMENT_DECISION_V2.md` | ENG-0115 (readonly + checklist Object.freeze()) |
| `SALES_CONTRACTS_ARCHITECTURE_GATE.md` | ENG-0086 (V1, escopo parcial) |
| `SALES_CONTRACTS_ARCHITECTURE_GATE_V2.md` | ENG-0117 (escopo completo, PASS 15/15) |

## 4. Casos de Uso Congelados

| Caso de Uso | Request | Response Specification | Response | Local Barrel | Root Barrel |
|---|---|---|---|---|---|
| CreateOpportunity | FROZEN | FROZEN | FROZEN | FROZEN | FROZEN |
| AdvanceOpportunityStage | FROZEN | FROZEN | FROZEN | FROZEN | FROZEN |
| SubmitProposal | FROZEN | FROZEN | FROZEN | FROZEN | FROZEN |
| ApproveProposal | FROZEN | FROZEN | FROZEN | FROZEN | FROZEN |
| MarkOpportunityWon | FROZEN | FROZEN | FROZEN | FROZEN | FROZEN |
| MarkOpportunityLost | FROZEN | FROZEN | FROZEN | FROZEN | FROZEN |

## 5. API Surface Congelada

Toda API pública da Contracts Layer do Sales Domain encontra-se congelada: nomes (`CreateOpportunityRequest`, `CreateOpportunityResponse`, ... — os 12 tipos correspondentes aos 6 casos de uso), pastas (`contracts/<use-case>/`, kebab-case), exports (`export type` nos 6 barrels locais, `export *` no Root Barrel), os 6 Requests, os 6 Responses, todos os tipos de campo (primitivos `string`, uniões literais espelhando enums de domínio), `readonly` em 100% dos campos (corrigido `ENG-0116`, confirmado `ENG-0117`), o Root Barrel (`contracts/index.ts`, 6 linhas) e os 6 Local Barrels.

## 6. Dependency Freeze

Congelada, sem inversão, sem exceção:

```
Contracts
  ↓
Application
  ↓
Domain
  ↓
Shared Kernel
```

Confirmado por `ENG-0114 § 11`/`ENG-0117 § 2`: zero import em qualquer um dos 18 arquivos de Contracts — nenhuma dependência de `Repository`, `Infrastructure`, `Mapper`, framework externo ou driver de banco.

## 7. Shared Kernel Freeze

Nenhum tipo interno do Shared Kernel poderá atravessar a fronteira pública da Contracts Layer — inclui `Result`, `Option`, `UniqueEntityId`, `DomainError`, hierarquia de `Errors`, e qualquer tipo de Infrastructure. Confirmado por busca direta (`ENG-0114 § 13`, `ENG-0117 § 2`): zero ocorrência em qualquer um dos 18 arquivos.

## 8. DTO Freeze

Congelados: todo artefato é `interface` TypeScript pura; todo campo `readonly`; zero lógica; zero métodos; zero decorators; zero validações; zero imports. Confirmado por leitura direta dos 18 arquivos (`ENG-0117 §§ 1-2`).

## 9. Barrel Freeze

Congelados: os 6 Local Barrels e o Root Barrel. Padrão: `export type` (barrels locais), `export *` apontando exclusivamente para barrels locais (Root Barrel, nunca para arquivo interno de outro caso de uso), extensão `.js` explícita em toda importação relativa (`moduleResolution: NodeNext`).

## 10. Naming Freeze

Congelados: `<use-case>.request.ts`, `<use-case>.response.ts`, `index.ts`; sufixos `Request`/`Response`/`Specification` (documento correspondente nomeado `<USE_CASE>_RESPONSE_SPECIFICATION.md`); estrutura de pastas `contracts/<use-case>/` (kebab-case, sem `api/` intermediário, decisão `ENG-0085`).

## 11. Modification Policy

Qualquer alteração futura a qualquer artefato listado em §§ 4-10 exige, obrigatoriamente e em conjunto, todas as 5 etapas a seguir — nenhuma pode ser pulada:

1. Nova ADR
2. Nova Ordem de Missão explícita
3. Nova Auditoria de conformidade
4. Novo Architecture Review Gate
5. Novo Freeze

Este Freeze não impede a expansão futura da Contracts Layer para novos casos de uso do Sales Domain (caso o Domain/Application Layer venham a suportar novos comportamentos) — impede apenas que essa expansão, ou qualquer alteração ao que já existe, ocorra sem a sequência completa acima, mesmo princípio já registrado em `SALES_CONTRACTS_FREEZE.md § 1` (V1) e em `SALES_APPLICATION_FREEZE.md § 9`.

## 12. Final Classification

## SALES CONTRACTS
## ARCHITECTURALLY FROZEN
## BASELINE V2

## 13. Status

A Contracts Layer do Sales Domain encontra-se **concluída** para os 6 casos de uso atualmente suportados pela Application Layer. Todos os 6 casos de uso estão congelados (§ 4). A camada está pronta para servir de baseline oficial para as próximas fases do Sales Domain (Infrastructure real, API Layer/Controllers, ou expansão de novos casos de uso).

---

## Domain Model Validation

- Entity criada? **NÃO.**
- Aggregate criado? **NÃO.**
- Value Object criado? **NÃO.**
- Domain Event criado? **NÃO.**
- Nova regra de negócio criada? **NÃO.**
- Repository alterado? **NÃO.**
- Application alterada? **NÃO.**
- Infrastructure alterada? **NÃO.**

## Relação com Outros Módulos

- [SALES_CONTRACTS_FREEZE.md](SALES_CONTRACTS_FREEZE.md) (ENG-0087, V1) — precedente direto, escopo parcial (1 caso de uso), superado em cobertura por este documento
- [SALES_CONTRACTS_ARCHITECTURE_GATE_V2.md](SALES_CONTRACTS_ARCHITECTURE_GATE_V2.md) (ENG-0117) — Gate que autoriza formalmente este Freeze (`CONTRACTS ARG PASS 15/15, READY FOR FREEZE`)
- [SALES_CONTRACTS_COMPLETION_AUDIT_V2.md](SALES_CONTRACTS_COMPLETION_AUDIT_V2.md) (ENG-0114), [SALES_CONTRACTS_ALIGNMENT_DECISION_V2.md](SALES_CONTRACTS_ALIGNMENT_DECISION_V2.md) (ENG-0115) — cadeia de evidência completa
- [SALES_CONTRACTS_LAYER_ARCHITECTURE.md](SALES_CONTRACTS_LAYER_ARCHITECTURE.md) (ENG-0078, corrigida ENG-0085/ENG-0116) — base normativa integral deste Freeze
- [SALES_APPLICATION_FREEZE.md](SALES_APPLICATION_FREEZE.md) (ENG-0077) — precedente estrutural direto, mesmo formato de 5 etapas de alteração futura
- [services/domains/sales/contracts/](../../../services/domains/sales/contracts/index.ts) — código real, escopo integral deste Freeze

## Status

🟢 Contracts Freeze V2 declarado (Missão ENG-0118). Nenhum código, DTO, Request, Response, Contract, Handler, Aggregate, Entity, Repository, Mapper, Controller, teste ou Blueprint criado/alterado. Estado: **ARCHITECTURALLY FROZEN, BASELINE V2**. Aguardando aprovação formal do CTO.
