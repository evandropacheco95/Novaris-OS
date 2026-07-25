# authentication

`AuthenticationDomainService` — coordena a autenticação por credencial do Identity Domain.

## Conteúdo (Missão ENG-0002.10B)

- [authentication-domain-service.ts](authentication-domain-service.ts) — `AuthenticationDomainService implements AsyncDomainService<VerifyCredentialsInput, User>` ([IDENTITY_TECHNICAL_BLUEPRINT.md § 4](../../../../IDENTITY_TECHNICAL_BLUEPRINT.md), aprovado em [DOMAIN_SERVICE_IDENTIFICATION.md § 5](../../../../DOMAIN_SERVICE_IDENTIFICATION.md)). Fluxo: localizar `User` por email (`UserRepository`) → confirmar `status === "active"` → verificar senha (`PasswordVerifier`) → `Result.ok(user)` ou `Result.fail(AuthenticationError)` uniforme para as 3 causas de falha de domínio.
- [password-verifier.ts](password-verifier.ts) — `PasswordVerifier`, Port de Infrastructure aprovado em [ADR-0010](../../../../../../../adr/ADR-0010-authentication-credential-strategy.md) — só a assinatura; nenhum algoritmo de hash, biblioteca ou implementação concreta.

## Dependências

- `UserRepository` ([src/domain/repositories/](../../repositories/README.md)) — injetada via construtor.
- `PasswordVerifier` (este pacote) — injetada via construtor; implementação concreta fica em `infrastructure/`, fora do escopo desta missão.

## Decisões de Escopo

- Sem `UserIsActiveSpecification` como classe própria — checagem de `status === "active"` implementada inline; extrair uma Specification para um único call site seria abstração preventiva (mesmo critério de ENG-0002.4).
- As 3 causas de falha de domínio (usuário inexistente, desativado, senha incorreta) devolvem a mesma `AuthenticationError`, sem `details`/`metadata` distintivos — evita vazar qual delas ocorreu.
- Nenhum Domain Event emitido — autenticação não muta nenhum Aggregate.

## Status

🟢 Implementado e testado (Missão ENG-0002.10B). `AuthorizationDomainService`/`RoleAssignmentDomainService` ainda não implementados.
