# Sales — Contracts Alignment Decision V2

Versão: 1.0.0

Status: 🟢 Decisão de alinhamento aprovada

Missão: ENG-0115 (sub-missão 1 de ENG-0115+ENG-0116, Sales Contracts Layer Final Alignment)

**Verify Before Reimplementing**: busca executada por "SALES_CONTRACTS_ALIGNMENT_DECISION_V2", "Alignment Decision V2" em todo o repositório — zero resultados. Busca adicional por "SALES_CONTRACTS_ALIGNMENT_DECISION" (sem sufixo) retornou exatamente 1 arquivo: `SALES_CONTRACTS_ALIGNMENT_DECISION.md` (V1, `ENG-0085`), que resolveu uma divergência estrutural distinta (localização de pasta, `contracts/api/` vs. `contracts/<use-case>/`) — escopo diferente, não uma duplicação. Nenhum conflito, nenhum documento equivalente pré-existente para o escopo desta missão (resolver os 5 achados de `SALES_CONTRACTS_COMPLETION_AUDIT_V2.md`).

---

# Objetivo

Registrar formalmente a decisão arquitetural sobre os 5 achados (`Findings`) reportados por `SALES_CONTRACTS_COMPLETION_AUDIT_V2.md` (`ENG-0114`), aprovando exatamente quais correções podem ser aplicadas pela sub-missão seguinte (`ENG-0116`) e quais permanecem registradas para tratamento futuro — sem aprovar nenhuma mudança de arquitetura ou de domínio.

# Escopo

Este documento **decide, não implementa**. Nenhum arquivo de código é criado, alterado, movido ou renomeado por esta sub-missão. A aplicação das correções aprovadas é responsabilidade exclusiva de `ENG-0116`, e estritamente limitada ao que este documento aprova.

# Histórico

| Missão | Marco |
|---|---|
| ENG-0078–ENG-0087 | Contracts Layer definida, implementada e congelada para `CreateOpportunity` |
| ENG-0088–ENG-0113 | Contracts Layer expandida para os 5 casos de uso restantes (`AdvanceOpportunityStage`, `SubmitProposal`, `ApproveProposal`, `MarkOpportunityWon`, `MarkOpportunityLost`) |
| ENG-0114 | Auditoria completa dos 6 casos de uso — classificação `CONTRACTS VERIFIED WITH FINDINGS`, 5 achados registrados |
| ENG-0115 (este documento) | Decisão formal sobre quais achados podem ser corrigidos agora |
| ENG-0116 (próxima sub-missão) | Aplicação das correções aqui aprovadas |

# Fonte da Auditoria

Referência única e vinculante: [SALES_CONTRACTS_COMPLETION_AUDIT_V2.md](SALES_CONTRACTS_COMPLETION_AUDIT_V2.md) (`ENG-0114`), § 15 "Architecture Findings" e § 18 "Recommendations". Nenhum achado é reavaliado ou reinterpretado além do que a auditoria já registrou — esta decisão apenas classifica cada achado como corrigível agora ou não.

---

# Findings

## Finding 01

**Descrição**: `CreateOpportunityRequest` (`create-opportunity.request.ts`) e `CreateOpportunityResponse` (`create-opportunity.response.ts`) não usam `readonly` em nenhum campo — os outros 5 pares de Request/Response (`AdvanceOpportunityStage`, `SubmitProposal`, `ApproveProposal`, `MarkOpportunityWon`, `MarkOpportunityLost`) usam `readonly` em 100% dos campos. Diverge de `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 9` (linha 105), que exige explicitamente "campos `readonly`" para todo Request DTO futuro.

**Impacto**: nenhum impacto funcional — `readonly` é uma restrição de tempo de compilação do TypeScript, não altera o formato serializado (JSON) do DTO, não afeta build/lint/testes hoje (ambos os arquivos já compilam e lintam sem erro sem `readonly`). Impacto é exclusivamente de consistência estrutural entre os 6 casos de uso.

**Classificação**: Correção de baixo risco, mecânica, sem ambiguidade — adicionar um modificador de acesso a campos já existentes, sem alterar nome, tipo, ordem ou presença de nenhum campo.

**Decisão**: **APROVADO PARA CORREÇÃO IMEDIATA (ENG-0116, Correção 1 e Correção 2).**

