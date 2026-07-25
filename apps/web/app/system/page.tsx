"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, listAuditEntries, type AuditEntry } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

/**
 * Tela de System — Audit Domain (`ADR-0035`, `ENG-0135`), elevada em
 * `ENG-0147`. Somente leitura — entradas nascem só do enriquecimento
 * automático da Application Layer, nunca de ação manual do usuário.
 */
export default function SystemPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
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
      const all = await listAuditEntries();
      setEntries([...all].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("pt-BR");
  }

  return (
    <DashboardShell title="System">
      <PageHeader title="Trilha de Auditoria" description="Registro imutável de alterações — cada entrada nasce automaticamente, sem criação manual." />

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {!loading && entries.length === 0 && <EmptyState message="Nenhuma entrada de auditoria ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map((entry) => (
          <Card key={entry.id} padding={18}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, color: "var(--nov-s200)", display: "flex", alignItems: "center", gap: 8 }}>
                <Tag>{entry.action}</Tag> em <Tag tone="accent">{entry.targetType}</Tag>
              </div>
              <div style={{ fontSize: 12, color: "var(--nov-s500)" }}>{formatDateTime(entry.occurredAt)}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--nov-s500)", marginTop: 8 }}>
              Ator: {entry.actorId} · Origem: {entry.origin}
            </div>
            {entry.changeSet && (
              <pre
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--nov-s400)",
                  background: "var(--nov-bg2)",
                  border: "1px solid var(--nov-border)",
                  padding: 10,
                  borderRadius: "var(--radius-sm)",
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(entry.changeSet, null, 2)}
              </pre>
            )}
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
