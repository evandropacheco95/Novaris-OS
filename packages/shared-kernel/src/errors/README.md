# errors

## Objetivo

Tipos de erro compartilhados entre serviços — Business Errors nunca são `Error` genérico ([ENGINEERING_PLAYBOOK.md § 10 — Error Handling](../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#10-error-handling)).

## Conteúdo (Missão ENG-0001.4 — Domain Error System)

10 classes, hierarquia de 3 níveis:

```
AppError (abstrata, estende Error nativo)
├── DomainError (abstrata)
│   ├── ValidationError        — VALIDATION_ERROR
│   ├── BusinessRuleError      — BUSINESS_RULE_ERROR
│   ├── AuthorizationError     — AUTHORIZATION_ERROR
│   ├── AuthenticationError    — AUTHENTICATION_ERROR
│   ├── ConflictError          — CONFLICT_ERROR
│   └── NotFoundError          — NOT_FOUND_ERROR
├── InfrastructureError        — INFRASTRUCTURE_ERROR
└── UnexpectedError            — UNEXPECTED_ERROR
```

`InfrastructureError`/`UnexpectedError` são filhas diretas de `AppError`, não de `DomainError` — [ENGINEERING_PLAYBOOK.md § 10](../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#10-error-handling) já separa Infrastructure Errors de Business Errors como categorias distintas.

Toda subclasse concreta expõe `code` (string fixa), `message`, `details`, `metadata` e `cause` — todos explicitamente tipados (`AppErrorOptions`). Compatível com [`Result<T, E>`](../types/README.md) como tipo de erro (`Result<T, DomainError>`).

## Status

🟢 10 classes implementadas e testadas (Missão ENG-0001.4). Nenhum outro tipo de erro implementado.
