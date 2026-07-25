# Template: Entrada de Decisão

`Entrada em decisoes.md: <domínio>/decisoes.md`

## Objetivo

Capturar, com baixo atrito, uma decisão local de domínio — sem impacto arquitetural cross-domain (nesse caso, ver [KNOWLEDGE_CONSTITUTION.md § Artigo 11](../KNOWLEDGE_CONSTITUTION.md), que roteia para um ADR real em `adr/`).

## Onde Usar

Como uma entrada anexada ao final do `decisoes.md` do domínio certo. Não cria arquivo novo.

## Estrutura

```markdown
### AAAA-MM-DD — <resumo curto da decisão>

**Decisão:** o que foi decidido, em 1-2 frases.

**Motivo:** por que essa opção e não outra.

**Responsável:** quem decidiu.

**Impacto:** o que muda na prática (se nada mudou fora deste domínio, diga isso).
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| Data | `AAAA-MM-DD`, vira o título da seção |
| Decisão | Frase direta — o que foi decidido |
| Motivo | Justificativa, mesmo que curta |
| Responsável | Quem decidiu |
| Impacto | Efeito prático, ou "nenhum fora deste domínio" |

## Checklist

- [ ] Se a decisão tem impacto cross-domain ou arquitetural, isto deveria ser um ADR em `adr/`, não uma entrada aqui
- [ ] Busquei se uma decisão conflitante já foi registrada antes (Anti-Duplicação, Artigo 5)
- [ ] Se essa decisão for referenciada repetidamente no futuro, considerar graduação para nota atômica (Artigo 4)
