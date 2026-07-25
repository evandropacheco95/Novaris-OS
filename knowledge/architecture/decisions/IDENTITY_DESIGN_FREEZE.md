# NOVARIS — Identity Design Freeze (Re-confirmação Tática)

Versão: 1.0.0

Status: 🟢 Oficial — validação e re-congelamento do modelo tático de Identity, nenhum código alterado

Missão: ENG-0014 (Identity Design Freeze)

Escopo: validar o Aggregate `Identity` (Aggregates, Entities, Value Objects, Domain Services, Repositories, Factories, Domain Events, invariantes, fronteiras transacionais) contra a implementação real, e congelar formalmente o resultado antes do início dos Business Domains. Nenhum código foi alterado. Nenhuma divergência entre implementação e documentação foi encontrada (§ "Divergências"). Este documento **não substitui** `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`/`IDENTITY_DOMAIN_CLOSURE.md` (EPIC-002) — reconfirma-os com base na leitura direta do código real, na cadência do Tactical Design consolidado em `knowledge/architecture/decisions/`.

## 1. Resumo Executivo

O Identity Domain foi verificado linha a linha contra `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`, `IDENTITY_TECHNICAL_BLUEPRINT.md`, `IDENTITY_DOMAIN_CLOSURE.md` e `DOMAIN_SERVICE_IDENTIFICATION.md` — **nenhuma divergência foi encontrada**. Os 19 arquivos-fonte reais (2 Aggregates, 2 Value Objects, 2 Repository Contracts, 3 Domain Services + 1 Port, 9 Domain Events) foram lidos diretamente nesta missão, não presumidos do histórico da sessão. O modelo tático de Identity está **integralmente confirmado e re-congelado**.

## 2. Aggregate Root

| Aggregate | Confirmado? | Fonte |
|---|---|---|
| `User` | ✅ Sim — `user.ts`, `extends AggregateRoot<UserProps>`, `implements Auditable, Versionable, HasMetadata<UserMetadata>` | `IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 1, 4` |
| `Role` | ✅ Sim — `role.ts`, `extends AggregateRoot<RoleProps>`, `implements Auditable, Versionable` (sem `HasMetadata`, confirmado deliberado) | `IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 1, 4` |

## 3. Entities

**Nenhuma Entity interna** — confirmado por leitura direta: nem `User` nem `Role` têm nenhuma classe filha com identidade própria dentro de sua fronteira. `Role.permissions` é um array de Value Objects (`Permission[]`), não de Entities. `User.roleIds` é um array de referências (`UniqueEntityId[]`), não de objetos embutidos.

## 4. Value Objects

| Value Object | Confirmado? | Campos | Validação |
|---|---|---|---|
| `Permission` | ✅ Sim — `permission.ts` | `code: string` | Formato `<domínio>.<recurso>.<ação>`, regex confirmada no código |
| `Email` | ✅ Sim — `email.ts` | `value: string` | Regex de formato + normalização (trim + lowercase antes de validar) |

## 5. Repositories

| Repository | Confirmado? | Composição |
|---|---|---|
| `UserRepository` | ✅ Sim — `user-repository.ts` | `extends ReadRepository<User>, WriteRepository<User> {}` — zero métodos próprios, confirmado |
| `RoleRepository` | ✅ Sim — `role-repository.ts` | `extends ReadRepository<Role>, WriteRepository<Role> {}` — zero métodos próprios, confirmado |

Nenhum `PermissionRepository` existe — confirmado consistente com `Permission` ser Value Object, persistida como parte de `Role` (sem ciclo de persistência independente).

## 6. Factories

**Nenhuma Factory separada do próprio Aggregate** — confirmado: `User.create()`/`Role.create()` são os únicos Factory Methods, ambos estáticos na própria classe do Aggregate (`AGGREGATE_IMPLEMENTATION_STANDARD.md §§ 2-3`). Nenhum Domain Service tem Factory Method próprio — confirmado nos 3 (`AuthenticationDomainService`, `AuthorizationDomainService`, `RoleAssignmentDomainService`), todos com "Sem Factory Method (ENS-0003 § 6)" documentado no próprio código e construtor público recebendo dependências diretamente.

## 7. Domain Services

| Domain Service | Confirmado? | Assinatura real |
|---|---|---|
| `AuthenticationDomainService` | ✅ Sim | `implements AsyncDomainService<VerifyCredentialsInput, User>` — localiza `User` por email (`findAll()` + filtro, `findByEmail` não existe no contrato), confirma `status === "active"`, delega a `PasswordVerifier`; as 3 causas de falha devolvem a mesma `AuthenticationError` |
| `AuthorizationDomainService` | ✅ Sim | `implements AsyncDomainService<CheckPermissionInput, boolean>` — carrega `User` por id, cada `Role` via `findById` em loop, verifica posse de `Permission`; `userId`/`roleId` ausentes são `Result.ok(false)`, nunca falha |
| `RoleAssignmentDomainService` | ✅ Sim | `implements AsyncDomainService<AssignRoleInput, void>` — valida `role.organizationId.equals(user.organizationId)`, delega a `User.assignRole()` intocado, persiste via `UserRepository.save()` |
| `PasswordVerifier` | ✅ Sim (Port) | Interface, sem implementação concreta (Infrastructure, fora de escopo) |

Todos os 3 Domain Services confirmam a mesma composição já documentada em `DOMAIN_SERVICE_IDENTIFICATION.md § 5` (R4+R11, R10, R7) — nenhuma divergência.

## 8. Domain Events

9 confirmados, todos implementados, todos `implements DomainEvent` (Shared Kernel):

