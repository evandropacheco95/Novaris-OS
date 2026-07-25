"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ShieldPlus, ShieldCheck } from "lucide-react";
import {
  activateUser,
  assignRole,
  createRole,
  createUser,
  disableUser,
  getToken,
  grantPermission,
  listRoles,
  listUsers,
  revokeRole,
  type IdentityUser,
  type Role,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { StatusDonut } from "@/components/status-donut";

const STATUS_TONE: Record<IdentityUser["status"], "accent" | "success" | "neutral" | "danger"> = {
  created: "neutral",
  invited: "accent",
  active: "success",
  disabled: "danger",
};

/**
 * Tela de Equipe — Identity Domain (`ENG-0128`), elevada em `ENG-0147`.
 * Lista/cria Users e Roles da Organization autenticada, ativa/desativa
 * Users, atribui/revoga Roles, concede Permissions a Roles.
 */
export default function TeamPage() {
  const router = useRouter();
  const [users, setUsers] = useState<IdentityUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("");
  const [permissionCode, setPermissionCode] = useState("");
  const [permissionRoleId, setPermissionRoleId] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    void refresh();
  }, []);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([listUsers(), listRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createUser(email);
      setEmail("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar User");
    }
  }

  async function handleCreateRole(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createRole(roleName);
      setRoleName("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Role");
    }
  }

  async function handleGrantPermission(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!permissionRoleId) return;
    setError(null);
    try {
      await grantPermission(permissionRoleId, permissionCode);
      setPermissionCode("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao conceder Permission");
    }
  }

  async function handleToggleStatus(user: IdentityUser): Promise<void> {
    setError(null);
    try {
      if (user.status === "active") {
        await disableUser(user.id);
      } else if (user.status === "created" || user.status === "invited") {
        await activateUser(user.id);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar status");
    }
  }

  async function handleRoleToggle(user: IdentityUser, roleId: string, checked: boolean): Promise<void> {
    setError(null);
    try {
      if (checked) {
        await assignRole(user.id, roleId);
      } else {
        await revokeRole(user.id, roleId);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar Role");
    }
  }

  return (
    <DashboardShell title="Identity">
      <PageHeader title="Identity" description="Usuários, Roles e Permissions da sua Organization." />

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}

      <section style={{ marginBottom: 36 }}>
        <h2 style={sectionTitleStyle}>Usuários</h2>

        {!loading && users.length > 0 && (
          <div style={{ maxWidth: 380, marginBottom: 20 }}>
            <StatusDonut
              title="Usuários por status"
              data={[
                { label: "Criado", value: users.filter((u) => u.status === "created").length, color: "var(--nov-s500)" },
                { label: "Convidado", value: users.filter((u) => u.status === "invited").length, color: "var(--nov-b500)" },
                { label: "Ativo", value: users.filter((u) => u.status === "active").length, color: "var(--nov-success)" },
                { label: "Desativado", value: users.filter((u) => u.status === "disabled").length, color: "var(--nov-danger)" },
              ]}
            />
          </div>
        )}

        <form onSubmit={handleCreateUser} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ flex: 1 }} />
          <Button type="submit" icon={<UserPlus size={15} />}>
            Novo Usuário
          </Button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((user) => (
            <Card key={user.id} padding={18}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, color: "var(--nov-s200)", marginBottom: 6 }}>{user.email}</div>
                  <Tag tone={STATUS_TONE[user.status]}>{user.status}</Tag>
                </div>
                {user.status !== "disabled" && (
                  <Button size="sm" variant="secondary" onClick={() => handleToggleStatus(user)}>
                    {user.status === "active" ? "Desativar" : "Ativar"}
                  </Button>
                )}
              </div>
              {roles.length > 0 && (
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12, borderTop: "1px solid var(--nov-border)", paddingTop: 12 }}>
                  {roles.map((role) => (
                    <label key={role.id} style={{ fontSize: 12, color: "var(--nov-s400)", display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={user.roleIds.includes(role.id)}
                        onChange={(e) => handleRoleToggle(user, role.id, e.target.checked)}
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Roles</h2>
        <form onSubmit={handleCreateRole} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <Input placeholder="Nome da Role" value={roleName} onChange={(e) => setRoleName(e.target.value)} required style={{ flex: 1 }} />
          <Button type="submit" icon={<ShieldPlus size={15} />}>
            Nova Role
          </Button>
        </form>

        <form onSubmit={handleGrantPermission} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Select value={permissionRoleId} onChange={(e) => setPermissionRoleId(e.target.value)} required>
            <option value="">Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
          <Input placeholder="dominio.recurso.acao" value={permissionCode} onChange={(e) => setPermissionCode(e.target.value)} required style={{ flex: 1 }} />
          <Button type="submit" icon={<ShieldCheck size={15} />}>
            Conceder Permission
          </Button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {roles.map((role) => (
            <Card key={role.id} padding={18}>
              <div style={{ fontSize: 14, color: "var(--nov-s200)", marginBottom: 8 }}>{role.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {role.permissions.map((code) => (
                  <Tag key={code} tone="neutral">
                    {code}
                  </Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

const sectionTitleStyle = { fontSize: 14, fontWeight: 700, color: "var(--nov-s200)", marginBottom: 14, letterSpacing: "-0.01em" };
