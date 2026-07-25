# Título

`Release Checklist: <versão>`

## Objetivo

Padronizar o que precisa ser verdade antes de uma versão ser lançada, conectando [CHANGELOG.md](../CHANGELOG.md), [docs/15-changelog-e-versionamento/](../docs/15-changelog-e-versionamento/README.md) e os testes definidos em `engineering/estrategia-de-testes.md`.

## Estrutura

```markdown
# Release Checklist: <versão>

## Escopo da Release
## Checklist Pré-Release
## Checklist de Deploy
## Checklist Pós-Release
## Plano de Rollback
## Aprovação
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| Versão | Número da versão, seguindo [docs/15-changelog-e-versionamento/politica-de-versionamento.md](../docs/15-changelog-e-versionamento/politica-de-versionamento.md) |
| Escopo da Release | O que está incluído (features, correções) |
| Checklist Pré-Release | O que precisa estar pronto antes do deploy |
| Checklist de Deploy | Passos do próprio deploy |
| Checklist Pós-Release | O que verificar depois de publicado |
| Plano de Rollback | Como reverter se algo falhar |
| Aprovação | Quem autorizou a release |

## Checklist

- [ ] `CHANGELOG.md` atualizado com todas as mudanças da release
- [ ] Todos os itens incluídos têm Critério de Aceite cumprido (ver `BACKLOG.md`)
- [ ] Testes relevantes passaram (ver `engineering/estrategia-de-testes.md`)
- [ ] Plano de rollback existe e foi validado antes do deploy, não escrito depois de um problema
- [ ] Aprovação registrada explicitamente antes do deploy começar
