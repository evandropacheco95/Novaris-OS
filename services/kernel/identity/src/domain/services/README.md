# services

Domain Services do Identity Domain, seguindo [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../../../../../../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (ENS-0003). Lista completa de Domain Services identificados e congelados: [DOMAIN_SERVICE_IDENTIFICATION.md](../../../DOMAIN_SERVICE_IDENTIFICATION.md) (ENG-0002.10A).

## Conteúdo

- [authentication/](authentication/README.md) — `AuthenticationDomainService`, mecanismo de credencial resolvido em [ADR-0010](../../../../../../adr/ADR-0010-authentication-credential-strategy.md) (Missão ENG-0002.10B).
- [authorization/](authorization/README.md) — `AuthorizationDomainService`, verifica se um `User` possui uma `Permission` via seus `Role`s (Missão ENG-0002.10C).
- [role-assignment/](role-assignment/README.md) — `RoleAssignmentDomainService`, verifica compatibilidade de Organization antes de delegar a `User.assignRole()` (Missão ENG-0002.10D).

**Os 3 Domain Services aprovados em `DOMAIN_SERVICE_IDENTIFICATION.md` estão implementados.**

## Status

🟢 `authentication/` (ENG-0002.10B), `authorization/` (ENG-0002.10C) e `role-assignment/` (ENG-0002.10D) implementados e testados.
