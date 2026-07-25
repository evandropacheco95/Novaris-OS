# OBJECT SPECIFICATION

Nome: Permission

Categoria: Core Objects

Versão: 0.1.0

Status: 🚧 Estrutura criada (Missão ARCH-001) — parcialmente preenchida a partir de fontes já oficiais, resto `TODO`

---

# 1. Objetivo

Representa uma permissão granular ([BOM.md § 4](../BOM.md)).

---

# 2. Problema que resolve

**TODO**

---

# 3. Responsabilidades

Nomear uma ação autorizável, no formato `<domínio>.<recurso>.<ação>` — exemplos já oficiais: `crm.leads.read`, `crm.leads.create`, `financial.invoice.delete` ([BOM.md § 4](../BOM.md)).

---

# 4. Não Responsabilidades

Verificação de identidade (ver [User.md](User.md)), agrupamento de permissões (ver [Role.md](Role.md)).

---

# 5. Atributos

**TODO** — os exemplos em `BOM.md` mostram o formato do nome (`<domínio>.<recurso>.<ação>`), mas não há esquema de atributos formalizado.

---

# 6. Estados

**TODO**

---

# 7. Ciclo de Vida

**TODO**

---

# 8. Relacionamentos

`Role` (composição), `User` (verificação indireta via Role) — inferido de `BOM.md § 4`.

---

# 9. Eventos

**TODO** — nenhum evento de `Permission` foi nomeado em documento oficial ainda.

---

# 10. Regras de Negócio

**TODO** — nenhuma regra de resolução de conflito (ex.: permissão negada explicitamente vs. herdada de Role) foi definida ainda.

---

# 11. Permissões

N/A — este objeto **é** a unidade de permissão do sistema.

---

# 12. APIs

**TODO**

---

# 13. Banco

**TODO**

---

# 14. IA

**TODO** — relevante para `services/kernel/ai-runtime/`: `NOVARIS_CONSTITUTION.md Article XII` exige que toda IA valide permissões antes de agir, mas o mecanismo concreto de checagem não está definido.

---

# 15. Automações

**TODO**

---

# 16. Dashboards

**TODO**

---

# 17. Auditoria

**TODO**

---

# 18. Dependências

`services/kernel/identity/` — implementado como Value Object dentro de Identity (`Permission`, `IDENTITY_TECHNICAL_BLUEPRINT.md § 3`). `services/kernel/permissions/` não é mais uma dependência real: o módulo foi investigado e encerrado sem capacidade própria (`PERMISSION_EPIC_CLOSURE.md`, EPIC-004, atualizado por ENG-0008) — preservado como histórico, nunca implementado.

---

# 19. Riscos

**TODO**

---

# 20. Roadmap

**TODO**

---

## Status

🚧 Escrito para desbloquear a Fase B de ARCH-001 (módulo `permissions` do Kernel). Preenchido só com o que já era oficial em `BOM.md`; todo o resto é `TODO`.
