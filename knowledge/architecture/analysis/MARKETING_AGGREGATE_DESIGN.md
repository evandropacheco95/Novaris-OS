# Marketing — Aggregate Design

Versão: 1.0.0

Status: 🟢 Design tático concluído — nenhum código criado

Missão: ENG-0132 (continuação do roteiro de resolução de domínios — Marketing).

Escopo: aprofundar o candidato já nomeado em `AGGREGATE_DISCOVERY.md § "Marketing — Candidato"`, exclusivamente com base em evidência já existente.

**Verify Before Reimplementing**: busca por "MARKETING_AGGREGATE_DESIGN" — zero resultados.

---

## 1. Fonte das Evidências

- `DOMAIN_MODEL.md § MARKETING DOMAIN` — responsabilidade: "campanhas, landing pages, SEO, conteúdo, social media". Objetos: `Campaign`, `Landing Page`, `Asset`, `Template`, `Content`, `Audience`.
- `BOM.md § Campaign` — "Campanha." — one-liner, sem `Tipos:`/`Estados:`/`Eventos:` (diferente de `Activity`).
- `BOM.md § Asset` — "Recurso digital." — one-liner.
- `UBIQUITOUS_LANGUAGE.md § Domínio: Marketing` — `Campaign`: "Para iniciativa de marketing com início/fim" — nenhuma "Objetos Relacionados" preenchida (TODO). `Asset`: "Para arquivo de mídia reutilizável (imagem, vídeo, template) — Não usar como sinônimo de `File` (Core Objects — arquivo genérico armazenado, sem conotação de marketing)" — **Objetos Relacionados também TODO, vazio** — nenhuma relação com `Campaign` documentada em nenhuma fonte.
- `Landing Page`, `Template`, `Content`, `Audience` — **confirmado, sem entrada em `BOM.md`** (`UBIQUITOUS_LANGUAGE.md` já registra: "nomeados em `DOMAIN_MODEL.md § MARKETING DOMAIN`, mas não são objetos do BOM").

## 2. Achado Decisivo — `Campaign` é o único Aggregate Root confirmado

`Campaign` é o único objeto do domínio com dupla confirmação (`DOMAIN_MODEL.md` + `BOM.md`) — mesmo critério mínimo já usado para todo outro domínio resolvido nesta engenharia.

## 3. Achado Decisivo — `Asset` não tem relação documentada com `Campaign`

Diferente do que se poderia presumir (um Asset "pertence" a uma Campaign), **nenhuma fonte relaciona os dois objetos** — a coluna "Objetos Relacionados" de `Asset` em `UBIQUITOUS_LANGUAGE.md` está vazia (`TODO`). A definição de `Asset` ("arquivo de mídia **reutilizável**... distinto de `File`, arquivo genérico **sem conotação de marketing**") sugere um conceito mais próximo de um recurso compartilhável entre múltiplas iniciativas — mesmo critério de "reuso" já decisivo para `Pipeline` (`ADR-0021`) ser Aggregate Root próprio, não Entity interna de `Opportunity`.

**Conclusão preliminar, não implementada**: se `Asset` vier a ser modelado, a evidência aponta para um Aggregate Root **independente** de `Campaign` (não sua Entity interna) — mas dado que sua definição já o diferencia explicitamente de `File` (Core Objects) sem clareza sobre qual Bounded Context realmente o possui, **a própria posse de `Asset` (Marketing vs. um conceito transversal de Kernel/Core) permanece uma pergunta em aberto**, não resolvida por este documento.

## 4. Estrutura Proposta — `Campaign` (Aggregate Root)

| Campo | Tipo candidato | Obrigatório/Opcional | Evidência |
|---|---|---|---|
| `id` | `UniqueEntityId` (herdado) | Obrigatório | Padrão de todo Aggregate Root |
| `organizationId` | `UniqueEntityId` | Obrigatório | Regra transversal de multi-tenancy |
| `createdAt`, `updatedAt` | `Date` | Obrigatório | Padrão `Timestamped` |

**Campo de conteúdo (nome) — `Needs Evidence`, não incluído**: mesma situação encontrada para `Party` antes de `ADR-0025` — nenhuma fonte nomeia sequer um campo `name`/`title` para `Campaign`, apesar de ser "obviamente necessário" para qualquer tela real (mesmo raciocínio, requer uma futura ADR de campos mínimos).

**"Início/fim"** (`UBIQUITOUS_LANGUAGE.md`: "iniciativa de marketing com início/fim") — sugere campos de data (`startDate`/`endDate`), mas nenhuma fonte confirma o formato ou obrigatoriedade — `Needs Evidence`, não incluído.

## 5. Domain Events Candidatos

Nenhum — `Campaign` não tem `Tipos:`/`Estados:`/`Eventos:` em `BOM.md` (diferente de `Activity`/`Task`), e nenhum evento relacionado a `Campaign` está na lista de 10 eventos oficiais (`DOMAIN_MODEL.md § EVENT BUS`). Nenhum evento é inventado.

## 6. Objetos Bloqueados

| Objeto | Status |
|---|---|
| `Asset` | Sem relação documentada com `Campaign` (§ 3); posse (Marketing vs. Kernel/Core) não resolvida — bloqueado |
| `Landing Page` | Nomeado em `DOMAIN_MODEL.md`, sem entrada em `BOM.md` — bloqueado |
| `Template` | Idem |
| `Content` | Idem |
| `Audience` | Idem |

## 7. Perguntas Remanescentes

1. Campo `name`/`title` de `Campaign` — não definido em nenhuma fonte (mesma classe de bloqueio de `Party` antes de `ADR-0025`).
2. Campos de período (`startDate`/`endDate`) — sugeridos pela definição, não confirmados.
3. Posse de `Asset` — Marketing Domain ou conceito transversal de Kernel/Core (distinto de `File`)? Não resolvido.
4. `Landing Page`/`Template`/`Content`/`Audience` — bloqueados, sem nenhuma entrada em `BOM.md`.

## 8. Recomendação

`Campaign` é o candidato mais simples de todos os domínios ainda não implementados (nenhum evento, nenhuma relação, nenhuma Entity interna candidata) — mas precisa de uma extensão de campos mínimos (`name` no mínimo) antes de qualquer implementação, mesmo padrão de `ADR-0025`/`ADR-0030`/`ADR-0031`. `Asset` precisa de uma decisão de posse antes de ser sequer candidato a implementação.

---

## Domain Model Validation

Entity criada? **NÃO.** Aggregate criado? **NÃO.** Value Object criado? **NÃO.** Domain Event criado? **NÃO.**

## Relação com Outros Módulos

- [AGGREGATE_DISCOVERY.md](../decisions/AGGREGATE_DISCOVERY.md) — origem do candidato `Campaign`
- [ADR-0021](../../../adr/ADR-0021-pipeline-nature.md) — precedente do critério "reuso" usado para avaliar `Asset`

## Status

🟢 Design tático concluído. Requer decisão do CTO sobre campos mínimos de `Campaign` e posse de `Asset` antes de implementação real.
