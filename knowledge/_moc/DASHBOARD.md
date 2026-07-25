# Knowledge OS — Dashboard

> Visão geral do estado do vault. As queries abaixo exigem o plugin comunitário **Dataview** — se ele não estiver instalado, o Dashboard é opcional (o sistema de conhecimento funciona 100% sem ele, ver [KNOWLEDGE_CONSTITUTION.md](../KNOWLEDGE_CONSTITUTION.md)); use a checklist manual como alternativa.

## Notas Recentes (requer Dataview)

```dataview
table updated as "Atualizado", domain as "Domínio", status as "Status"
from "knowledge"
where type = "atomic"
sort updated desc
limit 15
```

## Notas em Rascunho (requer Dataview)

```dataview
list
from "knowledge"
where type = "atomic" and status = "draft"
```

## Verificação Manual (sem Dataview)

- [ ] Todo log de domínio (`decisoes.md`/`aprendizados.md`/`referencias.md`) com entradas novas desde a última revisão foi avaliado para graduação (Artigo 4)
- [ ] Nenhuma nota atômica ficou órfã (sem link de entrada/saída — Artigo 7)
- [ ] Todo MOC (`_moc/*.md`) reflete as notas atômicas `status: active` reais de sua categoria

## Mapas de Conteúdo

- [[Core-MOC]] · [[Architecture-MOC]] · [[Technical-MOC]] · [[Engineering-MOC]] · [[Commercial-MOC]] · [[Operations-MOC]] · [[Brand-MOC]]
