# NOVARIS ENGINEERING SYSTEM (NES)

Versão: 1.0
Status: Oficial
Classificação: Documento Mestre de Engenharia

---

# CAPÍTULO 1 — PROPÓSITO

O NOVARIS Engineering System (NES) é o conjunto oficial de princípios, protocolos, padrões e processos que governam toda a engenharia da plataforma NOVARIS.

Todo desenvolvedor, agente de IA, colaborador técnico ou parceiro que contribua com o projeto deve seguir este documento.

O NES tem como objetivos:

- Padronizar o desenvolvimento.
- Reduzir retrabalho.
- Garantir escalabilidade.
- Garantir consistência técnica.
- Centralizar conhecimento.
- Permitir que agentes de IA trabalhem com previsibilidade.

---

# CAPÍTULO 2 — PRINCÍPIOS FUNDAMENTAIS

## Princípio 1 — A documentação é a fonte de verdade

Nenhuma implementação pode contradizer a documentação oficial.

Ordem de prioridade:

1. CONSTITUTION.md
2. NOVARIS_OS.md
3. ADRs
4. Specifications
5. Arquitetura
6. Código

---

## Princípio 2 — Nenhuma implementação começa pelo código

Fluxo obrigatório:

Entendimento → Planejamento → Aprovação → Implementação → Testes → Documentação

---

## Princípio 3 — Reutilização

Antes de criar qualquer artefato é obrigatório verificar a existência de:

- Componentes
- Hooks
- APIs
- Serviços
- Tabelas
- Tipos
- Funções
- Utilitários

Duplicação é proibida sem justificativa documentada.

---

## Princípio 4 — Modularidade

Cada domínio deve ser independente.

A comunicação entre domínios ocorre por interfaces e eventos definidos.

---

## Princípio 5 — IA como aceleradora

A IA auxilia a engenharia, mas não substitui validações humanas em decisões críticas.

---

# CAPÍTULO 3 — HIERARQUIA DOS DOCUMENTOS

1. Constituição
2. NES
3. ADR
4. Specifications
5. Architecture
6. Knowledge Base
7. Playbooks
8. Código

Em caso de conflito, prevalece o documento de maior prioridade.

---

# CAPÍTULO 4 — PAPÉIS

## CEO

- Define visão.
- Aprova prioridades.
- Aprova mudanças estratégicas.

## Chief System Architect

Responsável por:

- Arquitetura
- Banco
- Engenharia
- Regras
- ADRs
- Evolução técnica

## Principal Software Engineer

Responsável por:

- Implementação
- Refatoração
- Testes
- Deploy
- Documentação

## Agentes de IA

Responsáveis por executar tarefas específicas conforme seu escopo.

---

# CAPÍTULO 5 — PROTOCOLO DE MISSÃO

Toda atividade inicia obrigatoriamente por uma Ordem de Missão.

Estrutura:

- ID
- Objetivo
- Contexto
- Escopo
- Restrições
- Dependências
- Critérios de aceite
- Plano de validação
- Plano de rollback

Nenhuma missão pode ser executada sem esses campos.

---

# CAPÍTULO 6 — FLUXO DE ENGENHARIA

## Etapa 1 — Entendimento

Ler:

- NOVARIS_OS.md
- CONSTITUTION.md
- ADRs relacionados
- Specifications
- Documentação do módulo

Objetivo:

Compreender o problema.

---

## Etapa 2 — Planejamento

Obrigatório responder:

- O problema está claro?
- Há solução existente?
- Existe impacto?
- Há dependências?
- Quais arquivos serão alterados?
- Existe risco?

Produzir:

- Plano técnico
- Checklist
- Estimativa

---

## Etapa 3 — Aprovação

Nenhuma implementação inicia antes da aprovação.

---

## Etapa 4 — Implementação

Regras:

- Código limpo.
- Sem duplicação.
- Comentários apenas quando agregam contexto.
- Tipagem obrigatória.
- Tratamento de erros.
- Logs relevantes.

---

## Etapa 5 — Testes

Obrigatório validar:

- Fluxo feliz
- Fluxos alternativos
- Casos de erro
- Permissões
- Performance
- Regressão

---

## Etapa 6 — Documentação

Atualizar:

- Specifications
- Changelog
- ADR (quando necessário)
- Knowledge Base

---

# CAPÍTULO 7 — PADRÕES DE DESENVOLVIMENTO

## Linguagem

TypeScript obrigatório.

## Framework

Next.js.

## UI

Shadcn/UI.

## CSS

Tailwind CSS.

## Banco

Supabase/PostgreSQL.

## Autenticação

Supabase Auth.

## Versionamento

Git.

## Deploy

Vercel.

---

# CAPÍTULO 8 — PROTOCOLO DE BANCO DE DADOS

Antes de criar qualquer tabela:

1. Verificar existência.
2. Verificar relacionamento.
3. Definir domínio.
4. Definir owner.
5. Definir RLS.
6. Definir índices.
7. Definir auditoria.
8. Criar migration.
9. Atualizar documentação.

É proibido criar tabelas sem migration versionada.

---

# CAPÍTULO 9 — PADRÕES DE API

Toda API deve possuir:

- Objetivo
- Autenticação
- Autorização
- Versionamento
- Logs
- Tratamento de erros
- Documentação

Endpoints não documentados são considerados inválidos.

---

