# value-objects

Value Objects do domínio Identity, previstos em [IDENTITY_TECHNICAL_BLUEPRINT.md § 3](../../../IDENTITY_TECHNICAL_BLUEPRINT.md).

## Conteúdo (Missão ENG-0002.3 — Identity Value Objects)

- [permission.ts](permission.ts) — `Permission`: formato `<domínio>.<recurso>.<ação>`, validado na criação via `Permission.create(code)`, devolve `Result<Permission, ValidationError>`.
- [email.ts](email.ts) — `Email`: normaliza (trim + lowercase) e valida na criação via `Email.create(value)`, devolve `Result<Email, ValidationError>`.

Ambos estendem `ValueObject<T>` do Shared Kernel (`@novaris/shared-kernel`, ENG-0001.2) — imutáveis, sem setters, igualdade por deep equality, construtor privado (força uso do factory `create`, que nunca lança exceção — retorna `Result`).

## Status

🟢 2 Value Objects implementados e testados (Missão ENG-0002.3). Nenhum outro Value Object previsto em `IDENTITY_TECHNICAL_BLUEPRINT.md § 3`.
