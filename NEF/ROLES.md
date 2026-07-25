# NEF — Papéis (Roles)

Versão: 1.0.0

Status: Oficial

---

## Objetivo

Formalizar os papéis humanos e de IA envolvidos no ciclo de vida de engenharia da NOVARIS, conforme pedido pela Ordem de Missão NEF-001.

## ✅ Nota de Consolidação (resolvida por ENG-0000.5)

Esta era a **terceira** lista de papéis do repositório. [ADR-0008](../adr/ADR-0008-foundation-freeze.md) (Missão ENG-0000.5, Foundation Freeze) resolveu:

- **Este documento** é a definição oficial única de papéis de **governança de engenharia** (12 papéis: 7 humanos + 5 de IA).
- [NES/README.md § Capítulo 4](../NES/README.md) (CEO, Chief System Architect, Principal Software Engineer, Agentes de IA) — corpo verbatim não alterado; redirecionado para este documento (ver a "Relação com Outros Módulos" do NES).
- [agents/](../agents/README.md) (12 arquivos: CEO, Commercial, CRM, Finance, Marketing, Growth, Automation, Support, Developer, Designer, ProjectManager, CustomerSuccess) **não é fundido aqui** — é escopo diferente e complementar: perfis de agente de IA de **automação de negócio/produto**, não papéis de **governança de engenharia**. Os dois convivem sem sobreposição de responsabilidade.

---

## Papéis Humanos

### CTO

**Objetivo**: responsável final por toda decisão técnica da NOVARIS.
**Responsabilidades**: aprova ADRs de maior impacto, aprova o NEF e suas revisões, dirime conflito entre Solution Architects.
**Interface**: aprova o que Solution Architect propõe; delega execução a Tech Lead.

### Solution Architect

**Objetivo**: desenha a arquitetura de um domínio ou serviço, dentro dos limites já definidos em [DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md)/[SYSTEM_ARCHITECTURE.md](../knowledge/core/SYSTEM_ARCHITECTURE.md).
**Responsabilidades**: redige ADRs, valida que uma implementação respeita o [ENGINEERING_PLAYBOOK.md](../knowledge/engineering/ENGINEERING_PLAYBOOK.md).
**Interface**: reporta ao CTO; orienta Tech Leads.

### Tech Lead

**Objetivo**: lidera a implementação de um serviço ou domínio específico.
**Responsabilidades**: divide missões em tasks, garante que a equipe segue o [Planning Model](PLANNING_MODEL.md) e os checklists do [Pilar 9](09-checklists/README.md).
**Interface**: recebe direção de Solution Architect; distribui trabalho a Senior Engineers.

### Senior Engineer

**Objetivo**: implementa código seguindo o [ENGINEERING_PLAYBOOK.md](../knowledge/engineering/ENGINEERING_PLAYBOOK.md).
**Responsabilidades**: escreve Domain/Application/Infrastructure Layer, escreve testes, participa de code review.
**Interface**: recebe tasks de Tech Lead; colabora com QA e AI Engineer.

### QA

**Objetivo**: garante que a Definition of Done ([ENGINEERING_PLAYBOOK.md § 19](../knowledge/engineering/ENGINEERING_PLAYBOOK.md#19-definition-of-done)) é cumprida antes de qualquer release.
**Responsabilidades**: define e executa testes de integração/contrato/E2E ([ENGINEERING_PLAYBOOK.md § 15](../knowledge/engineering/ENGINEERING_PLAYBOOK.md#15-testes)).
**Interface**: bloqueia release se DoD não cumprida; reporta a Tech Lead.

### DevOps

**Objetivo**: mantém `infrastructure/`, pipelines de CI/CD e ambientes de deploy.
**Responsabilidades**: [infrastructure/docker/, ci/, deployment/](../infrastructure/README.md); observabilidade ([ENGINEERING_PLAYBOOK.md § 12](../knowledge/engineering/ENGINEERING_PLAYBOOK.md#12-observabilidade)).
**Interface**: colabora com Tech Lead e QA no processo de release.

### AI Engineer

**Objetivo**: implementa e mantém `services/kernel/ai-runtime/`, `packages/ai/` e a integração de IA nos demais serviços.
**Responsabilidades**: garante que toda IA segue [NOVARIS_CONSTITUTION.md Article XII](../knowledge/core/NOVARIS_CONSTITUTION.md) (nunca acessa dados diretamente, sempre via AI Runtime).
**Interface**: colabora com Solution Architect na fronteira entre lógica de domínio e capacidade de IA.

---

## Papéis de Agentes de IA

### Architect AI

**Objetivo**: assiste Solution Architect — propõe estrutura, identifica impacto e dependências (Fases 1-5 do [EXECUTION_PROTOCOL.md](../.command-center/EXECUTION_PROTOCOL.md)).
**Restrição**: não aprova sozinho — Fase 6 (Validação) exige humano.

### Engineer AI

**Objetivo**: assiste Senior Engineer na implementação, seguindo o [ENGINEERING_PLAYBOOK.md](../knowledge/engineering/ENGINEERING_PLAYBOOK.md) e os templates de [knowledge/engineering/templates/](../knowledge/engineering/templates/README.md).
**Restrição**: nunca implementa código de negócio sem plano aprovado (mesma regra seguida em toda esta sessão).

### Reviewer AI

**Objetivo**: aplica o checklist de PR ([ENGINEERING_PLAYBOOK.md § 18](../knowledge/engineering/ENGINEERING_PLAYBOOK.md#18-pull-request-checklist)) antes de um humano revisar.
**Restrição**: sinaliza, não aprova PR sozinho.

### QA AI

**Objetivo**: assiste QA na geração e execução de casos de teste.
**Restrição**: não substitui validação humana de aceite de negócio.

### Documentation AI

**Objetivo**: mantém documentação, `CHANGELOG.md` e referências cruzadas atualizadas a cada mudança — o papel mais próximo do que este próprio processo (NES-001 a NEF-001) já vem exercendo nesta sessão.
**Restrição**: nunca inventa conteúdo de negócio ou decisão arquitetural sem base documental ([CONSTITUTION.md § Artigo 13](../knowledge/core/CONSTITUTION.md)).

---

## Relação com Outros Módulos

- [agents/](../agents/README.md) — papéis de agente de negócio já existentes; não sobrepostos com os de IA de engenharia acima
- [NES/README.md § Capítulo 4](../NES/README.md) — terceira lista de papéis, não reconciliada
- [PLANNING_MODEL.md](PLANNING_MODEL.md) — quem executa cada nível do modelo de planejamento

## Status

🟢 Oficial (v1.0.0). 12 papéis definidos. Sobreposição com `agents/` e `NES.md § Capítulo 4` registrada, não resolvida.