| Evento | Aggregate emissor | Método que dispara |
|---|---|---|
| `UserCreated` | `User` | `create()` |
| `UserInvited` | `User` | `invite()` |
| `UserActivated` | `User` | `activate()` |
| `UserDisabled` | `User` | `disable()` |
| `RoleAssignedToUser` | `User` | `assignRole()` |
| `RoleRevokedFromUser` | `User` | `revokeRole()` |
| `RoleCreated` | `Role` | `create()` |
| `PermissionGrantedToRole` | `Role` | `grantPermission()` |
| `PermissionRevokedFromRole` | `Role` | `revokePermission()` |

## 9. Invariantes

Confirmadas por leitura direta do código:

- `User.status`: transições `created→invited`, `created|invited→active`, `active→disabled` — cada uma validada com `ConflictError` se a transição de origem for inválida; reativação (`disabled→active`) não implementada, confirmado `requer decisão` (Freeze § 11).
- `User`/`Role`: `organizationId` obrigatório em ambos (campo não opcional em `UserProps`/`RoleProps`).
- `Role.organizationId` verificado contra `User.organizationId` em `RoleAssignmentDomainService` — cross-Organization proibido, confirmado.
- `Email`: normalização (trim+lowercase) antes da validação de formato — confirmado no código, não documentado explicitamente em nenhum Freeze anterior como comportamento citado (achado: comportamento correto e coerente com a intenção do VO, mas não estava textualmente descrito nos documentos de Freeze originais — registrado aqui, não uma divergência, apenas uma precisão adicional).
- `Permission`: formato `<domínio>.<recurso>.<ação>`, validado por regex — confirmado.
- Nenhuma verificação de duplicidade em `User.assignRole()`/`Role.grantPermission()` — confirmado deliberado (documentado no próprio código como decisão já tomada, não uma omissão).

## 10. Regras de Consistência

- Nenhum Aggregate referencia outro por objeto embutido — só por `UniqueEntityId` (`User.roleIds`, referências em `RoleAssignmentDomainService`).
- `Role` nunca referencia `User` de volta — confirmado, nenhuma importação cruzada em `role.ts`.
- Toda mutação passa por método nomeado com `Result<T, DomainError>` — confirmado em 100% dos métodos públicos de `User`/`Role`.
- Nenhum setter público — confirmado, todos os campos são getters read-only.
- `touch()` privado atualiza `updatedAt`/`updatedBy`/`version` em toda mutação bem-sucedida — confirmado em ambos os Aggregates.

## 11. Itens Congelados

Reconfirmados sem alteração: os 2 Aggregate Roots, as 2 Value Objects, os 2 Repository Contracts, os 3 Domain Services + 1 Port, os 9 Domain Events, todas as invariantes de § 9, e a fronteira transacional (cada Aggregate — `User` e `Role` — é sua própria fronteira; nenhuma transação cruza os dois).

## 12. Itens Pendentes

Reconfirmados de `IDENTITY_DOMAIN_CLOSURE.md § 7`, nenhum resolvido por esta missão:

- Adapter concreto de `PasswordVerifier` (algoritmo de hash) — `ADR-0010`, requer decisão de Infrastructure.
- Estratégia de índice/consulta por `Email` (`findByEmail` não existe).
- Unicidade de `Role.name` dentro de uma Organization.
- Unicidade de `Email` (por Organization ou global).
- Reativação de `User` desativado.
- Remoção de `Role` com `User`s ainda atribuídos.
- Número máximo de `Role`s por `User`.
- SSO/MFA/Session/Token — fora do escopo técnico desde `IDENTITY_TECHNICAL_BLUEPRINT.md`.
- Infraestrutura de persistência real — `UserRepository`/`RoleRepository` concretos, Infrastructure Layer inteira vazia.

## 13. Impacto Arquitetural

Nenhum — este documento não altera nenhuma decisão já congelada, apenas confirma que a implementação real permanece fiel a elas. Serve de precedente de rigor para futuras missões de "Design Freeze" tático de outros Bounded Contexts (`Sales`, `Customer`, etc.) quando saírem do estágio de candidato (`AGGREGATE_DISCOVERY.md`, ENG-0013) para implementação real.

## Divergências

**Nenhuma encontrada.** Toda seção acima foi verificada por leitura direta do código-fonte real (19 arquivos), não por citação do histórico da sessão. A única observação registrada (§ 9, normalização de `Email`) não é uma divergência — é um comportamento correto do código que não estava explicitamente descrito em texto no Freeze original, sem contradizer nada já congelado.

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0014 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código (nenhum alterado); PASS nos demais — nenhuma regra de negócio nova, escopo proibido respeitado.
- **Domain Model Validation**: nenhum conceito novo criado; toda confirmação rastreável a um arquivo real lido nesta missão.

## Relação com Outros Módulos

- [../../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md), [IDENTITY_TECHNICAL_BLUEPRINT.md](../../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md), [IDENTITY_DOMAIN_CLOSURE.md](../../../services/kernel/identity/IDENTITY_DOMAIN_CLOSURE.md) — fontes originais, reconfirmadas, não substituídas
- [DOMAIN_SERVICE_IDENTIFICATION.md](../../../services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md) — origem dos 3 Domain Services aprovados
- [AGGREGATE_DISCOVERY.md](AGGREGATE_DISCOVERY.md) (ENG-0013) — Identity já citado ali como "Confirmado", detalhado agora em profundidade

## Status

🟢 Modelo tático de Identity re-confirmado e congelado (Missão ENG-0014). Nenhuma divergência entre implementação e documentação. Nenhum código alterado.
