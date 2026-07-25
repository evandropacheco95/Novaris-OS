# ADR-0010 - Authentication Credential Strategy

## Problema

`ENG-0002.10B` (Implement `AuthenticationDomainService`) foi interrompida por decisão do CTO: o passo de verificação de senha do fluxo de autenticação (`IDENTITY_TECHNICAL_BLUEPRINT.md §§ 4, 10`) depende de um mecanismo de credencial que nenhum documento vinculante jamais decidiu — nem o modelo de credencial (senha, IdP externo, token), nem onde a responsabilidade de verificá-la deveria morar, nem se o domínio deveria conhecer a senha. Implementar sem essa decisão exigiria fabricar uma decisão de tecnologia dentro de uma missão de implementação, ou inventar uma abstração sem mandato — ambos proibidos. Esta ADR resolve esse bloqueio.

## Context

O Identity Domain já tem, congelados e implementados: `User`/`Role` ([IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md), ENG-0002.7/8), `UserRepository`/`RoleRepository` (ENG-0002.9), e a identificação formal de `AuthenticationDomainService` como Domain Service aprovado ([DOMAIN_SERVICE_IDENTIFICATION.md § 5](../services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md), ENG-0002.10A). Dois artefatos técnicos **já assumiam implicitamente** um modelo de credencial, sem nunca formalizá-lo: `services/kernel/identity/CONTRACT.md` já esboça `verifyCredentials(email: string, password: string)` desde a Missão ARCH-001 (a fundação do Kernel, anterior a todo o EPIC-002); e `IDENTITY_TECHNICAL_BLUEPRINT.md § 4` já assumiu `VerifyCredentialsInput = { email: Email, password: string }` ao propor `AuthenticationDomainService`, mas explicitamente recusou decidir o mecanismo de verificação ("mecanismo de verificação de senha (hash) não definido — proibido... fora do escopo aqui"), e `ENG-0001.8` já havia recusado formalizar `PasswordHasher` como conceito do Shared Kernel.

