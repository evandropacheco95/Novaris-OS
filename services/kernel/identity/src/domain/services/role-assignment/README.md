# role-assignment

`RoleAssignmentDomainService` — coordena a atribuição de um `Role` a um `User`.

## Conteúdo (Missão ENG-0002.10D)

- [role-assignment-domain-service.ts](role-assignment-domain-service.ts) — `RoleAssignmentDomainService implements AsyncDomainService<AssignRoleInput, void>` ([DOMAIN_SERVICE_IDENTIFICATION.md § 5](../../../../DOMAIN_SERVICE_IDENTIFICATION.md), R7). Fluxo: localiza `User` (`UserRepository.findById`) → localiza `Role` (`RoleRepository.findById`) → valida compatibilidade de Organization → delega a mutação a `User.assignRole()` (intocado) → persiste via `UserRepository.save()`.

## Dependências

- `UserRepository`, `RoleRepository` ([src/domain/repositories/](../../repositories/README.md)) — injetadas via construtor.

## Decisões de Escopo

- A única responsabilidade deste serviço é a checagem de multi-tenancy (`role.organizationId === user.organizationId`, [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 9](../../../../IDENTITY_AGGREGATE_DESIGN_FREEZE.md)) — nem `User` nem `Role` conseguem verificar isso sozinhos.
- `User.assignRole()` não verifica duplicidade (decisão já tomada em ENG-0002.7, não alterada aqui) — atribuir o mesmo `Role` duas vezes produz duas referências, comportamento herdado, não uma regra nova.
- `User.revokeRole()` **não** precisa deste serviço nem de um equivalente — remover uma referência não pode introduzir uma violação de multi-tenancy nova (mesma justificativa já registrada em `DOMAIN_SERVICE_IDENTIFICATION.md § 5`).

## Status

🟢 Implementado e testado (Missão ENG-0002.10D). **Os 3 Domain Services aprovados em `DOMAIN_SERVICE_IDENTIFICATION.md` estão implementados.**
