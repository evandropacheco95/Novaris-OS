# authentication

Testes de `AuthenticationDomainService` — espelha [src/domain/services/authentication/](../../../../src/domain/services/authentication/README.md).

## Conteúdo (Missão ENG-0002.10B)

- [authentication-domain-service.test.ts](authentication-domain-service.test.ts) — 9 testes via `InMemoryUserRepository`/`FakePasswordVerifier` (fakes em memória, definidos só neste arquivo, não são entregáveis de produção): fluxo válido, usuário inexistente, usuário desativado, credencial inválida, falha do `PasswordVerifier`, falha do `UserRepository`, uniformidade de mensagem entre as 3 causas de falha de domínio, ausência de `details`/`metadata` reveladores, ausência de exceção.

## Status

🟢 9 testes implementados e passando (Missão ENG-0002.10B).
