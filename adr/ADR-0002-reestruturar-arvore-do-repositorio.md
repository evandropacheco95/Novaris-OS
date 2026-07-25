# ADR-0002 - Reestruturar a Árvore de Topo do Repositório

## Status

Aceito

## Data

2026-07-14

## Responsável

Decisão de produto/negócio: usuário (liderança da NOVARIS). Execução: Engenheiro Principal (assistente de IA), sob o protocolo operacional de [.claude/rules.md](../.claude/rules.md).

## Contexto

O repositório nasceu com toda a documentação organizada sob apenas duas raízes: `docs/` (documentação de referência) e `knowledge/` (memória institucional). Categorias como arquitetura, engenharia, ADRs, especificações de feature e conhecimento de negócio viviam como subpastas dentro dessas duas árvores. O usuário determinou que essas categorias devem ser promovidas a pastas de primeiro nível, como pares de `docs/` e `knowledge/`, e que o repositório também deve ganhar scaffolding vazio para o futuro código do monorepo (`apps/`, `packages/`, `services/`, `sdk/`, `database/`, `infrastructure/`, `scripts/`, `tools/`, `design-system/`, `tests/`, `templates/`).

## Alternativas Consideradas

1. **Manter tudo dentro de `docs/`/`knowledge/`** — rejeitada; contraria a instrução explícita do usuário de promover essas categorias a pastas de topo.
2. **Criar as pastas novas vazias, sem migrar conteúdo existente** — considerada e rejeitada após pergunta de esclarecimento (`AskUserQuestion`); o usuário confirmou que o conteúdo já escrito deve ser migrado, não duplicado.
3. **Migrar todo `knowledge/` e `docs/` para as pastas novas** — rejeitada; o usuário confirmou escopo específico (ver "Impactos" abaixo), deixando fora `docs/12-negocio/`, `knowledge/core/*` e as demais categorias de `knowledge/`.

## Decisão

Promover a pastas de topo: `adr/` (ex-`docs/01-arquitetura/decisoes/`), `architecture/` (ex-`docs/01-arquitetura/`, restante), `engineering/` (ex-`docs/03-engenharia/`), `specifications/` (ex-`docs/02-produto/especificacoes-de-features/`, mais uma subestrutura de 9 domínios de produto — ver Missão 011 registrada em `specifications/README.md`), `business/` (ex-`knowledge/business/`) e `playbooks/` (ex-`knowledge/playbooks/`).

Criar como scaffolding vazio, cada uma com `README.md` de estrutura apenas: `apps/`, `packages/`, `services/`, `sdk/`, `database/`, `infrastructure/`, `scripts/`, `tools/`, `design-system/`, `tests/`, `templates/`.

`agents/`, `.claude/`, `docs/` (restante) e `knowledge/` (restante) não são afetados por esta decisão.

## Plano de Migração

1. Criar as 17 pastas novas.
2. Mover os arquivos das origens confirmadas para os destinos, preservando conteúdo.
3. Recalcular todos os links relativos internos afetados pela mudança de profundidade.
4. Varrer o repositório inteiro por referências aos caminhos antigos e corrigi-las.
5. Escrever `README.md` de índice em cada pasta nova.
6. Registrar a divergência com a proposta anterior em `knowledge/core/MONOREPO_ARCHITECTURE.md` sem resolvê-la silenciosamente.
7. Este ADR + entrada em `CHANGELOG.md`.

## Impactos

- **Positivas**: estrutura de repositório mais próxima de uma raiz de monorepo enterprise real; categorias de alto tráfego (arquitetura, engenharia, ADRs) deixam de ficar aninhadas fundo em `docs/`.
- **Negativas / riscos**: quebra de links é o principal risco — mitigado pela varredura sistemática (passo 4). `knowledge/core/MONOREPO_ARCHITECTURE.md` já propunha uma árvore de código diferente (`integrations/`, `supabase/`) que diverge desta; a divergência fica registrada, não resolvida por este ADR.
- **Pendências que este ADR não resolve**: os 9 domínios de `specifications/` reforçam a lista de 9 produtos de `PRODUCTS.md`, mas não resolvem o conflito já existente com a lista de 6 produtos de `NOVARIS_OS.md § 7`.

## Consequências

Toda referência futura a arquitetura, ADRs, engenharia, especificações de feature, conhecimento de negócio ou playbooks deve usar as novas pastas de topo. `docs/01-arquitetura/`, `docs/03-engenharia/`, `docs/02-produto/especificacoes-de-features/`, `knowledge/business/` e `knowledge/playbooks/` deixam de existir.
