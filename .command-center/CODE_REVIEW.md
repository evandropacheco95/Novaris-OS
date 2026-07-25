# Título

`Code Review: <PR ou mudança avaliada>`

## Objetivo

Padronizar o formato de uma revisão de código, operacionalizando [engineering/diretrizes-de-code-review.md](../engineering/diretrizes-de-code-review.md) em um documento reutilizável.

## Estrutura

```markdown
# Code Review: <PR/mudança>

## O Que Está Sendo Revisado
## Checklist de Revisão
## Comentários
## Decisão
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| PR / Mudança | Referência ao que está sendo revisado |
| Autor | Quem propôs a mudança |
| Revisor | Quem está revisando |
| Checklist de Revisão | Itens verificados (ver checklist abaixo) |
| Comentários | Observações que não bloqueiam, mas devem ser registradas |
| Decisão | `Aprovado` / `Aprovado com ressalvas` / `Mudanças solicitadas` / `Rejeitado` |

## Checklist

- [ ] Aderência à arquitetura documentada em [architecture/](../architecture/README.md)
- [ ] Aderência aos padrões de código em [engineering/padroes-de-codigo.md](../engineering/padroes-de-codigo.md)
- [ ] Testes presentes e cobrindo o caso principal
- [ ] Documentação atualizada no mesmo PR (Constituição, Artigo 14)
- [ ] Nenhuma duplicação de componente/hook/API/função já existente (Constituição, Artigo 16)
- [ ] Segurança — ver [docs/09-seguranca/README.md](../docs/09-seguranca/README.md)
