# Template: Entrada de Aprendizado

`Entrada em aprendizados.md: <domínio>/aprendizados.md`

## Objetivo

Capturar, com baixo atrito, uma lição aprendida na prática (o que quebrou, o que funcionou melhor do que esperado, limites descobertos em produção), conforme [KNOWLEDGE_CONSTITUTION.md § Artigo 2](../KNOWLEDGE_CONSTITUTION.md).

## Onde Usar

Como uma entrada anexada ao final do `aprendizados.md` do domínio certo. Não cria arquivo novo.

## Estrutura

```markdown
### AAAA-MM-DD — <resumo curto do aprendizado>

**O que aconteceu:** contexto direto, sem formatação extra.

**O que aprendemos:** a lição em si.

**Aplicação futura:** o que fazer diferente da próxima vez (se houver).
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| Data | `AAAA-MM-DD`, vira o título da seção |
| O que aconteceu | Contexto mínimo necessário para entender a lição |
| O que aprendemos | A lição, direta |
| Aplicação futura | Ação concreta, ou "nenhuma — só registro" |

## Checklist

- [ ] Não é uma decisão (isso vai em `decisoes.md`) nem uma referência externa (isso vai em `referencias.md`)
- [ ] Busquei se um aprendizado parecido já foi registrado (Anti-Duplicação, Artigo 5)
- [ ] Se esse aprendizado já foi referenciado mais de uma vez, considerar graduação para nota atômica (Artigo 4)
