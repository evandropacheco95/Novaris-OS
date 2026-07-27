# .github

Configurações do GitHub para o repositório NOVARIS: templates de issues, template de pull request, `CODEOWNERS` e workflow de CI (GitHub Actions).

## Conteúdo

| Arquivo/Pasta | Propósito |
|---|---|
| `ISSUE_TEMPLATE/` | Templates padronizados para reportar bugs e propor features |
| `PULL_REQUEST_TEMPLATE.md` | Checklist padrão exigido em todo Pull Request |
| `CODEOWNERS` | Estrutura de responsabilidade por pasta — dono real atribuído (`ENS-0004`) |
| `workflows/ci.yml` | Build+lint+test do monorepo (`pnpm`/Turborepo) em todo push/PR para `master` (`ENS-0004`) — exigido como status check pela branch protection |

## Status

🟢 CI mínimo implementado (`ENS-0004`) — `workflows/ci.yml` roda `pnpm build lint test`, exigido como gate obrigatório de merge na `master`. Ver [engineering/git-workflow.md](../engineering/git-workflow.md) para a política completa de branch/merge.
