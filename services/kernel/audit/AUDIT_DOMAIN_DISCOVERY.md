# Audit Domain — Discovery

Versão: 1.0.0

Status: 🟢 Oficial — modelo conceitual descoberto, nenhuma decisão de implementação antecipada

Missão: ENG-0005.1 (Audit Domain Discovery) — EPIC-005

Escopo: descobrir e documentar o modelo conceitual do Audit Domain — o que é, sua linguagem ubíqua, suas responsabilidades exclusivas, e sua relação conceitual com o restante do Kernel. Nenhum Aggregate, Repository, Mapper, Event, Domain Service, ADR ou infraestrutura foi criado. O acoplamento entre Audit e Event Bus, identificado como maior risco em `AUDIT_EPIC_PLANNING.md § 7`, **não foi resolvido** — apenas formulado com mais precisão (§ 7, § 10). Nenhum documento existente foi alterado.

---

## 1. O que é o Audit Domain?

Um domínio transversal (cross-cutting) responsável por registrar, de forma imutável, o que aconteceu na plataforma — quem fez, o quê, quando, onde, com quais valores antes/depois — servindo toda a plataforma sem pertencer a nenhum domínio de negócio específico. Esta natureza transversal não é uma inferência desta missão: é exigida por **três artigos independentes** da Constituição ativa (`CONSTITUTION.md`, autoridade confirmada por `ADR-0008`):

- **Artigo 10 — Banco de Dados**: toda tabela deve possuir "Auditoria" entre suas propriedades documentadas.
- **Artigo 12 — Segurança**: todo módulo deve utilizar "Logs. Auditoria. Criptografia..."
- **Artigo 18 — Observabilidade**: todo módulo deve gerar "Logs. Métricas. Eventos. Auditoria. Indicadores. Alertas."

Nenhum outro conceito do Kernel aparece em três artigos constitucionais distintos e independentes — confirma, com mais força do que a citação única já usada em `AUDIT_EPIC_PLANNING.md § 1` (que citava `NOVARIS_CONSTITUTION.md`, hoje histórica), que Audit é genuinamente transversal, não um recurso de um módulo específico.

## 2. Qual problema ele resolve?

Sem um domínio de Audit único, cada domínio de negócio precisaria implementar sua própria trilha de auditoria isoladamente — com formato, garantias de imutabilidade e mecanismo de consulta potencialmente diferentes entre si. Isso replicaria exatamente o tipo de duplicação que o Kernel existe para evitar (`knowledge/core/SYSTEM_ARCHITECTURE.md § 4`: "Nenhum domínio replica funcionalidades do Kernel"). Audit resolve isso fornecendo um único contrato de rastreabilidade, consumido — nunca duplicado — por todo domínio presente e futuro.

## 3. O que pertence ao Audit?

Confirmado, sem alteração, do já registrado em `AUDIT_EPIC_PLANNING.md § 2`: o contrato de um registro de auditoria; a garantia de imutabilidade após criação; o mecanismo de consulta (por objeto afetado, por ator, por período); o papel de consumidor de fatos já ocorridos em outros domínios.

## 4. O que NÃO pertence ao Audit?

Confirmado, sem alteração, do já registrado em `AUDIT_EPIC_PLANNING.md § 3`: logging técnico (`services/kernel/logging/`); validação ou aplicação de qualquer regra de negócio que gerou o evento auditado; autenticação/autorização (Identity); transporte de eventos (Event Bus); notificação a usuários; regra de negócio de qualquer domínio consumidor.

## 5. Linguagem Ubíqua do Domínio

Consolidada pela primeira vez como conjunto — nenhum termo é decisão nova, todos já implícitos em `objects/Organization.md § AUDITORIA` e `audit/CONTRACT.md`:

| Termo | Significado |
|---|---|
| **Audit Entry** (ou Audit Record) | O registro individual e imutável de um fato já ocorrido |
| **Actor** | Quem realizou a ação — referenciado por id, nunca embutido |
| **Subject** (ou Target) | O objeto afetado pela ação — id + tipo/domínio de origem |
| **Action** (ou Event) | O que aconteceu — nome do evento/ação |
| **Occurred At** | Quando aconteceu |
| **Origin** | De onde — IP, canal, sistema vs. humano |
| **Change Set** | Os valores antigos e novos, quando aplicável |
| **Audit Trail** | A sequência de Audit Entries relativa a um Subject — conceito de consulta, não necessariamente um objeto próprio (ver § 9) |

## 6. Responsabilidades Exclusivas do Audit

- É o único lugar da plataforma onde a garantia de **imutabilidade de um registro histórico** é responsabilidade central, não incidental (diferente de um log técnico, que pode ser rotacionado/descartado).
- É o único ponto de consulta unificado "o que aconteceu com o objeto X", independente de qual domínio o objeto pertence.
- Nenhum outro domínio deve implementar sua própria trilha paralela — faria isso violar `SYSTEM_ARCHITECTURE.md § 4` ("nenhum domínio replica funcionalidades do Kernel").

