# BUSINESS OBJECT MODEL (BOM)

Versão: 1.0.0
Status: Documento Oficial
Autoridade: Chief System Architect

---

# 1. OBJETIVO

O Business Object Model (BOM) define todos os objetos centrais da plataforma NOVARIS.

Este documento é a principal referência para:

- Banco de dados
- APIs
- Frontend
- Backend
- Eventos
- Inteligência Artificial
- Automações
- Relatórios
- Dashboards
- Integrações

Nenhuma entidade poderá ser criada sem estar descrita neste documento ou em uma extensão aprovada por ADR.

---

# 2. PRINCÍPIOS

Todo objeto deve:

- Representar um conceito real de negócio.
- Possuir identidade própria.
- Ser reutilizável por múltiplos domínios.
- Possuir responsabilidades claras.
- Ser independente de interface.
- Ser independente de tecnologia.

---

# 3. CLASSIFICAÇÃO DOS OBJETOS

Os objetos são divididos em cinco categorias:

1. Core Objects
2. Business Objects
3. Intelligence Objects
4. Analytics Objects
5. System Objects

---

# 4. CORE OBJECTS

## Organization

📄 Especificação individual completa: [objects/Organization.md](objects/Organization.md)

Representa uma empresa ou organização que utiliza a plataforma.

Atributos principais:

- id
- name
- slug
- legal_name
- document
- organization_type
- status
- settings
- created_at
- updated_at

Relacionamentos:

- Users
- Teams
- Workspaces
- Pipelines
- Projects
- Assets
- Workflows

Eventos:

- OrganizationCreated
- OrganizationUpdated
- OrganizationArchived

---

## Workspace

Representa um ambiente lógico de trabalho dentro de uma organização.

---

## User

📄 Especificação individual (parcial): [objects/User.md](objects/User.md)

Representa um usuário autenticado.

Relacionamentos:

- Organization
- Roles
- Teams
- Tasks
- Activities

Eventos:

- UserCreated
- UserInvited
- UserActivated
- UserDisabled

---

## Role

📄 Especificação individual (parcial): [objects/Role.md](objects/Role.md)

Define funções e permissões.

Exemplos:

- Admin
- Manager
- Sales
- Broker
- Marketing
- Finance

---

## Permission

📄 Especificação individual (parcial): [objects/Permission.md](objects/Permission.md)

Representa uma permissão granular.

Exemplo:

crm.leads.read

crm.leads.create

financial.invoice.delete

---

## Team

Agrupamento de usuários.

---

## Party

Representa uma entidade de negócio (pessoa ou organização) que pode participar de processos.

Especializações:

- Person
- Organization (externa)

> **Nota de Extensão (`ADR-0025`)**: campos mínimos de conteúdo, antes ausentes deste catálogo — `name` (obrigatório, nome da pessoa ou razão social) e `document` (opcional, CPF/CNPJ). Demais dados de contato (`Contact`/`Address`/`Phone`/`Email`/`Social Profile`) permanecem bloqueados, sem entrada própria neste catálogo.

---

## Person

Pessoa física.

---

## External Organization

Empresa externa (cliente, fornecedor, parceiro etc.).

---

## Relationship

Representa o vínculo entre Parties.

Tipos possíveis:

- Cliente
- Fornecedor
- Parceiro
- Prospect
- Investidor
- Colaborador

---

## Document

Documento de negócio.

---

## File

Arquivo armazenado.

---

## Asset

Recurso digital.

> **Nota de Extensão (`ADR-0048`, `ENG-0153`)**: posse resolvida — Internal Entity do Aggregate `Campaign` (Marketing Domain), referenciando um `FileRecord` (Kernel, `@novaris/files`) por id. Não duplica o conceito de armazenamento de arquivo — só associa um `FileRecord` já enviado a uma Campaign. Campos: `fileRecordId`, `addedAt`. Sem Domain Event.

---

## Tag

Etiqueta reutilizável.

---

## CustomField

Campo personalizado.

---

## Activity

Registro de interação.

Tipos:

