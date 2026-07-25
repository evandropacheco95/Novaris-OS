# Sales — Contracts Architecture Alignment Decision

Versão: 1.0.0

Status: 🟢 Decisão de alinhamento arquitetural — sem código alterado

Missão: ENG-0085 (Sales Contracts Architecture Alignment Decision)

Escopo: resolver formalmente a divergência de localização de pasta da Contracts Layer, identificada em `SALES_CONTRACTS_COMPLETION_AUDIT.md § 11` item 1 (`ENG-0084`) — decidir qual estrutura é a canônica, sem mover nenhum arquivo físico e sem alterar nenhum código. Esta missão **não implementa Contract novo, não move arquivo, não cria DTO/Controller/API/teste, não altera `package.json`, export, import, Domain, Application, Infrastructure ou Shared Kernel**.

**Verify Before Reimplementing**: busca executada por "contracts/api/", "contracts/create-opportunity/", "Contracts Architecture", "Export Strategy", "Folder Structure", "Contracts Folder", "Public API", "DTO Folder", "API Folder" em todo `knowledge/` e `adr/`. Único resultado real: as 2 ocorrências de `contracts/api/create-opportunity/` dentro de `SALES_CONTRACTS_LAYER_ARCHITECTURE.md` (linhas 119, 127) — a própria divergência já registrada por `ENG-0084`. **Nenhuma ADR ou documento já decidiu oficialmente esta estrutura** — nenhuma duplicação de decisão.

---

## 1. Contexto

`SALES_CONTRACTS_COMPLETION_AUDIT.md § 11` item 1 (`ENG-0084`) registrou, sem corrigir, uma divergência entre o exemplo de caminho documentado em `SALES_CONTRACTS_LAYER_ARCHITECTURE.md §§ 11-12` (`contracts/api/create-opportunity/`) e a implementação real de `ENG-0079`–`ENG-0083` (`contracts/create-opportunity/`). Antes do Architecture Review Gate e do Freeze da Contracts Layer, essa inconsistência precisa de uma decisão formal — não pode permanecer como uma divergência aberta indefinidamente.

## 2. Problema Encontrado

Dois textos normativos apontam para dois caminhos físicos diferentes para o mesmo tipo de artefato (o par Request/Response de um caso de uso): o documento de arquitetura versus o código já implementado e já auditado como estruturalmente correto (`ENG-0084 §§ 5-9`, todos ✅). Nenhuma missão entre `ENG-0079` e `ENG-0083` tomou essa decisão conscientemente — cada uma seguiu o caminho literal já ditado por sua própria Ordem de Missão, sem cruzar contra o exemplo da arquitetura.

## 3. Arquitetura Originalmente Documentada

`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 11` ("Export Strategy"): *"Cada subpasta de `contracts/` (ex.: `contracts/api/create-opportunity/`) exporta seus tipos via um único `index.ts`..."* — e `§ 12` ("Naming Convention"), coluna "Exemplo": `contracts/api/create-opportunity/`. Em ambos os casos, o exemplo posiciona a pasta do caso de uso **dentro** de `contracts/api/`, subpasta já existente desde o skeleton original (`ENG-0037`).

## 4. Arquitetura Efetivamente Implementada

`ENG-0079` (`CreateOpportunityRequest`), `ENG-0081` (`CreateOpportunityResponse`) e `ENG-0082` (barrel local) criaram todos os seus arquivos em `services/domains/sales/contracts/create-opportunity/` — **um nível acima** de `contracts/api/`, como pasta irmã de `api/`/`events/`, nunca dentro de `api/`. `ENG-0083` (Root Barrel) reexporta exatamente esse caminho (`export * from "./create-opportunity/index.js"`), consistente com a implementação real, não com o exemplo da arquitetura.

## 5. Análise Comparativa

| Critério | `contracts/api/<use-case>/` (Alternativa B) | `contracts/<use-case>/` (Alternativa A) |
|---|---|---|
| **Simplicidade** | Um nível a mais de aninhamento sem ganho de clareza — `api/` não agrega nenhuma responsabilidade própria hoje, é apenas um agrupador | Caminho direto, mesmo número de segmentos que `domain/aggregates/<nome>/`, `application/commands/<nome>/`, já convenções congeladas |
| **DDD** | Sugeriria que Contracts pertence a um "protocolo" específico (`api`), o que contradiz `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 2`: Contracts é a fronteira **antes** da API (Cliente→**API**→**Contracts**→Application), não uma subpasta da API | `contracts/<use-case>/` reflete corretamente que o Contract é uma camada própria, anterior e independente de qualquer protocolo de transporte |
| **Manutenção** | Exigiria mover 3 arquivos já implementados e testados (`request.ts`/`response.ts`/`index.ts`) sem nenhum ganho funcional | Zero movimentação — o que já existe permanece exatamente onde está |
| **Escalabilidade** | Ao crescer para 6 casos de uso, `api/` se tornaria um contêiner artificial sem semântica própria | `contracts/` na raiz já comporta os 6 casos de uso sem necessidade de reclassificação futura |
| **Consistência com o resto do pacote** | Nenhuma outra camada do pacote (`domain/`, `application/`) agrupa suas subpastas por protocolo de transporte | Espelha exatamente o padrão já congelado de `domain/aggregates/<nome>/` e `application/commands/<nome>/` — um nível, nome do caso de uso |
| **Exports** | Nenhuma diferença técnica — o barrel funcionaria igualmente em ambos os casos | Já implementado e já auditado como correto (`ENG-0084 § 7`, todos ✅) |
| **Future-proof** | Preserva `api/` para um cenário hipotético (múltiplos protocolos) que nenhuma fonte hoje exige | `api/` permanece disponível, vazia, para o dia em que essa necessidade for real — nada é perdido |

