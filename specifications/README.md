# Specifications

Especificação funcional de cada domínio/produto da plataforma NOVARIS. Enquanto `docs/02-produto/` guarda personas, preços e o roadmap de produto em nível macro, `specifications/` guarda o detalhamento funcional por domínio: o que existe, como funciona, que dados usa, que API expõe.

## Domínios

- [crm/](crm/README.md)
- [growth/](growth/README.md)
- [automation/](automation/README.md)
- [ai/](ai/README.md)
- [studio/](studio/README.md)
- [analytics/](analytics/README.md)
- [financial/](financial/README.md)
- [marketplace/](marketplace/README.md)
- [projects/](projects/README.md)

Esta lista de 9 domínios segue os 9 produtos já oficiais em [knowledge/core/PRODUCTS.md](../knowledge/core/PRODUCTS.md). Ela reforça, mas não resolve sozinha, o conflito já registrado entre `PRODUCTS.md` (9 produtos) e `NOVARIS_OS.md § 7` (6 produtos) — ver [ADR-0002](../adr/ADR-0002-reestruturar-arvore-do-repositorio.md).

## Estrutura de cada domínio

Cada domínio (Missão 011) possui exatamente 9 arquivos, todos hoje só título + `**TODO**`:

```
<dominio>/
├── overview.md
├── features.md
├── database.md
├── api.md
├── permissions.md
├── events.md
├── integrations.md
├── screens.md
└── roadmap.md
```

## Especificações de Feature (PRDs)

Além da especificação por domínio acima, funcionalidades pontuais não triviais devem ter um PRD nesta mesma pasta, com numeração sequencial (`NNNN-nome-curto-da-feature.md`), mesma lógica dos ADRs em [adr/](../adr/README.md).

### Template de Especificação de Feature

```markdown
# NNNN - Nome da Feature

## Problema
## Usuários Afetados
## Solução Proposta
## Fora de Escopo
## Métricas de Sucesso
## Dependências Técnicas (link para ADR, se houver)
```

### Índice de Especificações de Feature

| # | Feature | Status |
|---|---|---|
| 🚧 Nenhuma especificação criada ainda | | |

## Relação com Outros Módulos

- [NES/README.md](../NES/README.md) — NOVARIS Engineering System, "Documento Mestre de Engenharia"; referencia `specifications/` no Princípio 1 e no Capítulo 6 (Etapas 1 e 6) do fluxo de engenharia

## Status

🚧 Estrutura criada — nenhum conteúdo funcional escrito ainda, nem por domínio nem por feature.
