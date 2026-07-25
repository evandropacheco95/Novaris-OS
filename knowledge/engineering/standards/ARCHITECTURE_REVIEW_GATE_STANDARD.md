# Architecture Review Gate (ARG) — Standard

Versão: 1.0.0

Status: 🟢 Oficial — padrão obrigatório, congelado

Missão: ENS-0002 (Architecture Review Gate Standard)

---

## Objetivo

Formalizar o **Architecture Review Gate (ARG)** como padrão oficial de engenharia — um gate binário (**PASS**/**FAIL**), executado ao final de toda missão de implementação (`ENG-`), que confirma, item a item, que a Definition of Done da missão foi integralmente cumprida antes de a missão ser apresentada para aprovação do CTO.

O ARG nasceu de forma ad-hoc nas Ordens de Missão ENG-0002.7 (Implement User Aggregate) e ENG-0002.8 (Implement Role Aggregate), sem template ou definição prévia — ambas registraram isso explicitamente e recomendaram uma padronização formal futura. Este documento é essa padronização. Nenhuma das duas missões é alterada retroativamente — o ARG que já produziram permanece válido, apenas informal; este Standard vale a partir de agora.

## Quando o ARG é Obrigatório

O ARG é obrigatório para toda **missão de implementação** — prefixo `ENG-` na taxonomia de Mission ID ([NEF/PLANNING_MODEL.md](../../../NEF/PLANNING_MODEL.md), formalizada em ENS-0001). Não se aplica a missões `ADR-`, `ADM-`, `ENS-` ou de documentação pura (ex.: `DOC-`, `NEP-`) — essas não produzem código a ser barrado por um gate de implementação. Esta própria missão (ENS-0002) é um exemplo de missão que **não** exige ARG, por ser um Standard, não uma implementação.

## Momento de Execução

O ARG é o **último passo** da Fase 11 (Conclusão) do [EXECUTION_PROTOCOL.md](../../../.command-center/EXECUTION_PROTOCOL.md) — executado **depois** de Self Review, Domain Model Validation (DMV, quando aplicável) e Architecture Compliance Report (ACR) já estarem prontos, e **antes** do Relatório Final da missão e do pedido de aprovação ao CTO. O ARG consome os achados dos três relatórios anteriores — não os antecipa nem os substitui.

```
Implementação (Fase 7) → Testes (Fase 8) → Documentação (Fase 9) → CHANGELOG (Fase 10)
  → Self Review → DMV (se aplicável) → ACR → ARG → Relatório Final → Aprovação do CTO
```

## Responsáveis

Quem executa a missão de implementação também executa o ARG sobre o próprio trabalho — mesmo padrão já em uso para Self Review/DMV/ACR nesta engenharia. Na taxonomia de papéis de [NEF/ROLES.md](../../../NEF/ROLES.md), o ARG corresponde ao papel de **Reviewer AI** ("aplica o checklist... antes de um humano revisar; sinaliza, não aprova sozinho") — nenhum papel novo é criado por este Standard. Um **Tech Lead** ou **Solution Architect** humano pode reexecutar o ARG de forma independente a qualquer momento. A aprovação final de merge continua exclusiva do **CTO** (ver "Relação com a Aprovação do CTO" abaixo).

## Critérios Obrigatórios

Todo ARG verifica os 12 critérios abaixo. Critérios que não se aplicam ao tipo específico de implementação (ex.: "preservar invariantes de domínio" numa missão sem modelagem de domínio) são marcados **N/A**, nunca omitidos da tabela.

| # | Critério | Fonte |
|---|---|---|
| 1 | Compila sem erros | `pnpm build` |
| 2 | Passa em lint sem erros/warnings | `pnpm lint` |
| 3 | Testes unitários cobrem construção válida, cada invariante violada, cada método de mutação e geração correta de cada artefato observável (ex.: Domain Event) | `pnpm test`; checklist do ENS aplicável ao tipo de componente, quando houver um (ex.: `AGGREGATE_IMPLEMENTATION_STANDARD.md § 11` para Aggregates) |
| 4 | Reutiliza integralmente o Shared Kernel — nenhuma reimplementação de componente já existente | `packages/shared-kernel/` |
| 5 | Respeita toda documentação vinculante da missão (Blueprint, Freeze, ADR, ENS aplicáveis) — nenhuma divergência | Documentos citados na própria Ordem de Missão |
| 6 | Segue o mesmo padrão estrutural de uma implementação de referência já aprovada, quando existir uma para o mesmo tipo de componente — diferenças só quando decorrentes de regra própria do domínio, e explicitamente justificadas | Ex.: `User` Aggregate (ENG-0002.7) como referência estrutural para `Role` (ENG-0002.8) |
| 7 | Não depende de framework fora da stack já aprovada | [ADR-0005](../../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) |
| 8 | Não acessa infraestrutura fora do escopo autorizado pela Ordem de Missão | Escopo Proibido da própria missão |
| 9 | Preserva todas as invariantes de domínio aplicáveis | Blueprint/Freeze do domínio, quando houver |
| 10 | Produz somente os artefatos (Domain Events, contratos etc.) já aprovados na documentação vinculante — nenhum artefato não autorizado | Blueprint/Freeze do domínio, quando houver |
| 11 | Nenhuma regra de negócio nova foi criada durante a implementação | Restrições da própria Ordem de Missão |
| 12 | Escopo proibido da própria Ordem de Missão foi integralmente respeitado — nenhum arquivo/domínio fora do escopo permitido foi tocado | Escopo Proibido da própria missão |

## Formato do Relatório

O ARG é uma tabela — não um texto narrativo (essa é a diferença de forma em relação ao ACR, ver abaixo). Cada linha reproduz os 12 critérios, com uma coluna "Verificado" (como/onde foi checado) e uma coluna "Resultado" (✅/❌/N/A). A última linha é sempre:

```
Gate: ✅ PASS — todos os critérios aprovados, nenhuma pendência.
```

ou, em caso de reprovação:

```
Gate: ❌ FAIL — critérios reprovados: <lista>. Missão retorna à Fase 7/8 até resolução.
```

## Resultado Esperado — PASS / FAIL

- **PASS**: todos os 12 critérios são ✅ ou N/A (nunca ❌). A missão pode prosseguir para o Relatório Final e para o pedido de aprovação ao CTO.
- **FAIL**: pelo menos um critério é ❌. A missão **não** é considerada concluída — nenhum Relatório Final é produzido, nenhuma aprovação do CTO é solicitada, até que o(s) critério(s) reprovado(s) seja(m) corrigido(s) e o ARG reexecutado.

Não existe resultado parcial ("PASS com ressalvas") — um gate binário não admite estado intermediário; uma ressalva que não bloqueia o merge é, por definição, um item para Technical Debt (já coberto pelo ACR § 7), não um FAIL do ARG.

## Relação com Self Review, DMV e ACR

O ARG **não substitui** nenhum dos três — complementa como gate final:

| Relatório | Natureza | Pergunta que responde |
|---|---|---|
| Self Review | Narrativo | "O que foi feito, por quê, e quais decisões foram tomadas?" |
| Domain Model Validation (DMV) | Checklist de 7 perguntas, só para missões de modelagem de domínio | "O modelo de domínio resultante é consistente com a Linguagem Ubíqua e os artefatos de domínio já congelados?" |
| Architecture Compliance Report (ACR) | Narrativo, 9 seções | "A implementação está arquiteturalmente correta, e qual é a recomendação de mérito?" |
| **Architecture Review Gate (ARG)** | **Checklist binário, 12 critérios** | **"A missão está estruturalmente pronta para ser aprovada — sim ou não?"** |

O ARG lê os achados dos três anteriores e os converte numa decisão binária; não reabre a análise que eles já fizeram. Uma missão sem Self Review, DMV (quando aplicável) ou ACR não pode produzir um ARG válido — a ausência de um deles já é, por si, motivo de FAIL no critério correspondente.

## Relação com a Aprovação do CTO

Um ARG com resultado **PASS** é pré-requisito para solicitar aprovação do CTO — não a substitui. O CTO não precisa reexecutar o ARG, mas a aprovação de merge não pode ser concedida (nem solicitada) sem um ARG PASS já registrado no Relatório Final da missão. Um ARG **FAIL** torna a solicitação de aprovação ao CTO inválida por definição — a missão ainda não está pronta para ser avaliada por ele.

## Relação com Outros Módulos

- [.command-center/EXECUTION_PROTOCOL.md § Fase 11](../../../.command-center/EXECUTION_PROTOCOL.md) — sequência oficial de fases, atualizada por esta missão para incluir o ARG
- [.command-center/ARCHITECTURE_REVIEW_GATE_TEMPLATE.md](../../../.command-center/ARCHITECTURE_REVIEW_GATE_TEMPLATE.md) — template de preenchimento, mesmo padrão de [ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md](../../../.command-center/ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md)
- [AGGREGATE_IMPLEMENTATION_STANDARD.md](AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — primeiro ENS, referência de formato para este
- [NEF/ROLES.md](../../../NEF/ROLES.md) — papel **Reviewer AI**, responsável pela execução do ARG
- [architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md § 4](../../../architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md) — decisões de governança de processo, onde o ARG é registrado como prática oficial

## Vigência

A partir desta missão, **todo** ENG (missão de implementação) produz um ARG antes de ser considerado concluído. Mudar este Standard exige ADR ou nova missão `ENS-`. Não é retroativo — ENG-0002.7 e ENG-0002.8 permanecem válidas com o ARG ad-hoc que já produziram.

## Status

🟢 Oficial (v1.0.0), padrão obrigatório e congelado (Missão ENS-0002). Nenhum código implementado, nenhuma regra de negócio nova, nenhuma decisão arquitetural alterada — formalização de uma prática já usada duas vezes.
