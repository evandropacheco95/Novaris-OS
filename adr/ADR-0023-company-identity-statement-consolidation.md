# ADR-0023 - Consolidação da Declaração de Identidade da Empresa (Visão Única)

## Problema

Uma auditoria de integridade documental (2 investigações paralelas, `knowledge/architecture/governance/DOCUMENTATION_INTEGRITY_AUDIT.md`) encontrou **5 formulações distintas** de "o que é a NOVARIS" coexistindo, sem reconciliação formal entre a maioria delas:

1. `CONSTITUTION.md` Artigo 4 (Visão, emendada por `ADR-0022`): *"Ser referência latino-americana, para empresas de médio porte, em Sistemas Operacionais Empresariais baseados em Inteligência Artificial."*
2. `NOVARIS_OS.md § 3` (Visão): *"Ser a principal plataforma latino-americana de Sistemas Operacionais Empresariais baseados em Inteligência Artificial."*
3. `NOVARIS_OS.md § 20` (Objetivo de Longo Prazo): *"Transformar a NOVARIS na plataforma operacional de empresas que desejam crescer utilizando Estratégia, Tecnologia e Inteligência Artificial."*
4. `SYSTEM_ARCHITECTURE.md § 2` (Visão Geral): *"NOVARIS é um Enterprise Operating System (EOS). Não é apenas um CRM."*
5. `NOVARIS_OS.md § 1` (Introdução): *"A NOVARIS é uma empresa de tecnologia especializada na construção de sistemas de crescimento empresarial."*

Apenas a divergência entre (1) e (2) já havia sido registrada (por `ADR-0022`, como pendência aberta). As formulações (3), (4) e (5) nunca haviam sido citadas em nenhum documento de governança como parte do mesmo problema — são achados novos desta auditoria.

## Contexto

`CONSTITUTION.md` é a única autoridade constitucional ativa (`ADR-0008`) e seu Artigo 4 foi o único, dentre as 5 formulações, emendado por decisão explícita e recente do CTO (`ADR-0022`), combinando deliberadamente o recorte geográfico e o recorte de porte de empresa. As demais 4 formulações são anteriores, escritas em momentos e documentos diferentes (`NOVARIS_OS.md`, `SYSTEM_ARCHITECTURE.md`), sem qualquer coordenação entre si — o mesmo padrão de "um conceito, várias vozes concorrentes" já visto e resolvido nesta engenharia para `Relationship`/`Customer` (`ADR-0007`), `AI`/`Intelligence` (`ADR-0014`) e `Queue` (`ADR-0012`+Amendment).

`NOVARIS_OS.md` e `SYSTEM_ARCHITECTURE.md` continuam com Status "Oficial" e são ativamente citados por documentação corrente (`NEF/ROLES.md`, `NEF/03-architecture/README.md`, `NEF/10-index/README.md`, `ENGINEERING_PLAYBOOK.md`) — não são documentos mortos, e `knowledge/core/README.md` já registra que ambos "não devem ser alterados sem aprovação explícita".

## Alternativas

### Option A — Manter as 5 formulações coexistindo, apenas registrar como pendência
Rejeitada. É exatamente o padrão que já causou confusão em outros conceitos desta plataforma; resolver agora, enquanto o custo é baixo (nenhum código depende de nenhuma dessas frases), é mais seguro do que esperar.

### Option B — Reescrever o corpo de `NOVARIS_OS.md`/`SYSTEM_ARCHITECTURE.md` para citar literalmente o texto do Artigo 4
Rejeitada. Apagaria texto original já ditado e aprovado anteriormente, na mesma disciplina já seguida para `NOVARIS_CONSTITUTION.md` (nunca reescrever conteúdo original, apenas anotar). `NOVARIS_OS.md` e `SYSTEM_ARCHITECTURE.md` têm tom e propósito diferentes (produto/marca vs. arquitetura técnica) — forçar identidade textual perderia essa distinção sem necessidade.

### Option C — Designar `CONSTITUTION.md` Artigo 4 como a única Visão oficial da empresa, com nota de resolução não-destrutiva nas outras 4 localizações
**Escolhida.** Cada uma das 4 formulações remanescentes recebe uma nota curta, não original, apontando para o Artigo 4 como a versão vinculante — sem apagar ou reescrever o texto já existente.

## Escolha

`CONSTITUTION.md` Artigo 4 é a **única Visão oficial da empresa NOVARIS**. As 4 formulações remanescentes (`NOVARIS_OS.md §§ 1, 3, 20`; `SYSTEM_ARCHITECTURE.md § 2`) permanecem no texto, preservadas verbatim, cada uma recebendo uma nota de resolução apontando para o Artigo 4 como fonte vinculante em caso de divergência.

## Consequências

**Positivas**: encerra a fragmentação de "o que é a NOVARIS" com uma única fonte vinculante, sem apagar nenhum texto original; aplica, pela quarta vez nesta engenharia, o mesmo padrão já validado de resolução (`ADR-0007`, `ADR-0012`, `ADR-0014`).

**Negativas / pendências, explicitamente fora de escopo desta ADR**: divergência de contagem de produtos (6 em `NOVARIS_OS.md § 7` vs. 9 em `PRODUCTS.md`) e de domínios (15 em `SYSTEM_ARCHITECTURE.md § 5` vs. 10 confirmados em `DOMAIN_MODEL.md`) permanecem abertas, já registradas em `PROJECT_RULES.md`, não resolvidas aqui — são decisões de escopo de produto/negócio, não de identidade textual.

## Domain Impact

Nenhuma Entity, Aggregate, Value Object, Domain Event, Repository ou código foi criado/alterado. Nenhum domínio existente foi modificado. Emenda documental pura.

## Responsável

Decisão de arquitetura: CTO (via diretiva explícita desta sessão para garantir consistência documental de "nível militar"). Execução: Engenheiro Principal.

## Data

2026-07-22

## Impactos

Criado: este arquivo, `knowledge/architecture/governance/DOCUMENTATION_INTEGRITY_AUDIT.md`. Alterados (nota não-destrutiva, texto original preservado): `knowledge/core/NOVARIS_OS.md` (§§ 1, 3, 20), `knowledge/core/SYSTEM_ARCHITECTURE.md` (§ 2), `PROJECT_RULES.md` (Emenda 32), `adr/README.md` (linha ADR-0023).

## Plano de Migração

Não aplicável — nenhum código ou dado referencia essas frases diretamente; emenda documental pura, sem impacto em runtime.

## Status

Aceito

---

## Relação com Outros Módulos

- [knowledge/architecture/governance/DOCUMENTATION_INTEGRITY_AUDIT.md](../knowledge/architecture/governance/DOCUMENTATION_INTEGRITY_AUDIT.md) — auditoria que originou esta ADR
- [ADR-0022](ADR-0022-constitution-knowledge-cycle-amendment.md) — emendou o Artigo 4 agora designado único
- [ADR-0007](ADR-0007-domain-boundaries.md), [ADR-0012](ADR-0012-queue-ownership.md), [ADR-0014](ADR-0014-ai-architectural-position.md) — precedentes diretos do mesmo padrão de resolução
- [knowledge/core/NOVARIS_OS.md](../knowledge/core/NOVARIS_OS.md), [knowledge/core/SYSTEM_ARCHITECTURE.md](../knowledge/core/SYSTEM_ARCHITECTURE.md) — documentos anotados
