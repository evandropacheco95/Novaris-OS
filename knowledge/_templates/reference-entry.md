# Template: Entrada de Referência

`Entrada em referencias.md: <domínio>/referencias.md`

## Objetivo

Registrar material externo relevante (artigo, documentação de terceiros, benchmark, ferramenta avaliada) para o domínio, conforme [KNOWLEDGE_CONSTITUTION.md § Artigo 2](../KNOWLEDGE_CONSTITUTION.md).

## Onde Usar

Como uma entrada anexada ao final do `referencias.md` do domínio certo, ou em `knowledge/references/` se for transversal a mais de um domínio.

## Estrutura

```markdown
### <título da fonte>

**Link:** URL ou caminho.

**Por que importa:** 1-2 frases sobre a relevância para a NOVARIS.

**Data de captura:** AAAA-MM-DD.
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| Título | Nome da fonte externa |
| Link | URL ou caminho de arquivo |
| Por que importa | Relevância — sem isso a referência não tem valor de busca futura |
| Data de captura | `AAAA-MM-DD` |

## Checklist

- [ ] A referência sozinha não é conhecimento — se exigir síntese/comentário além da fonte, considerar nota atômica em vez de só uma entrada aqui (Artigo 4)
- [ ] Busquei se essa fonte já foi registrada antes (Anti-Duplicação, Artigo 5)
- [ ] Se for transversal a múltiplos domínios, considerar `knowledge/references/` em vez do log de um domínio específico
