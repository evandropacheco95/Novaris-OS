# Knowledge

Memória permanente da NOVARIS, organizada por categoria e, dentro dela, por domínio.

## Documento Oficial

📖 [knowledge/core/NOVARIS_OS.md](core/NOVARIS_OS.md) — a fonte oficial da visão da plataforma NOVARIS (v1.0.0, Oficial). Toda decisão arquitetural do projeto deve respeitar este documento.

## Gestão do Conhecimento (Knowledge OS)

📜 [KNOWLEDGE_CONSTITUTION.md](KNOWLEDGE_CONSTITUTION.md) — regras operacionais de criação, nomenclatura, metadados, links, versionamento, arquivamento e papel da IA para todo conhecimento registrado aqui ([ADR-0025](../adr/ADR-0025-knowledge-os-foundation.md), subordinado a `CONSTITUTION.md` Art. 20).

- [_moc/](_moc/DASHBOARD.md) — Maps of Content por categoria (navegação) e Dashboard
- [_templates/](_templates/atomic-note.md) — templates de nota atômica, decisão, aprendizado, referência e MOC

## Categorias

- [architecture/](architecture/README.md) — arquitetura de negócio (Business/Domain Layer): mapeamento e canonicalização de Bounded Contexts, relacionamentos estratégicos, decisões de ownership/domínio, análises de evidência e governança arquitetural (EPIC-007 em diante, `ENG-0009`+). Não listada aqui até `ENG-0021` — corrigido por Documentation Hygiene.
- [core/](core/README.md) — documentos imutáveis: NOVARIS_OS, company, vision, manifesto, constitution, culture, principles
- [technical/](technical/README.md) — arquitetura, engenharia, frontend, backend, integração-ia, automação, infraestrutura, segurança
- [engineering/](engineering/README.md) — `ENGINEERING_PLAYBOOK.md` (padrão de arquitetura de serviço: Clean Architecture, DDD) + templates (Missão ENG-0000.3). ⚠️ Terceiro local com "engenharia/engineering" no nome, junto de [engineering/](../engineering/README.md) (raiz) e [technical/engenharia/](technical/engenharia/README.md) — escopos diferentes, nomes parecidos, registrado no próprio playbook
- [commercial/](commercial/README.md) — clientes
- [operations/](operations/README.md) — operações, pessoas-e-equipe
- [brand/](brand/README.md) — design
- [references/](references/README.md) — referências externas transversais (vazia, aguardando conteúdo)

> ⚠️ **Movidas para a raiz do repositório** (ver [ADR-0002](../adr/ADR-0002-reestruturar-arvore-do-repositorio.md)): `business/` (produto, mercado, negócio, legal) agora é [../business/](../business/README.md); `playbooks/` agora é [../playbooks/](../playbooks/README.md). Deixaram de ser categorias de `knowledge/`.

## Padrão de Cada Domínio

Cada domínio (dentro de business/technical/commercial/operations/brand) contém `README.md`, `decisoes.md`, `aprendizados.md`, `referencias.md`, cada um com:

- **Objetivo** — por que esse documento existe
- **Escopo** — o que ele cobre e o que não cobre
- **Responsabilidades** — quem mantém e alimenta
- **Relação com Outros Módulos** — como se conecta a `docs/`, `agents/` e outros domínios de `knowledge/`
- **Campos Reservados para Futuras Expansões** — o que ainda falta detalhar

`core/` segue um padrão próprio — documentos imutáveis mantidos exclusivamente pela liderança, sem `decisoes.md`/`aprendizados.md`/`referencias.md`.

🚧 Estrutura criada — descrição inicial em cada documento. Conteúdo completo a ser desenvolvido.
