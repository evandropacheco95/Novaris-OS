"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { createDashboard, getToken, listDashboards, type Dashboard } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

/**
 * Tela de Analytics — Analytics Domain (`ENG-0133`), elevada em `ENG-0147`.
 * `Widget` não é exposto — bloqueado até um caso de uso real definir seus
 * campos de conteúdo (`ADR-0034`).
 */
export default function AnalyticsPage() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

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
      setDashboards(await listDashboards());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createDashboard(name);
      setName("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Dashboard");
    }
  }

  return (
    <DashboardShell title="Analytics">
      <PageHeader title="Analytics" description="Dashboards de indicadores." />

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Input placeholder="Nome do dashboard" value={name} onChange={(e) => setName(e.target.value)} required style={{ flex: 1 }} />
        <Button type="submit" icon={<LayoutDashboard size={15} />}>
          Novo Dashboard
        </Button>
      </form>

      {!loading && dashboards.length === 0 && <EmptyState message="Nenhum Dashboard ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id} padding={18}>
            <div style={{ fontSize: 14, color: "var(--nov-s200)" }}>{dashboard.name}</div>
            <div style={{ fontSize: 12, color: "var(--nov-s500)", marginTop: 6 }}>Sem widgets ainda</div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