## 7. Dependências Conceituais com o Event Bus

Existe uma dependência conceitual real, e uma lacuna específica que esta Discovery formula com mais precisão do que o Planning (`AUDIT_EPIC_PLANNING.md § 7`) conseguiu:

- Se Audit deve ser desacoplado dos domínios produtores (§ 8), a única forma coerente é **assinar** eventos transportados pelo Event Bus, nunca ser chamado diretamente.
- Mas o `DomainEvent` já implementado no Shared Kernel (`packages/shared-kernel/src/core/domain-events/domain-event.ts`, ENG-0001.5) tem exatamente 4 campos: `eventId`, `aggregateId`, `occurredAt`, `eventName`. Nenhum desses é `actor`, `organizationId`, ou `changeSet` — os campos mínimos de um Audit Entry já registrados em `AUDIT_EPIC_PLANNING.md § 6`.
- **Conclusão desta seção, não resolvida, apenas formulada**: existe uma etapa de **enriquecimento** necessária entre o `DomainEvent` bruto (transportado pelo Event Bus) e o `Audit Entry` final — e não há fonte que diga **quem** faz esse enriquecimento (o domínio de origem antes de publicar? o próprio Audit Domain ao consumir? um Adapter intermediário do Event Bus?). Esta é a pergunta mais concreta e acionável a resolver em `ENG-0005.4` (Domain Decisions) — mais específica do que a formulação genérica de "acoplamento" do Planning.

## 8. Audit Deve Conhecer os Domínios Produtores?

**Não.** O próprio objetivo de "domínio transversal desacoplado" (`AUDIT_EPIC_PLANNING.md § 1`) exige que Audit trate qualquer evento de forma genérica — através da forma já compartilhada (`DomainEvent` do Shared Kernel, ou um `Audit Entry` já enriquecido, § 7), nunca importando tipos concretos de `@novaris/identity`, `@novaris/organizations`, ou qualquer futuro pacote de domínio. Um Audit Domain que precisasse conhecer `OrganizationCreated` como tipo concreto violaria diretamente a regra já congelada em `DOMAIN_MODEL.md § REGRAS` ("um domínio nunca acessa [dados de] outro diretamente, só por Eventos ou APIs") e o princípio "Shared Kernel First" já formalizado em `KERNEL_DOMAIN_LIFECYCLE_V2.md § 2`.

## 9. Existe Candidato Natural a Aggregate? (sem modelar)

**Sim** — `AuditEntry` (nome provisório, não decidido). Diferente de `Permission` (`PERMISSION_DOMAIN_DISCOVERY.md §§ 2, 6`: sem identidade própria, estruturalmente impossibilitada de ter Repository), `AuditEntry` tem uma razão real e distinta para identidade própria: precisa ser recuperável de forma independente — `audit/CONTRACT.md` já propõe `getAuditTrail(objectId): AuditEntry[]`, uma consulta que só faz sentido se cada `AuditEntry` for uma unidade endereçável por si mesma, não um valor embutido em outro objeto.

**Nada disto é modelado aqui** — nenhuma `Props`, nenhum método, nenhuma validação, nenhuma confirmação formal de que será, de fato, um `AggregateRoot`. É só o reconhecimento de que a base para essa hipótese é mais forte do que a que `Permission` teve, o que justifica `ENG-0005.3` (Aggregate Design) prosseguir como um rascunho real, não como uma formalidade que já se sabe destinada a falhar.

## 10. Conclusão

O Audit Domain é um domínio transversal genuíno — confirmado por três Artigos constitucionais independentes (§ 1), com um problema real e não-duplicativo a resolver (§ 2), linguagem ubíqua consolidável a partir de fontes já existentes (§ 5), responsabilidades exclusivas claras que nenhum outro domínio deve replicar (§ 6), e um candidato a Aggregate (`AuditEntry`) com base estrutural mais forte do que o precedente de `Permission` (§ 9). A questão de acoplamento com o Event Bus (§ 7) permanece a decisão mais crítica do Epic — não resolvida por esta missão, mas agora formulada com precisão suficiente ("quem enriquece o `DomainEvent` bruto em um `Audit Entry` completo, e onde") para que `ENG-0005.4` a resolva diretamente, sem precisar redescobrir o problema a partir do zero.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Revisão de rastreabilidade**: toda seção cita `CONSTITUTION.md`, `audit/CONTRACT.md`, `event-bus/CONTRACT.md`, `DomainEvent` real, ou um documento já produzido nesta cadeia (`AUDIT_EPIC_PLANNING.md`, `PERMISSION_DOMAIN_DISCOVERY.md`).
- **Comparação entre contratos e arquitetura real**: `audit/CONTRACT.md § Interface Pública` propõe `getAuditTrail(objectId)` como método próprio — comparado contra o padrão de Repository Contract já estabelecido e usado duas vezes (`UserRepository`/`RoleRepository`, ENG-0002.9; `OrganizationRepository`, ENG-0003.9), que rejeita explicitamente métodos de conveniência além de `ReadRepository`/`WriteRepository` puros ("acrescentar um método agora seria antecipar uma decisão de infraestrutura"). O `CONTRACT.md` de `audit/` é anterior a esse padrão (ARCH-001, antes de `ENG-0001.7`) e não foi revisitado — uma futura missão de Repository Contract (`ENG-0005.9`) precisará decidir se `getAuditTrail` sobrevive como método próprio (divergindo do padrão) ou se é substituído por uma composição de `ReadRepository<T>` genérico. Não resolvido aqui.