- Ligação
- WhatsApp
- E-mail
- Reunião
- Visita
- Nota

Eventos:

- ActivityCreated
- ActivityCompleted

> **Nota de Extensão (`ADR-0032`)**: campos mínimos de conteúdo — `partyId` (obrigatório), `status` (`"open" | "completed"`, derivado dos 2 eventos acima), `notes` (opcional).

---

## Task

Tarefa operacional.

Estados:

- Pending
- In Progress
- Completed
- Cancelled

> **Nota de Extensão (`ADR-0030`)**: campo mínimo de conteúdo, antes ausente deste catálogo — `title` (obrigatório). Confirmado Internal Entity de `Project` (`ADR-0026`), não Aggregate Root.

---

## Timeline

Linha do tempo consolidada dos eventos de um objeto.

---

## Notification

Mensagem enviada ao usuário.

---

## Comment

Comentário associado a qualquer objeto.

> **Nota de Implementação (`ADR-0043`, `ENG-0144`)**: implementado como Aggregate Root do `ACTIVITY DOMAIN` (Owner já confirmado por `ENG-0132`), adaptado do Salesforce Chatter. `targetType` permanece deliberadamente `string` livre, sem enum fechado — o próprio propósito polimórfico descrito acima exige isso.

---

## Case

Registro de atendimento/suporte a um Party, adaptado do Salesforce Service Cloud.

Estados:

- New
- In Progress
- Closed

Prioridades:

- Low
- Medium
- High

Eventos:

- CaseCreated
- CaseClosed

> **Nota de Extensão (`ADR-0043`, `ENG-0144`)**: objeto novo, adicionado por autorização direta do CTO ("adapte tudo do salesforce para o Novaris"). Owner de domínio: `ACTIVITY DOMAIN`, por analogia estrutural com `Activity` (registro com ciclo de status referenciando um Party). Campos mínimos: `partyId` (obrigatório), `subject` (obrigatório), `description` (opcional), `status`, `priority`.

---

# 5. BUSINESS OBJECTS

## Opportunity

Representa uma oportunidade comercial.

Relacionamentos:

- Party
- Pipeline
- Stage
- Activities
- Tasks
- Proposal
- Contract

Eventos:

- OpportunityCreated
- OpportunityWon
- OpportunityLost

---

## Pipeline

Fluxo de trabalho configurável.

---

## Stage

Etapa de um Pipeline.

---

## Proposal

Proposta comercial.

---

## Product

Item de catálogo interno, adaptado do Salesforce Product2.

> **Nota de Extensão (`ADR-0043`, `ENG-0144`)**: objeto novo, adicionado por autorização direta do CTO. Owner de domínio: `SALES DOMAIN` (suporta `Quotation` via linha de item). Campos mínimos: `name` (obrigatório), `sku` (opcional), `unitPrice` (obrigatório, `>= 0`), `active` (padrão `true`). Um único preço por Product — sem múltiplos Price Books nomeados, sem evidência de necessidade.

---

## Quotation

Documento de precificação formal vinculado a uma Opportunity, adaptado do Salesforce Quote. Preenche a lacuna estrutural reservada desde `ADR-0020` ("distinto de Proposal, não sinônimo").

Estados:

- Draft
- Sent
- Accepted
- Rejected

Eventos:

- QuotationCreated
- QuotationAccepted
- QuotationRejected

> **Nota de Extensão (`ADR-0043`, `ENG-0144`)**: Aggregate Root próprio (não Internal Entity de `Opportunity` — uma Opportunity pode ter múltiplas Quotations). `QuotationLineItem` (Internal Entity): `productId`, `quantity` (`> 0`), `unitPrice` (snapshot resolvido do `Product` no momento da adição, nunca aceito do cliente).

---

## Contract

Contrato.

> **Nota de Extensão (`ADR-0044`, `ENG-0145`)**: implementado como Aggregate Root do `SALES DOMAIN`, gerado exclusivamente a partir de uma `Quotation` `accepted` (nunca automático). Estados: `Draft → Active → Terminated` (sem reversão). Campos mínimos: `opportunityId`, `quotationId` (rastreabilidade), `status`. Último objeto oficial do Sales Domain com posição resolvida — só `Revenue` permanece sem forma definida.

