# domain

Domain Layer do serviço `identity` — Entities, Value Objects, Aggregates ([ENGINEERING_PLAYBOOK.md § 2-3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md)). Nunca importa de `infrastructure/` ou `interfaces/`.

## Conteúdo

- [value-objects/](value-objects/README.md) — `Permission`, `Email` (Missão ENG-0002.3)
- [aggregates/](aggregates/README.md) — `User` (ENG-0002.7), `Role` (ENG-0002.8)
- [domain-events/](domain-events/README.md) — 9 Domain Events, 6 de `User` (ENG-0002.7) + 3 de `Role` (ENG-0002.8)
- [repositories/](repositories/README.md) — `UserRepository`, `RoleRepository` (Missão ENG-0002.9)
- [services/](services/README.md) — `AuthenticationDomainService` (Missão ENG-0002.10B), mecanismo de credencial resolvido em [ADR-0010](../../../../../adr/ADR-0010-authentication-credential-strategy.md); `AuthorizationDomainService` (Missão ENG-0002.10C); `RoleAssignmentDomainService` (Missão ENG-0002.10D)

Os 2 Aggregate Roots do domínio ([IDENTITY_TECHNICAL_BLUEPRINT.md § 1](../../IDENTITY_TECHNICAL_BLUEPRINT.md)), seus 2 contratos de repositório ([IDENTITY_TECHNICAL_BLUEPRINT.md § 5](../../IDENTITY_TECHNICAL_BLUEPRINT.md)) e os 3 Domain Services aprovados ([DOMAIN_SERVICE_IDENTIFICATION.md](../../DOMAIN_SERVICE_IDENTIFICATION.md)) estão implementados.

## Status

🟢 `value-objects/` (ENG-0002.3), `aggregates/user/` e `domain-events/` de `User` (ENG-0002.7), `aggregates/role/` e `domain-events/` de `Role` (ENG-0002.8), `repositories/` (ENG-0002.9), `services/authentication/` (ENG-0002.10B), `services/authorization/` (ENG-0002.10C), `services/role-assignment/` (ENG-0002.10D) implementados. **Identity Domain Services completos.**
