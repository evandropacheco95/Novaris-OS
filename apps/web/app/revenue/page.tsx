"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, listRevenues, type Revenue } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/button";

/**
 * Tela de Revenue (`ADR-0047`) — último objeto oficial do Sales Domain sem
 * forma definida desde `ADR-0044`. Somente leitura — nasce só via
 * "Reconhecer Revenue" em `/contracts` (Contract `active`), nunca criação
 * manual avulsa, mesmo princípio de `/system` (Audit).
 */
export default function RevenuePage() {
  const router = useRouter();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      const all = await listRevenues();
      setRevenues([...all].sort((a, b) => new Date(b.recognizedAt).getTime() - new Date(a.recognizedAt).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  const totalsByCurrency = revenues.reduce<Record<string, number>>((acc, revenue) => {
    acc[revenue.currency] = (acc[revenue.currency] ?? 0) + revenue.amount;
    return acc;
  }, {});

  return (
    <DashboardShell title="Sales">
      <PageHeader
        title="Revenue"
        description="Valor reconhecido a partir de Contracts ativos — registro pontual, sem criação manual avulsa."
        actions={<Button variant="secondary" size="sm" onClick={() => router.push("/contracts")}>← Contracts</Button>}
      />

      {!loading && revenues.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {Object.entries(totalsByCurrency).map(([currency, total]) => (
            <Card key={currency} padding={16} style={{ minWidth: 160 }}>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--ff-display)", color: "var(--nov-s50)" }}>
                {currency} {total.toFixed(2)}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--nov-s500)", marginTop: 4 }}>Total reconhecido ({currency})</div>
            </Card>
          ))}
        </div>
      )}

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {!loading && revenues.length === 0 && <EmptyState message="Nenhum Revenue ainda — reconheça um a partir de um Contract ativo." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {revenues.map((revenue) => (
          <Card key={revenue.id} padding={18}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 14, color: "var(--nov-s100)", fontWeight: 600 }}>
                  {revenue.currency} {revenue.amount.toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: "var(--nov-s500)" }}>Contract: {revenue.contractId.slice(0, 8)}</div>
              </div>
              <Tag>{formatDate(revenue.recognizedAt)}</Tag>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
