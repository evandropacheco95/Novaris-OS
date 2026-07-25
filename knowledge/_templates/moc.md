# Template: Map of Content (MOC)

`MOC: _moc/<Categoria>-MOC.md`

## Objetivo

Ser o índice de navegação de uma categoria de `knowledge/` — lista as notas atômicas e os logs de domínio que pertencem a ela, conforme [KNOWLEDGE_CONSTITUTION.md § Artigo 4 e 11](../KNOWLEDGE_CONSTITUTION.md).

## Onde Criar

Sempre em `knowledge/_moc/`, um por categoria já existente em `knowledge/` (`core`, `architecture`, `technical`, `engineering`, `commercial`, `operations`, `brand`). Nunca dentro da própria pasta de domínio.

## Estrutura

```markdown
# <Categoria> — Map of Content

> Índice de navegação. Notas atômicas desta categoria devem estar linkadas aqui (regra anti-órfão, Artigo 7).

## Domínios

- [[dominio-1/README|Domínio 1]] — `decisoes.md` · `aprendizados.md` · `referencias.md`
- [[dominio-2/README|Domínio 2]] — `decisoes.md` · `aprendizados.md` · `referencias.md`

## Notas Atômicas

- [[nota-atomica-1]]
- [[nota-atomica-2]]

## Ver Também

- [[Outra-Categoria-MOC]]
```

## Campos Obrigatórios

| Seção | Descrição |
|---|---|
| Domínios | Lista de subpastas da categoria, linkando seus 3 logs |
| Notas Atômicas | Toda nota atômica `status: active` desta categoria precisa aparecer aqui |
| Ver Também | Links para MOCs de categorias relacionadas |

## Checklist de Manutenção

- [ ] Toda nota atômica nova da categoria foi adicionada aqui antes de virar `status: active`
- [ ] Notas arquivadas (`status: archived`) foram removidas da lista ativa (mas a nota em si não foi apagada)
- [ ] Nenhum domínio da categoria ficou de fora da seção "Domínios"