Crucialmente, **`IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 4` (Ownership) já lista exaustivamente o que `User` possui** — `id`, `email: Email`, `status`, `createdAt/updatedAt/createdBy/updatedBy`, `version`, `metadata` — **sem nenhum campo de senha ou credencial**. Essa lista está congelada; alterá-la exigiria ADR (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md § Declaração de Freeze`) e está fora do escopo permitido desta missão. Essa ausência não é uma omissão a corrigir — é um dado relevante para a decisão abaixo: o desenho já em vigor não previu senha como propriedade do Aggregate.

`IDENTITY_DOMAIN_MODEL.md § 9` já registra "MFA", "SSO" e parâmetros de política de senha como `requer decisão`, não inventados. `DOMAIN_MODEL.md` cita "SSO"/"MFA"/"Audit Login" como responsabilidades do Identity Domain, sem detalhamento técnico. Nenhum ADR anterior trata de autenticação — `adr/README.md` (ADR-0001 a ADR-0009) cobre reestruturação de repositório, Kernel, stack de tooling, estrutura de serviços, limites de domínio e governança documental, nenhum toca em estratégia de credencial.

## Decision Drivers

- `PasswordHasher` já foi explicitamente recusado como conceito do Shared Kernel (ENG-0001.8) — qualquer abstração nova precisa de justificativa específica, não generalizada.
- `User` já está congelado sem campo de credencial (Freeze § 4) — a decisão não pode presumir adicionar um, sem reabrir o Freeze via um ADR próprio (fora do escopo aqui).
- `CONTRACT.md` e o Blueprint já assumem, de forma consistente, uma assinatura `{ email, password }` — ignorar essa convergência e escolher outro modelo sem motivo forte seria descartar evidência já existente no repositório.
- SSO/MFA/token são responsabilidades já registradas, mas `requer decisão` — esta ADR não pode resolvê-las de passagem, só a estratégia mínima necessária para desbloquear `AuthenticationDomainService`.
- ENGINEERING_PLAYBOOK.md/DDD: a Domain Layer não deve depender de tecnologia (`domain/` nunca importa de `infrastructure/`); qualquer decisão precisa preservar essa direção de dependência.

## Options Considered

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Senha tradicional com hash** | `User` autentica via email + senha; senha nunca é texto claro fora do momento da verificação; hash/algoritmo é decisão de Infrastructure | Já implicitamente assumida por `CONTRACT.md`/Blueprint; modelo mais simples de isolar do domínio via Port |
| **B. Credencial externa (IdP/SSO)** | Autenticação delegada a um provedor externo (Google, Microsoft, SAML, OIDC) | Responsabilidade "SSO" já citada em `DOMAIN_MODEL.md`, mas explicitamente `requer decisão` — nenhum provedor, protocolo ou fluxo foi escolhido em nenhuma fonte; decidir isso aqui seria inventar escopo de negócio não pedido |
| **C. Token como credencial primária** | Autenticação via um token de longa duração (ex.: API Key) em vez de senha | `API Key` já existe em `BOM.md` como conceito **separado** de autenticação de usuário (sistema-a-sistema, não é como um `User` humano se autentica); token de curta duração (Session/JWT) é artefato **pós-autenticação**, explicitamente fora do escopo técnico do Blueprint — não é, ele mesmo, um modelo de credencial primária |
| **D. Outro mecanismo (biometria, magic link, WebAuthn)** | Nenhuma fonte oficial menciona qualquer um destes | Nenhuma evidência documental os sustenta; adotar qualquer um seria inventar requisito de negócio |

Nenhuma opção foi presumida antes desta análise — as quatro foram avaliadas contra as fontes já existentes no repositório.

## Decision

**Opção A — Senha tradicional com hash — é o modelo oficial primário de autenticação por credencial do Identity Domain.** Formaliza o que `CONTRACT.md` e o Blueprint já assumiam implicitamente, sem nunca declarar.

Responsabilidades, separadas por camada (DDD — Ports & Adapters):

- **`User` (Aggregate)**: não sofre nenhuma alteração de estrutura (Freeze § 4 permanece intocado). `User` continua sem conhecer senha, hash ou qualquer credencial — sua única responsabilidade relevante para autenticação é o `status` já existente (`UserIsActiveSpecification` já decide se pode prosseguir, Blueprint § 6).
- **Domínio não conhece a senha em repouso**: nenhuma Entity, Value Object ou Aggregate do Identity Domain armazena senha ou hash de senha. `User` não possui `password` nem `CredentialId`. A correlação entre uma identidade (`User.email`) e sua credencial armazenada é responsabilidade exclusiva da Infrastructure — o domínio não sabe, e não precisa saber, onde ou como ela é guardada.
- **`AuthenticationDomainService` (Domain Service, já aprovado em ENG-0002.10A)**: recebe `{ email, password }` como input (a senha chega em texto claro só neste ponto de fronteira, nunca antes nem depois); orquestra a verificação delegando a um **Port** (ver abaixo), carrega o `User` correspondente via `UserRepository`, aplica `UserIsActiveSpecification`, e devolve `DomainServiceResult<User>`. Nunca decide o algoritmo, nunca persiste a senha, nunca a loga.
- **Port de verificação (novo conceito, aprovado nesta ADR, não criado como arquivo aqui)**: um contrato mínimo — conceitualmente `verify(plainPassword: string, storedCredential: <opaco>): Promise<boolean>` — que `AuthenticationDomainService` consome via injeção de construtor, seguindo exatamente o mesmo padrão de Dependency Inversion já usado para `Repository` ([DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md § 12](../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md)). Pertence à Domain Layer como **interface**, sem nenhuma implementação de algoritmo dentro dela.
- **Infrastructure Adapter (fora do escopo desta ADR e de ENG-0002.10B)**: implementa o Port escolhido, decide algoritmo (bcrypt/argon2/scrypt — **não decidido aqui**), biblioteca, formato de armazenamento, salt/pepper, custo computacional. Correlaciona `User.email`/`User.id` com a linha/registro de credencial armazenada — o domínio nunca vê esse relacionamento.
- **Application Layer**: nenhuma responsabilidade de credencial — só recebe a requisição (ex.: HTTP), extrai `{ email, password }`, invoca `AuthenticationDomainService.execute()`, traduz o `Result` de volta para a interface externa. Nunca vê o hash, nunca decide a verificação.

**Justificativa DDD**: autenticação por senha é um exemplo clássico do que Evans chama de *generic subdomain* — uma capacidade necessária, mas que não expressa o conhecimento de negócio central do Identity Domain (que é "quem é este usuário, e o que ele pode fazer" — `IDENTITY_DOMAIN_MODEL.md § 3`). Isolar a verificação atrás de um Port mantém o Core Domain (Aggregates, Domain Service, Specifications) inteiramente livre de tecnologia — a troca de bcrypt para argon2 no futuro, por exemplo, não toca em nenhuma linha do domínio. É a mesma razão de design já usada para `Repository` (ENG-0001.7) e já institucionalizada em `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md § 7` ("Dependências Permitidas: Repository... via contrato, nunca implementação concreta").

## Rejected Alternatives

- **Opção B (Credencial externa/IdP/SSO)** — rejeitada como modelo **primário**, não como conceito futuro. Nenhuma fonte define qual(is) provedor(es), qual protocolo (OIDC/SAML), ou como coexistiria com senha local. Adotá-la agora seria decidir escopo de negócio não pedido nesta ADR. **Não excluída para o futuro** — quando confirmada, seria um segundo Port (`IdentityProviderPort` ou similar), coexistindo com `AuthenticationDomainService`, não o substituindo — decisão para uma ADR própria quando SSO for confirmado como requisito real.
- **Opção C (Token como credencial primária)** — rejeitada porque confunde duas coisas distintas já differentiated em `BOM.md`/Blueprint: `API Key` (credencial de sistema-a-sistema, já oficial, não é como um `User` humano autentica) e Session/JWT (artefato criado **depois** de uma autenticação bem-sucedida, não um mecanismo de verificação de identidade em si). Nenhuma mudança a `API Key` decorre desta ADR.
- **Opção D (biometria, magic link, WebAuthn)** — rejeitada por ausência total de fonte documental; adotar qualquer uma seria inventar requisito de negócio, proibido em toda esta cadeia de missões.
- **`CredentialProvider`** (abstração genérica sobre múltiplos tipos de credencial) — rejeitada nesta ADR. Implicaria suportar simultaneamente múltiplos modelos de credencial (senha local + IdP externo) — decisão de escopo maior que o necessário para desbloquear `AuthenticationDomainService`, e que dependeria da Opção B já rejeitada como prematura.
- **`AuthenticationPort`** (nome genérico para "algo de autenticação") — rejeitado como conceito adicional; redundante com a interface `AsyncDomainService` que `AuthenticationDomainService` já implementa e com o Port de verificação de senha já aprovado acima. Nomear uma abstração adicional sem escopo mais específico violaria `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md § 3` (proibição de abstração por conveniência).
- **Adicionar campo de senha/hash a `UserProps`** — rejeitada; exigiria reabrir `IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 4`, fora do escopo desta missão e desnecessária dado que a Opção A não precisa disso (a credencial vive inteiramente em Infrastructure, correlacionada por `User.email`, não embutida no Aggregate).

## Consequences

- `AuthenticationDomainService` pode ser reimplementada (`ENG-0002.10B`, nova tentativa) com um caminho de sucesso real: carregar `User` via `UserRepository`, aplicar `UserIsActiveSpecification`, delegar verificação de senha a um Port injetado — sem inventar tecnologia nem violar o Freeze.
- Um novo Port de verificação de senha precisará ser criado como arquivo `.ts` na próxima missão de implementação (fora do escopo desta ADR, que é documental) — nome e forma exata (`PasswordHasher` com `hash()`/`verify()`, ou só `verify()` já que o domínio nunca faz o hashing) ficam para a Fase 5 (Plano Técnico) dessa missão futura, não decididos até o nível de assinatura aqui.
- Nenhuma implementação de Infrastructure (algoritmo, biblioteca, tabela de credenciais) é criada por esta ADR — permanece `requer decisão`, delegado a uma futura missão de Infrastructure Layer.
- SSO/IdP/MFA continuam exatamente como já registrados (`requer decisão`) — esta ADR não os resolve, não os descarta, apenas não os torna o modelo primário agora.
- `User`/`Role`/`IDENTITY_AGGREGATE_DESIGN_FREEZE.md`/`Repository Contracts`/Shared Kernel permanecem inteiramente intocados — confirmado, nenhum arquivo de código tocado por esta missão.

## Impact on Identity Domain

- `IDENTITY_TECHNICAL_BLUEPRINT.md § 4` (`AuthenticationDomainService`) passa a ter, pela primeira vez, uma resposta oficial para "como a senha é verificada" — a resposta é "via um Port de Infrastructure, nunca decidido pelo domínio", não uma reinterpretação de nenhum campo já modelado no Blueprint.
- `IDENTITY_AGGREGATE_DESIGN_FREEZE.md` permanece **inalterado** — esta ADR confirma, não contradiz, a ausência de campo de credencial em `User` (Ownership § 4).
- `DOMAIN_SERVICE_IDENTIFICATION.md` (ENG-0002.10A) permanece **inalterado** — a classificação de `AuthenticationDomainService` como Categoria B já estava correta; esta ADR só resolve a lacuna de implementação, não a classificação.
- Nenhuma regra de negócio nova sobre `User`/`Role`/`Permission` foi introduzida.

## Impact on ENG-0002.10B

`ENG-0002.10B` pode ser reexecutada assim que este ADR estiver `Aceito`. O novo plano técnico dessa missão deverá: (1) definir o Port de verificação de senha como arquivo novo dentro do escopo já permitido de `AuthenticationDomainService` (`src/domain/services/authentication/`, ou uma pasta de porta própria, decisão de nomenclatura da Fase 5 daquela missão); (2) implementar `AuthenticationDomainService.execute()` completo (carregar `User`, aplicar `UserIsActiveSpecification`, delegar verificação via o Port); (3) **não** implementar nenhum Adapter concreto (Infrastructure permanece fora do escopo de `ENG-0002.10B`, como já era). Este ADR não implementa nada disso — apenas remove o bloqueio arquitetural que impedia essa missão de prosseguir.

## Responsável

CTO / Arquiteto Chefe, via Ordem de Missão ADR-0010 ("Authentication Credential Strategy"), em resposta direta ao bloqueio formalmente reportado ao final de `ENG-0002.10B`.

## Data

2026-07-15

## Impactos

- `adr/README.md` — nova linha no índice de ADRs.
- Nenhum outro arquivo de documentação alterado por esta missão (nem Blueprint, nem Freeze, nem ADM — atualização do ADM fica para quando `ENG-0002.10B` for reexecutada com sucesso, para registrar a decisão junto da implementação real, não antes).

## Plano de Migração

Nenhuma migração de código ou dado — nenhum código foi criado até hoje que dependa de uma decisão diferente desta. Nenhum dado de credencial existe ainda no sistema (nenhuma Infrastructure implementada).

## Status

Aceito