---

## Invoice

Documento financeiro.

> **Nota de Extensão (`ADR-0031`)**: campos mínimos de conteúdo — `amount` (obrigatório), `currency` (obrigatório), `status` (`"pending" | "paid"`, transição para `"paid"` via `markPaid()`, dispara o evento oficial `InvoicePaid`), `subscriptionId` (opcional, `ADR-0027`). `Payment` não é implementado como objeto próprio — representado pela ação `markPaid()`.

---

## Payment

Pagamento.

---

## Revenue

Receita.

> **Nota de Extensão (`ADR-0047`, `ENG-0152`)**: implementado como Aggregate Root do `SALES DOMAIN`, gerado a partir de um `Contract` `active` (nunca criação manual avulsa). Campos mínimos: `contractId` (rastreabilidade), `amount`, `currency`, `recognizedAt`. Registro pontual e imutável, sem `status` — múltiplos Revenue podem existir para o mesmo Contract (reconhecimento incremental). Fecha o último objeto oficial do Sales Domain sem posição resolvida.

---

## Expense

Despesa.

---

## Subscription

Assinatura.

> **Nota de Extensão (`ADR-0031`)**: campo mínimo de conteúdo — `name` (obrigatório). Confirmado Aggregate Root independente de `Invoice` (`ADR-0027`), pertencente ao Financial Domain. Sem campo de status — nenhuma fonte confirma estados, não inventado.

---

## Campaign

Campanha.

> **Nota de Extensão (`ADR-0033`)**: campos mínimos — `name` (obrigatório), `startDate`/`endDate` (opcionais). `Asset` não resolvido por esta ADR — posse (Marketing vs. transversal) permanece em aberto.

---

## Project

Projeto.

> **Nota de Extensão (`ADR-0030`)**: campo mínimo de conteúdo, antes ausente deste catálogo — `name` (obrigatório).

---

## Sprint

Sprint de desenvolvimento.

---

## Goal

Meta.

---

## KPI

Indicador.

---

## Ticket

Chamado ou solicitação.

---

## Workflow

Fluxo automatizado.

---

## Automation

Automação executável.

---

# 6. INTELLIGENCE OBJECTS

## Agent

Agente de IA.

---

## Prompt

Prompt versionado.

---

## Context

Contexto utilizado por agentes.

---

## Memory

Memória persistente.

---

## Knowledge Base

Base de conhecimento.

---

## Embedding

Representação vetorial.

---

## Tool

Ferramenta disponível para agentes.

---

## Agent Execution

Histórico de execução de um agente.

---

## Decision

Decisão tomada por IA ou regras.

---

## Recommendation

Sugestão gerada.

---

## Insight

Conclusão baseada em dados.

---

# 7. ANALYTICS OBJECTS

## Metric

Métrica individual.

---

## Dashboard

Painel.

> **Nota de Extensão (`ADR-0034`)**: campo mínimo — `name` (obrigatório). `Widget` permanece bloqueado — sem tipos de visualização definidos, decisão de produto adiada até caso de uso real.
>
> **Nota de Extensão (`ADR-0049`, `ENG-0154`)**: `Widget` desbloqueado — 4 tipos de visualização (`kpi`/`list`/`donut`/`bar`), confirmados pelo CTO. Ver `BOM.md § Widget` abaixo.

---

## Widget

Componente visual.

> **Nota de Extensão (`ADR-0049`, `ENG-0154`)**: Internal Entity do Aggregate `Dashboard`. Campos: `type` (`"kpi" | "list" | "donut" | "bar"`), `title` (obrigatório), `metricKey` (string opaca — só o Frontend a interpreta contra dados já buscados, o Backend nunca a resolve contra dado real de outro domínio). Sem Domain Event.

---

## Report

Relatório.

---

## Snapshot

Estado consolidado em determinado momento.

---