## DMV

1. Alguma Entity foi criada? Não.
2. Algum Aggregate foi alterado ou criado? Não — `AuditEntry` é só um candidato identificado, sem `Props`, sem método, sem confirmação.
3. Algum Value Object foi criado? Não.
4. Alguma regra nova foi criada? Não — toda responsabilidade citada já decorre de `CONSTITUTION.md`, `BOM.md` ou `audit/CONTRACT.md`.
5. Alguma decisão de Freeze/Closure de outro domínio foi modificada? Não.
6. Há necessidade de ADR? Não para esta missão — nenhuma decisão foi tomada, apenas formulada com mais precisão. A decisão de acoplamento (§ 7), quando tomada em `ENG-0005.4`, provavelmente exigirá ADR (`KERNEL_DOMAIN_LIFECYCLE_V2.md § 2`, "ADR Before Divergence") — não antecipado aqui.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum Aggregate/Repository/Mapper/Event/Domain Service/ADR/infraestrutura criado | ✅ |
| Acoplamento com Event Bus não resolvido, apenas formulado | ✅ |
| Nenhum documento existente alterado | ✅ |
| Comparação com arquitetura real (Repository Contract) feita sem propor solução | ✅ — apenas identifica a tensão, defere a `ENG-0005.9` |
| Rastreabilidade | ✅ Toda seção cita fonte exata, incluindo `CONSTITUTION.md` (3 Artigos) |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`PERMISSION_DOMAIN_DISCOVERY.md`, mesmo tipo de missão) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado (nenhuma resolução de acoplamento, nenhuma correção) | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **A citação a três Artigos de `CONSTITUTION.md` foi verificada diretamente, ou presumida da citação antiga de `audit/CONTRACT.md`?** Verificada diretamente — os três Artigos (10, 12, 18) foram lidos no arquivo real; a citação antiga (`NOVARIS_CONSTITUTION.md ARTICLE XVIII`) foi conferida à parte e confirmada como existente, mas desatualizada (já registrado em `AUDIT_EPIC_PLANNING.md § 7`).
2. **A pergunta de acoplamento (§ 7) foi resolvida, mesmo que parcialmente?** Não — apenas reformulada com mais precisão técnica (a necessidade de uma etapa de enriquecimento e a pergunta de quem a executa), sem escolher nenhuma resposta.
3. **O candidato a Aggregate (§ 9) foi modelado além do permitido?** Não — nenhuma `Props`, nenhum método, nenhuma estrutura interna; apenas a razão pela qual merece uma Aggregate Design real, por comparação com o precedente de `Permission`.
4. **A comparação entre `audit/CONTRACT.md` e o padrão de Repository real é uma correção disfarçada?** Não — é só um registro de tensão, explicitamente deferido para uma missão futura (`ENG-0005.9`), sem escolher qual dos dois lados prevalece.

## Relatório Final

**Arquivos criados**: `services/kernel/audit/AUDIT_DOMAIN_DISCOVERY.md`.

**Arquivos alterados**: nenhum.

**Fontes consultadas**: `AUDIT_EPIC_PLANNING.md`, `audit/CONTRACT.md`, `event-bus/CONTRACT.md`, `CONSTITUTION.md` (Artigos 10, 12, 18), `KERNEL_DOMAIN_LIFECYCLE_V2.md`, `PROJECT_RULES.md`, `DomainEvent` (`packages/shared-kernel/src/core/domain-events/domain-event.ts`), `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md`, `KERNEL_MATURITY_ASSESSMENT.md`; adicionalmente `PERMISSION_DOMAIN_DISCOVERY.md` (comparação de método), `organization-repository.ts`/`user-repository.ts` (comparação de padrão de Repository).

**Validações**: Link Checker (ver abaixo), revisão de rastreabilidade, comparação contratos↔arquitetura real — 1 tensão nova identificada (`getAuditTrail` vs. padrão de Repository já estabelecido), não resolvida.

**Conclusão**: modelo conceitual do Audit Domain descoberto e documentado — domínio transversal genuíno, linguagem ubíqua consolidada, candidato a Aggregate mais forte do que o precedente de Permission. A decisão de acoplamento com Event Bus (§ 7) é o item mais crítico para `ENG-0005.4`, agora formulado com precisão suficiente para ser resolvido diretamente.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