# CAPÍTULO 10 — FRONTEND

Antes de criar telas:

Pesquisar:

- Componentes
- Layouts
- Design System
- Tokens
- Ícones

Preferir reutilização.

---

# CAPÍTULO 11 — BACKEND

Todo serviço deve:

- Ser desacoplado.
- Possuir responsabilidade única.
- Ser testável.
- Ser documentado.
- Não acessar módulos sem interface definida.

---

# CAPÍTULO 12 — SEGURANÇA

Obrigatório:

- RLS em todas as tabelas.
- Validação de permissões.
- Logs de auditoria.
- Sanitização de entrada.
- Princípio do menor privilégio.

---

# CAPÍTULO 13 — OBSERVABILIDADE

Todo módulo deve gerar:

- Logs
- Métricas
- Eventos
- Alertas (quando aplicável)

---

# CAPÍTULO 14 — CRITÉRIOS DE CONCLUSÃO

Uma tarefa somente pode ser considerada concluída quando:

- Código implementado.
- Testes executados.
- Documentação atualizada.
- Changelog atualizado.
- Revisão realizada.
- Critérios de aceite atendidos.

Caso contrário, a tarefa permanece "Em andamento".

---

# CAPÍTULO 15 — PROTOCOLO PARA AGENTES DE IA

Todo agente deve:

1. Ler contexto.
2. Identificar domínio.
3. Consultar documentação.
4. Planejar.
5. Solicitar aprovação quando necessário.
6. Executar.
7. Validar.
8. Documentar.

É proibido:

- Inventar regras de negócio.
- Ignorar documentação.
- Alterar arquitetura sem ADR.
- Criar soluções duplicadas.

---

# CAPÍTULO 16 — EVOLUÇÃO CONTÍNUA

Toda melhoria deve ser registrada.

Fluxo:

Problema → Análise → ADR → Aprovação → Implementação → Documentação → Monitoramento.

---

# APÊNDICE A — CHECKLIST DE IMPLEMENTAÇÃO

- Objetivo definido.
- Escopo definido.
- Dependências identificadas.
- ADR consultado.
- Specification consultada.
- Banco analisado.
- APIs analisadas.
- Componentes pesquisados.
- Plano técnico aprovado.
- Código implementado.
- Testes executados.
- Documentação atualizada.
- Changelog atualizado.

---

# APÊNDICE B — DEFINIÇÃO DE PRONTO (Definition of Done)

Uma funcionalidade está pronta quando:

- Resolve o problema proposto.
- Atende aos critérios de aceite.
- Está documentada.
- Está testada.
- Está integrada.
- Não gera regressões conhecidas.
- Está alinhada ao NES.

---

## Relação com Outros Módulos

*(Seção adicionada na integração ao repositório — "Ordem de Missão NES-001". Não faz parte do texto original do NES; os 16 capítulos e 2 apêndices acima permanecem exatamente como recebidos.)*

- [knowledge/core/NOVARIS_OS.md](../knowledge/core/NOVARIS_OS.md) — fonte oficial da visão da plataforma; o NES é a fonte oficial de como essa visão é construída em engenharia
- [knowledge/core/CONSTITUTION.md](../knowledge/core/CONSTITUTION.md) — Constituição detalhada; o NES § Capítulo 2 e § Capítulo 3 propõem hierarquias que citam a Constituição mas divergem entre si e do restante da governança — ver a nota de conflitos em [PROJECT_RULES.md](../PROJECT_RULES.md)
- [knowledge/core/SYSTEM_ARCHITECTURE.md](../knowledge/core/SYSTEM_ARCHITECTURE.md) — arquitetura de sistema; os capítulos 6 (Banco), 7 (APIs), 8 (Frontend), 9 (Backend) do NES se relacionam diretamente com este documento
- [adr/](../adr/README.md) — decisões de arquitetura; o NES § Capítulo 3 posiciona ADRs logo abaixo do NES na hierarquia proposta
- [specifications/](../specifications/README.md) — especificação funcional por domínio; referenciada pelo NES em Princípio 1, Capítulo 6 (Etapa 1 e Etapa 6) e Apêndice A
- [NEF/ROLES.md](../NEF/ROLES.md) — desde [ADR-0008](../adr/ADR-0008-foundation-freeze.md) (Missão ENG-0000.5), é a definição oficial de papéis de governança de engenharia; os papéis do NES § Capítulo 4 (CEO, Chief System Architect, Principal Software Engineer) permanecem aqui como texto original, não alterado
- [NEF/README.md](../NEF/README.md) e [knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md](../knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md) — desde [ADR-0009](../adr/ADR-0009-engineering-entry-point-authority.md) (Missão DOC-0001), são os pontos de entrada correntes de engenharia (estrutura de referência e leitura linear, respectivamente); este documento não é mais autoridade ativa para nenhum assunto vigente, apenas registro histórico

## Status

🟡 Histórico (v1.0) — redirecionado para [NEF/](../NEF/README.md) (estrutura) e [NOVARIS_ENGINEERING_HANDBOOK.md](../knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md) (narrativa) por [ADR-0009](../adr/ADR-0009-engineering-entry-point-authority.md) (Missão DOC-0001). Corpo preservado verbatim, integrado ao repositório em `NES/README.md`. Ver relatório de integração em [PROJECT_RULES.md](../PROJECT_RULES.md).
