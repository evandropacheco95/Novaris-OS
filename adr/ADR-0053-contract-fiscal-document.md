# ADR-0053: Documento Fiscal opcional no `Contract`

## Status

Aceita.

## Contexto

Análise do projeto de cliente Winnet (indústria+e-commerce, `ENG-0166`/`ADR-0052`) identificou uma cadeia real Orçamento→Negócio→NFe→Financeiro: a Winnet reconcilia manualmente o número/chave de acesso da Nota Fiscal Eletrônica emitida contra cada venda fechada. NOVARIS já tem o equivalente de "Orçamento→Negócio" (`Quotation accepted` → `Contract`, `ADR-0044`), mas nenhum lugar para registrar o documento fiscal correspondente. O CTO aprovou construir essa estrutura agora, sem depender de credencial real de API fiscal/Bling (input manual).

Durante o levantamento, ficou claro que hoje **não existe nenhuma referência entre o Financial Domain (`Invoice`/`Subscription`) e `Contract`** — `Invoice.subscriptionId` é a única referência cruzada existente, e é unidirecional para `Subscription`, não para `Contract`. Reconciliar automaticamente o Documento Fiscal com uma `Invoice` exigiria inventar um mecanismo cross-domain (criar `Invoice` automaticamente? vincular a uma existente?) sem nenhuma fonte ou decisão prévia do CTO sobre qual seria esse mecanismo.

## Decision Drivers

- Mesmo critério de não inventar regra de negócio sem fonte: a Winnet reconcilia manualmente hoje (não tem integração automática Contract↔Financeiro nem na fonte real) — replicar exatamente esse nível de automação, não mais.
- Mesmo padrão já usado para o perfil fiscal-logístico do `Product` (`ENG-0166`): campos opcionais, `PATCH` parcial com semântica `undefined`/`null`, validação só de fato técnico estável (chave de acesso de NFe tem exatamente 44 dígitos, padrão nacional SEFAZ).
- Perguntado diretamente ao CTO qual deveria ser o mecanismo de reconciliação com o Financial Domain (criar `Invoice` automaticamente / permitir vínculo manual / nenhum cruzamento agora) — resposta: nenhum cruzamento agora, só o campo no `Contract`.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Documento Fiscal só como campos opcionais no `Contract`, sem cruzar domínio** | `fiscalDocumentNumber`/`fiscalDocumentAccessKey`/`fiscalDocumentIssuedAt`, consultável manualmente pelo time financeiro | Escolhida |
| B. Anexar o Documento Fiscal cria `Invoice` automaticamente no Financial Domain | Resolveria a reconciliação de fato, mas exige inventar um mecanismo (quando? com que `amount`/`currency`?) sem fonte | Rejeitada — nenhuma fonte real define esse comportamento; a própria Winnet reconcilia manualmente |
| C. `Invoice` ganha `contractId` opcional, vínculo manual pelo usuário | Menos automático que B, mas ainda cruza domínio sem necessidade confirmada agora | Rejeitada agora — mesmo motivo de C na `ADR-0052` (precificação por canal): escopo maior, sem decisão do CTO sobre o mecanismo, fica para decisão futura |

## Decision

**Opção A.**

- `Contract` ganha três campos opcionais: `fiscalDocumentNumber` (string livre, número da NFe), `fiscalDocumentAccessKey` (string, validada como exatamente 44 dígitos — padrão nacional SEFAZ, fato técnico estável), `fiscalDocumentIssuedAt` (Date). Nenhum efeito em Contracts existentes que não os preencham.
- `updateFiscalDocument(input)` — novo método do Aggregate, mesmo padrão de `Product.updateFiscalLogisticsProfile()`: `undefined` = não mexer, `null` = remover explicitamente. Sem Domain Event (mesmo critério de `Product`/`Pipeline` — objeto de atualização de dado, não transição de negócio).
- Disponível em qualquer `status` do `Contract` (`draft`/`active`/`terminated`) — o documento fiscal é um dado de rastreabilidade, não uma transição de estado, mesmo critério de não adicionar restrição de negócio não confirmada por nenhuma fonte.
- `Application`/`API`: mesmo padrão de `Product` — `UpdateFiscalDocumentCommand`/`Handler` (find→mutate→save), rota `POST /contracts/:id/fiscal-document` no `ContractController` já existente, reaproveitando a mesma Permission (`sales.contracts.manage`) — sem Permission nova.
- `Frontend`: editor inline no card de `Contract` em `/contracts` (número, chave de acesso, data de emissão).
- **Fora de escopo, decisão explícita do CTO**: nenhuma reconciliação automática ou vínculo com o Financial Domain (`Invoice`/`Subscription`). O dado fica disponível só para consulta manual — mesmo nível de automação que a própria Winnet tem hoje.

## Consequences

- Migration Prisma nova: `contracts.fiscal_document_number` (`VARCHAR(20)`), `contracts.fiscal_document_access_key` (`VARCHAR(44)`), `contracts.fiscal_document_issued_at` (`TIMESTAMPTZ`), todos nullable.
- **Achado real durante a implementação**: `PrismaContractRepository.save()` usa `upsert` com um bloco `update:` que lista campos explicitamente (não um `data` genérico) — os três campos novos precisaram ser adicionados manualmente nesse bloco, senão updates em Contracts já existentes silenciosamente não persistiriam o Documento Fiscal (só o `create:` teria o dado).
- Não resolve a reconciliação real Sales↔Financial que a Winnet tem — registrado aqui como decisão explícita de escopo, não como lacuna esquecida. Se o CTO decidir avançar essa fronteira no futuro, a Opção B ou C desta ADR ficam como ponto de partida.