## 6. Alternativas Consideradas

### Alternativa A — `contracts/<use-case>/`
Manter a estrutura real já implementada (`ENG-0079`–`ENG-0083`) como padrão oficial; corrigir o exemplo do documento de arquitetura para refletir a realidade.

### Alternativa B — `contracts/api/<use-case>/`
Manter o exemplo original da arquitetura como vinculante; mover os 3 arquivos já implementados para dentro de `api/`, ajustando os 2 barrels existentes.

## 7. Critérios Utilizados

Os mesmos já aplicados em toda decisão tática desta engenharia que não envolve regra de negócio cross-domain (`ARCHITECTURE_GOVERNANCE.md § 5`: nomenclatura/estrutura de um artefato isolado não exige ADR) — simplicidade estrutural, consistência com o padrão já congelado em `domain/`/`application/`, ausência de custo de migração, e preservação de opcionalidade futura (`api/` não é removida, apenas não é o caminho padrão).

## 8. Decisão Oficial

**A estrutura oficial da Contracts Layer do Sales Domain é `contracts/<use-case>/`** — cada caso de uso (`create-opportunity`, `advance-opportunity-stage`, `submit-proposal`, `approve-proposal`, `mark-opportunity-won`, `mark-opportunity-lost`) recebe sua própria pasta diretamente sob `contracts/`, nunca dentro de `contracts/api/`. A pasta `contracts/api/` **permanece reservada** para uma evolução futura genuína (ex.: se um novo protocolo de transporte exigir contratos fisicamente separados por protocolo) — não é removida, apenas deixa de ser o caminho padrão para o par Request/Response de um caso de uso. O exemplo `contracts/api/create-opportunity/` em `SALES_CONTRACTS_LAYER_ARCHITECTURE.md` passa a ser considerado **histórico/corrigido** (§ 11).

## 9. Impacto

- **Nenhum código alterado** — `create-opportunity.request.ts`, `create-opportunity.response.ts`, `create-opportunity/index.ts`, `contracts/index.ts` permanecem byte-a-byte idênticos.
- **Nenhum import alterado.**
- **Nenhum export alterado.**
- **Nenhum teste alterado** (nenhum teste de Contracts existe ainda).
- **Nenhuma API afetada** — nenhuma API existe ainda.

## 10. Compatibilidade

Confirmado: `ENG-0079` (`CreateOpportunityRequest`), `ENG-0081` (`CreateOpportunityResponse`), `ENG-0082` (barrel local) e `ENG-0083` (Root Barrel) **continuam válidas sem qualquer alteração** — todas já seguiam, na prática, a estrutura agora declarada oficial (`contracts/<use-case>/`). Esta decisão retroativamente confirma a conformidade dessas 4 missões, em vez de invalidá-las.

## 11. Atualização da Arquitetura

Corrigidas exclusivamente as 2 ocorrências de `contracts/api/create-opportunity/` em `SALES_CONTRACTS_LAYER_ARCHITECTURE.md` (§ 11 "Export Strategy", § 12 "Naming Convention"), substituídas por `contracts/create-opportunity/` — nenhum outro trecho do documento alterado. Ambas as seções recebem também uma nota curta registrando a correção e citando esta decisão.

## 12. Próximos Passos

**Liberado: ENG-0086 — Contracts Architecture Review Gate**, agora que a única divergência estrutural pendente (`ENG-0084 § 11` item 1) está resolvida. O gap de tooling (script `lint` sem `contracts/`, mesmo § 11 item 4) permanece registrado, não resolvido por esta missão — não é uma divergência arquitetural, é um item de tooling, fora do escopo desta decisão.

## 13. Conclusão

# ARCHITECTURE ALIGNED

A Contracts Layer do Sales Domain tem agora uma única fonte de verdade estrutural, sem contradição entre documentação e código.

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

- [SALES_CONTRACTS_COMPLETION_AUDIT.md § 11](SALES_CONTRACTS_COMPLETION_AUDIT.md) (ENG-0084) — origem direta da divergência resolvida por esta decisão
- [SALES_CONTRACTS_LAYER_ARCHITECTURE.md §§ 11-12](SALES_CONTRACTS_LAYER_ARCHITECTURE.md) (ENG-0078, atualizado por esta missão) — documento corrigido
- [services/domains/sales/contracts/create-opportunity/](../../../services/domains/sales/contracts/create-opportunity/) (ENG-0079, ENG-0081, ENG-0082), [contracts/index.ts](../../../services/domains/sales/contracts/index.ts) (ENG-0083) — código real, confirmado compatível sem alteração

## Status

🟢 Decisão de alinhamento concluída (Missão ENG-0085). Nenhum arquivo `.ts` movido ou alterado. Nenhum código, teste, Domain, Application ou Infrastructure alterado. Classificação final: **ARCHITECTURE ALIGNED**. Aguardando aprovação formal do CTO.