## Finding 02

**Descrição**: o item de checklist "Todo campo `readonly`, DTO imutável (`Object.freeze()`, mesmo padrão dos Commands)" (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 15`, linha 172) é estruturalmente inaplicável — todo DTO real implementado nos 6 casos de uso é uma `interface` pura (nunca uma `class`), portanto não existe instância em tempo de execução sobre a qual `Object.freeze()` possa operar. Isso contradiz a própria § 8 do mesmo documento ("DTO... não possui comportamento... sempre uma interface pura").

**Impacto**: nenhum impacto em código — nenhuma implementação real jamais tentou usar `Object.freeze()` (confirmado pela auditoria, § 12). Impacto é exclusivamente documental: um item de checklist normativo hoje é impossível de cumprir literalmente, criando confusão para missões futuras.

**Classificação**: Correção documental de baixo risco — remover/reformular uma frase de checklist para refletir o padrão real e já estabelecido (interface-only), sem alterar nenhuma outra seção do documento.

**Decisão**: **APROVADO PARA CORREÇÃO IMEDIATA (ENG-0116, Correção 3)** — corrigir exclusivamente o trecho sobre `Object.freeze()`, nenhuma outra seção de `SALES_CONTRACTS_LAYER_ARCHITECTURE.md` é tocada.

## Finding 03

**Descrição**: `SALES_CONTRACTS_FREEZE.md` (`ENG-0087`) e `SALES_CONTRACTS_ARCHITECTURE_GATE.md` (`ENG-0086`) cobrem formalmente apenas `CreateOpportunity` (1 de 6 casos de uso) — nenhum ARG ou Freeze formal foi emitido para os 5 casos de uso adicionais.

**Impacto**: nenhum impacto funcional — o próprio `SALES_CONTRACTS_FREEZE.md § 11` já antecipou e autorizou essa expansão sem reabrir o Freeze existente. É uma lacuna de formalização de processo, não uma violação arquitetural.

**Classificação**: Não é uma correção — é uma nova etapa de processo (um ARG/Freeze completo), fora do escopo mecânico desta missão (`ENG-0116` só aplica correções de código/documento pontuais, não conduz um Gate formal).

**Decisão**: **NÃO APROVADO PARA ESTA MISSÃO** — permanece pendente, recomendado como próxima missão (ver "Próxima missão recomendada" no relatório final de `ENG-0116`). Nenhuma mudança de arquitetura é aprovada aqui para adiantar esse Gate.

## Finding 04

**Descrição**: `contracts/README.md` (código-fonte, `services/domains/sales/contracts/README.md`) permanece com o texto de `ENG-0037` ("🚧 Estrutura de pastas criada... Nenhuma API ou payload de evento definido"), desatualizado frente aos 18 arquivos reais implementados.

**Impacto**: nenhum impacto funcional — é um README informativo, não referenciado por build/lint/test.

**Classificação**: Fora do escopo explícito desta missão — a Ordem de Missão restringe README a "fora do escopo" exceto onde nomeado; `contracts/README.md` não está entre os arquivos nomeados para correção.

**Decisão**: **NÃO APROVADO PARA ESTA MISSÃO** — `contracts/README` será atualizado posteriormente, em missão própria.

## Finding 05

**Descrição**: `knowledge/architecture/analysis/README.md` (inventário) não lista 5 das 6 Specifications de Response já existentes (`ADVANCE_OPPORTUNITY_STAGE`, `SUBMIT_PROPOSAL`, `APPROVE_PROPOSAL`, `MARK_OPPORTUNITY_WON`, `MARK_OPPORTUNITY_LOST` — apenas `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md` e a própria `SALES_CONTRACTS_COMPLETION_AUDIT_V2.md` estão listadas).

**Impacto**: nenhum impacto funcional — é um gap de sincronização de inventário documental.

**Classificação**: Correção de escopo maior que uma correção pontual (5 linhas de tabela, decisão editorial sobre resumo de cada uma) — não nomeada explicitamente na lista de correções desta Ordem de Missão (`Correção 1`/`2`/`3`).

**Decisão**: **NÃO APROVADO PARA ESTA MISSÃO** — `analysis/README` será sincronizado posteriormente, em missão própria.

---

# Decisões Arquiteturais

1. **`readonly` será obrigatório em todos os Request/Response Contracts** — reafirmação do já vigente `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 9`, agora aplicado retroativamente a `CreateOpportunityRequest`/`CreateOpportunityResponse` (Finding 01).
2. **`Object.freeze()` não pertence à Contracts Layer** — toda Contract é `interface` pura, nunca `class`; o item de checklist que sugeria `Object.freeze()` será corrigido para refletir isso (Finding 02).
3. **`analysis/README` deverá ser sincronizado posteriormente** — Finding 05 permanece pendente, fora desta missão.
4. **`contracts/README` será atualizado posteriormente** — Finding 04 permanece pendente, fora desta missão.
5. **Nenhuma mudança de arquitetura foi aprovada** — a posição da Contracts Layer (`Cliente→Contracts→Application→Domain→Repository→Infrastructure`), o Dependency Rule, o Rule Ownership (0% Contracts) e a Naming Convention permanecem exatamente como já congelados; esta decisão não os revisita.
6. **Nenhuma mudança de domínio foi aprovada** — nenhum getter, campo, Aggregate, Entity, Value Object ou Domain Event é criado, alterado ou reinterpretado por esta decisão.

# Impact Analysis

- **Impacto funcional**: nenhum — `readonly` é puramente estrutural (tempo de compilação); a correção documental do checklist não altera nenhum artefato de código.
- **Impacto em Domain**: nenhum — nenhum arquivo de `domain/` é tocado por `ENG-0116`.
- **Impacto em Application**: nenhum — nenhum arquivo de `application/` é tocado por `ENG-0116`.
- **Impacto em Infrastructure**: nenhum — nenhum arquivo de `infrastructure/` é tocado por `ENG-0116`.
- **Impacto em Tests**: nenhum esperado — os 117 testes existentes não referenciam `create-opportunity.request.ts`/`create-opportunity.response.ts` diretamente (são artefatos da Contracts Layer, não exercitados pelos testes de Domain/Repository/Application já existentes); build/lint continuam a validar a correção.

# Final Decision

Classificação: **APPROVED WITH MINOR CORRECTIONS**

Correções aprovadas para `ENG-0116`: Finding 01 (Correção 1 + Correção 2) e Finding 02 (Correção 3) — exatamente as 3 correções nomeadas pela Ordem de Missão composta. Findings 03, 04 e 05 permanecem registrados, não aprovados para esta missão, recomendados como missões futuras distintas.

---

## Domain Model Validation

- Entity criada? **NÃO.**
- Aggregate criado? **NÃO.**
- Value Object criado? **NÃO.**
- Domain Event criado? **NÃO.**
- Nova regra criada? **NÃO.**
- Repository alterado? **NÃO.**
- Infrastructure alterada? **NÃO.**

## Relação com Outros Módulos

- [SALES_CONTRACTS_COMPLETION_AUDIT_V2.md](SALES_CONTRACTS_COMPLETION_AUDIT_V2.md) (ENG-0114) — fonte exclusiva dos 5 Findings avaliados aqui
- [SALES_CONTRACTS_ALIGNMENT_DECISION.md](SALES_CONTRACTS_ALIGNMENT_DECISION.md) (ENG-0085, V1) — precedente direto de forma, escopo distinto (localização de pasta)
- [SALES_CONTRACTS_LAYER_ARCHITECTURE.md](SALES_CONTRACTS_LAYER_ARCHITECTURE.md) (ENG-0078) — documento a ser corrigido por `ENG-0116` (Correção 3)
- [services/domains/sales/contracts/create-opportunity/create-opportunity.request.ts](../../../services/domains/sales/contracts/create-opportunity/create-opportunity.request.ts), [create-opportunity.response.ts](../../../services/domains/sales/contracts/create-opportunity/create-opportunity.response.ts) — arquivos a serem corrigidos por `ENG-0116` (Correção 1, Correção 2)

## Status

🟢 Alignment Decision aprovada (Missão ENG-0115). Nenhum código criado ou alterado. Classificação: **APPROVED WITH MINOR CORRECTIONS**. Autoriza exclusivamente as 3 correções nomeadas para `ENG-0116`. Aguardando aplicação pela sub-missão seguinte.
