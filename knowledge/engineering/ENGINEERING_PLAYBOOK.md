# ENGINEERING_PLAYBOOK.md

Versão: 1.0

Status: Oficial

Autoridade: Chief System Architect

Escopo: documentação e templates. Nenhum código de negócio, nenhum serviço, nenhuma migration, nenhuma API criados por esta missão.

---

## Nota de Origem

Este playbook consolida decisões já tomadas (stack em [ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md), convenções de banco em [DATABASE_ARCHITECTURE.md](../core/DATABASE_ARCHITECTURE.md), regras de qualidade em [CONSTITUTION.md](../core/CONSTITUTION.md)/[NOVARIS_CONSTITUTION.md](../core/NOVARIS_CONSTITUTION.md)) mais os padrões de arquitetura (Clean Architecture, DDD, Ports & Adapters) explicitamente pedidos por esta missão. Onde a escolha de uma ferramenta específica (não a arquitetura em si) nunca foi decidida em nenhum ADR, o capítulo diz **requer decisão/ADR** em vez de escolher uma biblioteca por conta própria — escolher framework de teste, biblioteca de log, etc. é decisão arquitetural e exige o mesmo processo de qualquer outra.

⚠️ **Nome parecido com pastas já existentes**: já existe [engineering/](../../engineering/README.md) (raiz, ADR-0002 — padrões de código, git workflow, CI/CD, `decision-tree.md`, `playbooks/` de procedimento) e [knowledge/technical/engenharia/](../technical/engenharia/README.md) (conhecimento tácito de engenharia). Este documento vive em `knowledge/engineering/`, terceiro local com "engineering" no nome. Os três não se sobrepõem em conteúdo hoje (este é o padrão arquitetural de serviço; `engineering/` raiz é processo de repositório; `knowledge/technical/engenharia/` é decisões/aprendizados registrados no dia a dia) mas a duplicação de nome é registrada, não resolvida.

---

## 1. Filosofia da Engenharia

A NOVARIS constrói serviços seguindo:

- **Clean Architecture** — dependências apontam sempre para dentro (Domain não depende de nada; Infrastructure depende de Domain, nunca o contrário).
- **DDD (Domain-Driven Design)** — o modelo de domínio (ver [DOMAIN_MODEL.md](../core/DOMAIN_MODEL.md), [BOM.md](../core/BOM.md)) é o centro do design, não o banco de dados nem o framework.
- **SOLID** — em particular Dependency Inversion: código de domínio depende de interfaces (ports), não de implementações concretas.
- **Ports & Adapters (Hexagonal)** — toda integração externa (banco, fila, API de terceiro) é um adapter atrás de uma porta definida pelo domínio.
- **Event Driven** — mudanças relevantes de estado publicam eventos (ver [packages/contracts/events/](../../packages/contracts/events/README.md)); serviços reagem a eventos, não fazem chamada síncrona onde um evento resolve.
- **Modular Monolith Ready** — cada serviço em [services/](../../services/README.md) é internamente modular (Domain Layer isolada por módulo) mesmo rodando como um único processo, para permitir extração futura sem reescrita.
- **Microservice Ready** — a fronteira de módulo já é a fronteira de serviço; extrair um módulo para processo próprio não deve exigir redesenho, só mudança de deploy.
- **AI First Development** — todo serviço expõe informação suficiente (logs estruturados, contratos explícitos, documentação por módulo) para que um agente de IA consiga operar sobre ele com segurança — ver [Capítulo 20](#20-ai-engineering-rules) e [NOVARIS_CONSTITUTION.md Article XII](../core/NOVARIS_CONSTITUTION.md).

## 2. Estrutura Obrigatória dos Serviços

Todo serviço em `services/kernel/<modulo>/` ou `services/domains/<dominio>/` segue esta árvore quando implementado:

```
<servico>/
├── src/
│   ├── application/     # Casos de uso, commands, queries, handlers (Capítulo 4)
│   ├── domain/          # Entities, value objects, aggregates (Capítulo 3)
│   ├── infrastructure/  # Adapters: banco, filas, providers externos (Capítulo 5)
│   ├── interfaces/      # Controllers REST, consumidores de evento (Capítulo 6)
│   ├── config/          # Configuração do módulo (variáveis, providers do NestJS)
│   └── shared/          # Utilitários usados por mais de uma camada, sem lógica de domínio
├── tests/                # Espelha a estrutura de src/ (Capítulo 15)
├── CONTRACT.md           # Já usado desde ARCH-001/ENG-0000
└── README.md
```

`domain/` nunca importa de `infrastructure/` ou `interfaces/`. `application/` importa de `domain/`, nunca o contrário.

## 3. Organização da Domain Layer

| Bloco | Responsabilidade |
|---|---|
| Entities | Objetos com identidade (ex.: `Organization`, `User` — ver [objects/](../core/objects/README.md)) |
| Value Objects | Objetos sem identidade, imutáveis, definidos pelo valor (ex.: um `Email`, um `Money`) |
| Aggregates | Fronteira de consistência transacional — ver propostas de agregado em [CANONICAL_DATA_MODEL.md § 5-8](../core/CANONICAL_DATA_MODEL.md) |
| Factories | Criam Entities/Aggregates garantindo invariantes desde a criação |
| Repositories | Interface (port) para persistência de um Aggregate — implementação concreta vive em `infrastructure/` |
| Domain Services | Lógica de domínio que não pertence naturalmente a uma única Entity |
| Specifications | Regras de negócio combináveis e testáveis isoladamente (ex.: "organização pode ativar usuário") |
| Policies | Regras de decisão configuráveis (ex.: política de retenção — ver `DATABASE_ARCHITECTURE.md § 18` "requer decisão") |
| Domain Events | Eventos que representam algo que aconteceu no domínio — nomeados no passado (`OrganizationCreated`), já catalogados parcialmente em [BOM.md](../core/BOM.md)/[objects/](../core/objects/README.md) |

## 4. Application Layer

| Bloco | Responsabilidade |
|---|---|
| Commands | Intenção de mudar estado (`ActivateOrganization`) |
| Queries | Intenção de ler estado, sem side-effect |
| Handlers | Executam um Command ou Query, orquestrando Domain + Repositories |
| DTOs | Formato de entrada/saída da Application Layer, desacoplado do formato HTTP e do modelo de domínio |
| Validators | Validam DTOs antes do Handler — **requer decisão/ADR**: biblioteca (`class-validator`, `zod`, outra) não foi escolhida ainda |
| Use Cases | Um Handler + seu Command/Query formam um Use Case — ver [templates/usecase-template.md](templates/usecase-template.md) |

## 5. Infrastructure Layer

| Adapter | Papel |
|---|---|
| Persistence | Implementação dos Repositories via Prisma ([packages/database/](../../packages/database/README.md), [ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md)) |
| Providers | Wrappers de serviços de infraestrutura (ex.: cliente Supabase) |
| Supabase | Auth, Storage, RLS (ver [DATABASE_ARCHITECTURE.md § 7](../core/DATABASE_ARCHITECTURE.md) — Prisma não gerencia RLS, fica aqui) |
| Redis | **Requer decisão/ADR** — não faz parte da stack fixa nem de `ADR-0005`; cache/fila hoje não têm ferramenta decidida |
| Queues | Implementação concreta de fila para os módulos `services/kernel/event-bus/` e `automation-runtime/` — **requer decisão/ADR** |
| Storage | Adapter sobre `services/kernel/storage/` |
| External APIs | Adapters para integrações de terceiros, sempre atrás de uma porta — ver `services/kernel/integration-hub/` |
| Messaging | Publicação/consumo de eventos via `services/kernel/event-bus/` |

## 6. Interface Layer

- **REST** — protocolo primário de API, via NestJS controllers.
- **Future GraphQL** — não decidido, não implementado; se adotado no futuro, exige ADR próprio.
- **Webhooks** — entrada e saída, via `services/kernel/integration-hub/`.
- **OpenAPI / Swagger** — toda API REST gera especificação OpenAPI automaticamente a partir dos controllers (padrão NestJS); Swagger UI exposto em ambiente de desenvolvimento.
- **Versionamento** — ver Capítulo 17.

## 7. Contracts

Formaliza o que já existe em [packages/contracts/](../../packages/contracts/README.md) (`ADR-0006`):

- **API Contracts** — `packages/contracts/api/`, request/response, independente de implementação HTTP.
- **Event Contracts** — `packages/contracts/events/`, nome + payload + versão de cada evento de domínio.
- **Schema Contracts** — `packages/contracts/schemas/`, schemas de validação compartilhados (ferramenta: mesma decisão pendente do Capítulo 4, Validators).
- **Versionamento** — todo contrato é versionado (`v1`, `v2`); mudança incompatível gera nova versão, não sobrescreve a existente.
- **Backward Compatibility** — um contrato publicado não pode ter campo obrigatório removido ou tipo alterado sem nova versão — mudança incompatível em contrato já publicado exige ADR ([CONSTITUTION.md § Artigo 22](../core/CONSTITUTION.md#artigo-22--alterações)).

## 8. Convenções

| Elemento | Convenção |
|---|---|
| Naming de pastas | `kebab-case` (consistente com o resto do repositório) |
| Naming de arquivos TypeScript | `kebab-case.ts`; classes exportadas em `PascalCase` dentro do arquivo |
| Imports | Absolutos dentro do serviço via alias (`@/domain/...`), nunca `../../../` além de um nível |
| Aliases | Configurados em `tsconfig.base.json` por pacote/serviço, não hardcoded |
| Namespaces | Um módulo NestJS por bounded context; sem namespace global compartilhado entre domínios (reforça `DOMAIN_MODEL.md § REGRAS`) |

## 9. Padrões de Código

- **TypeScript** obrigatório ([ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md)), `strict: true` já configurado em [tsconfig.base.json](../../tsconfig.base.json).
- **ESLint/Prettier** — configuração raiz já existe (`.eslintrc.cjs`, `.prettierrc`); `packages/config/` centraliza extensões específicas de serviço quando necessário.
- **Tipos proibidos**: `any` implícito ou explícito sem justificativa em comentário; `// @ts-ignore` sem justificativa.
- **Funções**: uma responsabilidade; funções de Domain Layer são puras sempre que possível (sem I/O).
- **Classes**: preferidas para Entities/Aggregates/Services com estado ou identidade; funções puras para o resto.
- **Interfaces**: toda Port (Capítulo 3) é uma interface TypeScript, nunca uma classe abstrata, para permitir múltiplos adapters.

## 10. Error Handling

| Tipo | Onde nasce | Tratamento |
|---|---|---|
| Business Errors | Domain Layer (viola uma Specification/Policy) | Erro tipado próprio, nunca `Error` genérico |
| Infrastructure Errors | Infrastructure Layer (banco fora do ar, fila indisponível) | Capturado no adapter, traduzido para erro de domínio ou propagado como falha de infraestrutura |
| Validation Errors | Application Layer (DTO inválido) | Retornado antes do Handler ser chamado |
| HTTP Mapping | Interface Layer | Cada tipo de erro acima mapeia para um status HTTP consistente (Business → 422, Validation → 400, não encontrado → 404, infraestrutura → 500/503) |
| Logging | Todos | Todo erro tratado gera log estruturado (Capítulo 11) antes de responder |

## 11. Logging

Estrutura obrigatória por entrada de log:

| Campo | Origem |
|---|---|
| `correlationId` | Gerado na borda (Interface Layer), propagado por toda a cadeia de chamadas de uma requisição |
| `requestId` | Único por requisição HTTP/evento recebido |
| `traceId` | Para rastreamento distribuído entre serviços — ver Capítulo 12 |
| `auditId` | Quando a ação também gera entrada em `services/kernel/audit/` ([DATABASE_ARCHITECTURE.md § 5](../core/DATABASE_ARCHITECTURE.md)) |

**Requer decisão/ADR**: biblioteca de log estruturado (Pino, Winston, ou nativa do NestJS) não foi escolhida.

## 12. Observabilidade

- **Health Checks** — todo serviço expõe endpoint de health check (liveness/readiness).
- **Metrics** — todo serviço expõe métricas via `services/kernel/monitoring/` (contrato ainda `TODO`, ver `packages/kernel` → `services/kernel/monitoring/README.md`).
- **Tracing** — `traceId` do Capítulo 11 é a base; ferramenta de tracing distribuído (OpenTelemetry é o padrão citado em [SYSTEM_ARCHITECTURE.md § 27](../core/SYSTEM_ARCHITECTURE.md)) — adoção formal **requer ADR**.
- **Monitoring** — consumido por `services/kernel/monitoring/`; alertas **requerem decisão** (nenhum canal definido ainda).

## 13. Segurança

- **JWT** — mecanismo de sessão via `services/kernel/identity/` (`CONTRACT.md` já define `createSession`/`revokeSession`; formato do token **requer decisão** de implementação).
- **RBAC** — via `services/kernel/roles/` + `services/kernel/permissions/`, formato `<domínio>.<recurso>.<ação>` já definido em [objects/Permission.md](../core/objects/Permission.md).
- **Secrets** — nunca em código nem em `.env` commitado ([PROJECT_RULES.md § Regras de Segurança](../../PROJECT_RULES.md)); usar `.env.example` como referência de estrutura.
- **Environment** — configuração por ambiente via variáveis, nunca hardcoded; `infrastructure/deployment/` define os ambientes reais (ainda `TODO`).
- **Rate Limit** — obrigatório em toda API pública (`apps/api/`); limites concretos **requerem decisão**.
- **Input Validation** — toda entrada de Interface Layer é validada antes de chegar à Application Layer (Capítulo 4).
- **OWASP** — Top 10 como checklist mínimo de revisão de segurança; sem processo formal de auditoria definido ainda (**requer decisão**).

## 14. Banco

Convenções completas já definidas em [DATABASE_ARCHITECTURE.md](../core/DATABASE_ARCHITECTURE.md) — este capítulo só referencia, não duplica: Migrations (§ 17), Índices (§ 8), Constraints (§ 9), Naming (§ 16), Soft Delete (§ 4), Auditoria (§ 5).

## 15. Testes

| Tipo | Escopo |
|---|---|
| Unit | Domain Layer isolada, sem I/O — a maior parte da cobertura deve vir daqui, por ser a camada mais barata de testar |
| Integration | Application + Infrastructure reais (banco de teste, não mock) |
| Contract | Verifica que um serviço cumpre o contrato publicado em `packages/contracts/` |
| E2E | Fluxo completo via Interface Layer |
| Coverage | **Requer decisão**: percentual mínimo não definido em nenhum documento — não inventado aqui |

Framework de teste **requer decisão/ADR** — nenhum documento anterior escolheu (Jest é o mais comum no ecossistema NestJS, mas não foi formalmente adotado).

## 16. Eventos

- **Domain Events** — internos a um serviço, podem não cruzar o Event Bus.
- **Integration Events** — publicados via `services/kernel/event-bus/`, contrato em `packages/contracts/events/`.
- **Naming** — `<Objeto><AçãoNoPassado>` (`OrganizationCreated`), já em uso em [BOM.md](../core/BOM.md)/[objects/](../core/objects/README.md).
- **Versionamento** — mesmo princípio do Capítulo 7: mudança incompatível de payload = novo nome de versão de evento, não sobrescrita.
- **Idempotência** — todo consumidor de evento deve tolerar reentrega (at-least-once); mecanismo concreto de deduplicação **requer decisão**.

## 17. APIs

- **REST Standards** — recursos no plural, verbos HTTP semânticos, sem verbos na URL.
- **Response Pattern** — envelope de resposta consistente (dado + metadados de paginação, quando aplicável) — formato exato **requer decisão**.
- **Error Pattern** — corpo de erro consistente entre todas as APIs (código, mensagem, `correlationId` do Capítulo 11) — formato exato **requer decisão**.
- **Pagination / Filtering / Sorting** — parâmetros de query padronizados entre serviços — convenção exata **requer decisão**.
- **Versioning** — via prefixo de URL (`/v1/...`), consistente com o versionamento de contratos do Capítulo 7.

## 18. Pull Request Checklist

- [ ] Aderente à estrutura do Capítulo 2 (`domain/` não importa de `infrastructure/`/`interfaces/`)
- [ ] Toda entidade nova tem Object Specification em [objects/](../core/objects/README.md) ([BOM.md § 1](../core/BOM.md))
- [ ] Toda tabela nova segue [DATABASE_ARCHITECTURE.md](../core/DATABASE_ARCHITECTURE.md)
- [ ] Todo contrato novo/alterado está em `packages/contracts/`, versionado (Capítulo 7)
- [ ] Testes presentes conforme Capítulo 15
- [ ] Logging estruturado presente (Capítulo 11)
- [ ] Nenhum segredo commitado
- [ ] Documentação (`CONTRACT.md`/`README.md` do serviço) atualizada no mesmo PR ([CONSTITUTION.md § Artigo 14](../core/CONSTITUTION.md))
- [ ] Se houve decisão arquitetural, existe ADR correspondente ([CONSTITUTION.md § Artigo 22](../core/CONSTITUTION.md#artigo-22--alterações))

## 19. Definition of Done

Uma missão de implementação está concluída quando (consistente com [NOVARIS_CONSTITUTION.md Article XX](../core/NOVARIS_CONSTITUTION.md) e [.command-center/EXECUTION_PROTOCOL.md](../../.command-center/EXECUTION_PROTOCOL.md)):

- [ ] Código implementado conforme Capítulos 2-9
- [ ] Testes executados e passando (Capítulo 15)
- [ ] Contratos publicados/atualizados (Capítulo 7)
- [ ] Documentação e `CHANGELOG.md` atualizados
- [ ] ADR criado, se a missão envolveu decisão arquitetural
- [ ] Logs e observabilidade funcionando (Capítulos 11-12)
- [ ] Checklist do Capítulo 18 cumprido
- [ ] Self Review **e** Architecture Compliance Report (ACR) apresentados ([.command-center/ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md](../../.command-center/ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md)) — obrigatório desde a Ordem de Missão ENG-0002.A, nenhuma missão conclui com apenas um dos dois

## 20. AI Engineering Rules

Como um agente de IA (ex.: Claude Code) deve trabalhar neste repositório — consolida e referencia o que já está espalhado em vez de duplicar:

- **Fluxo obrigatório**: seguir as 11 fases de [.command-center/EXECUTION_PROTOCOL.md](../../.command-center/EXECUTION_PROTOCOL.md) sempre, sem pular etapas.
- **Como dividir tarefas**: uma missão por bounded context/módulo quando possível (mesmo padrão já usado: ARCH-001 dividiu o Kernel em 20 módulos, fases A-G).
- **Quando criar ADR**: toda vez que uma escolha de tecnologia, padrão estrutural ou trade-off relevante for necessária e não estiver já decidida — os "requer decisão" espalhados por este playbook são candidatos diretos a virar ADR quando a implementação chegar neles.
- **Quando perguntar**: quando a instrução contradiz uma decisão já registrada (ADR, Constituição, `PROJECT_RULES.md`) — mesmo critério usado em `ENG-0000` (pergunta feita antes de revogar `ADR-0003`).
- **Quando assumir**: quando a instrução é ambígua mas de baixo risco e reversível (nomenclatura de arquivo, formato de README) — documentar a suposição no próprio artefato, como já é prática neste repositório.
- **Quando parar**: quando a tarefa pede para inventar uma decisão de negócio ou parâmetro operacional sem base documental (prazos, valores, regras de domínio não definidas) — marcar `TODO`/`requer decisão` em vez de inventar, seguindo [CONSTITUTION.md § Artigo 13](../core/CONSTITUTION.md) e [NOVARIS_CONSTITUTION.md Article XII](../core/NOVARIS_CONSTITUTION.md).

---

## Relação com Outros Módulos

- [engineering/](../../engineering/README.md) — processo de repositório (git workflow, CI/CD); este documento é padrão de arquitetura de serviço, camada diferente
- [ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) — stack que este playbook assume
- [DATABASE_ARCHITECTURE.md](../core/DATABASE_ARCHITECTURE.md) — convenções de banco referenciadas no Capítulo 14
- [packages/contracts/](../../packages/contracts/README.md) — implementação do Capítulo 7
- [.command-center/EXECUTION_PROTOCOL.md](../../.command-center/EXECUTION_PROTOCOL.md) — fluxo que o Capítulo 20 referencia
- [templates/](templates/README.md) — templates reutilizáveis derivados deste playbook

## Status

🟢 Oficial (v1.0). 20 capítulos com conteúdo real onde já havia base decidida (stack, banco, contratos, protocolo); pontos sem ferramenta escolhida marcados explicitamente "requer decisão/ADR" — nenhuma biblioteca ou parâmetro operacional foi inventado.