## Forecast

Projeção.

---

## Benchmark

Comparação de desempenho.

---

# 8. SYSTEM OBJECTS

## API Key

Credencial de integração.

---

## Webhook

Evento externo.

---

## Integration

Integração com sistemas terceiros.

---

## Secret

Segredo criptografado.

---

## Environment

Ambiente de execução.

---

## Audit Log

Registro imutável de auditoria.

---

## Event Log

Histórico de eventos.

---

## Queue

Fila de processamento.

---

## Job

Execução assíncrona.

---

## Schedule

Agendamento.

---

## Feature Flag

Controle de funcionalidades.

---

## Migration

Registro de evolução do banco.

---

## Release

Versão da plataforma.

---

# 9. REGRAS GERAIS

Todo objeto deve possuir:

- Identificador único (UUID).
- Organização proprietária (organization_id), quando aplicável.
- Timestamps.
- Controle de auditoria.
- Políticas de acesso.
- Eventos documentados.
- Contratos de API.
- Critérios de versionamento.

---

# 10. CONVENÇÕES

- Objetos representam conceitos de negócio.
- Interfaces podem usar terminologia específica do cliente (Lead, Paciente, Imóvel etc.), mas internamente devem mapear para os objetos do BOM.
- Novos objetos exigem ADR e atualização deste documento.

---

# 11. EVOLUÇÃO

O BOM é o modelo central da plataforma.

Toda evolução arquitetural deve partir deste documento antes de alterar banco de dados, APIs ou interfaces.

---

## Relação com Outros Módulos

*(Seção adicionada na integração ao repositório. Não faz parte do texto original recebido — os 11 capítulos acima permanecem exatamente como fornecidos.)*

- [OBJECT_SPECIFICATION_TEMPLATE.md](OBJECT_SPECIFICATION_TEMPLATE.md) — template para detalhar individualmente cada objeto listado aqui (§ 4-8)
- [architecture/modelagem-de-dados.md](../../architecture/modelagem-de-dados.md) — hoje `TODO`; o BOM passa a ser a fonte substantiva de quais entidades existem, até que este documento seja preenchido a partir dele
- [specifications/](../../specifications/README.md) — os 9 arquivos `<dominio>/database.md` (hoje `TODO`) devem mapear seus dados para os objetos deste BOM, não redefini-los
- [SYSTEM_ARCHITECTURE.md § 4 Kernel](SYSTEM_ARCHITECTURE.md) — lista domínios de infraestrutura compartilhada (Identity, Organizations, Permissions, ...) num nível de abstração diferente dos objetos de negócio aqui definidos; não há mapeamento 1:1 declarado entre os dois
- [CONSTITUTION.md § Artigo 10 — Banco de Dados](CONSTITUTION.md#artigo-10--banco-de-dados) — § 9 deste documento ("Regras Gerais") é compatível com e reforça essa exigência a nível de objeto
- [architecture/multi-tenancy.md](../../architecture/multi-tenancy.md) — o objeto `Organization` e a exigência de `organization_id` em § 9 reforçam o modelo de multi-tenancy já descrito
- ⚠️ **Nomes repetidos, camadas diferentes, não confirmado se é o mesmo conceito**: `Task` (§ 4, objeto de runtime com estados Pending/In Progress/Completed/Cancelled) tem o mesmo nome do nível `Task` da hierarquia Epic→Feature→Story→**Task**→Subtask em [knowledge/core/BACKLOG.md](BACKLOG.md); `Project` (§ 5, objeto de negócio) tem o mesmo nome do produto "NOVARIS Projects" em [PRODUCTS.md](PRODUCTS.md)/[specifications/projects/](../../specifications/projects/README.md). Não decidi se são a mesma coisa vista em camadas diferentes ou uma colisão de nomes.

## Status

🟢 Oficial (v1.0.0). Primeiro documento desta sessão a definir entidades de dados reais — não tem contradição interna nem hierarquia concorrente conhecida, mas introduz a regra vinculante de § 1 (nenhuma entidade sem BOM ou ADR).
