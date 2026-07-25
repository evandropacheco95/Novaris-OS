# OBJECT SPECIFICATION

Nome: User

Categoria: Core Objects

Versão: 0.1.0

Status: 🚧 Estrutura criada (Missão ARCH-001) — parcialmente preenchida a partir de fontes já oficiais, resto `TODO`

---

# 1. Objetivo

Representa um usuário autenticado da plataforma NOVARIS ([BOM.md § 4](../BOM.md)).

---

# 2. Problema que resolve

**TODO**

---

# 3. Responsabilidades

Autenticação, autorização, perfis, sessões, tokens, SSO, MFA, audit login — na medida em que dizem respeito à identidade do usuário ([DOMAIN_MODEL.md — Identity Domain](../DOMAIN_MODEL.md)).

---

# 4. Não Responsabilidades

Papéis e permissões em si (ver [Role.md](Role.md), [Permission.md](Permission.md)) — `User` é titular de Roles, não os define.

---

# 5. Atributos

**TODO** — não definidos em nenhum documento oficial ainda.

---

# 6. Estados

**TODO**

---

# 7. Ciclo de Vida

**TODO** — parcialmente inferível dos eventos já definidos (§ 9), mas a sequência completa não foi especificada.

---

# 8. Relacionamentos

Organization, Roles, Teams, Tasks, Activities ([BOM.md § 4](../BOM.md)).

---

# 9. Eventos

`UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled` ([BOM.md § 4](../BOM.md)).

---

# 10. Regras de Negócio

**TODO**

---

# 11. Permissões

**TODO** — ver [Permission.md](Permission.md) para o modelo de permissão em si.

---

# 12. APIs

**TODO** — ver [services/kernel/identity/CONTRACT.md](../../../services/kernel/identity/CONTRACT.md) para as funções já esboçadas.

---

# 13. Banco

**TODO**

---

# 14. IA

**TODO**

---

# 15. Automações

**TODO**

---

# 16. Dashboards

**TODO**

---

# 17. Auditoria

Login é objeto de auditoria por [DOMAIN_MODEL.md — Identity Domain](../DOMAIN_MODEL.md) ("Audit Login"). Detalhamento: **TODO**.

---

# 18. Dependências

`services/kernel/identity/`, `services/kernel/logging/`, `services/kernel/event-bus/`.

---

# 19. Riscos

**TODO**

---

# 20. Roadmap

**TODO**

---

## Status

🚧 Escrito para desbloquear a Fase B de ARCH-001 (módulo `identity`/`users` do Kernel). Preenchido só com o que já era oficial em `BOM.md` e `DOMAIN_MODEL.md`; todo o resto é `TODO` — não inventei atributos, estados ou regras de negócio que nenhum documento definiu.
