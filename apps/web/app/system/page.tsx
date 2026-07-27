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

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}
      {!loading && entries.length === 0 && <EmptyState message="Nenhuma entrada de auditoria ainda." />}

      <div className="flex flex-col gap-2.5">
        {entries.map((entry) => (
          <Card key={entry.id} padding={18}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-nov-s200">
                <Tag>{entry.action}</Tag> em <Tag tone="accent">{entry.targetType}</Tag>
              </div>
              <div className="text-xs text-nov-s500">{formatDateTime(entry.occurredAt)}</div>
            </div>
            <div className="mt-2 text-xs text-nov-s500">
              Ator: {entry.actorId} · Origem: {entry.origin}
            </div>
            {entry.changeSet && (
              <pre className="mt-2.5 overflow-x-auto rounded-nov-sm border border-nov-border bg-nov-bg2 p-2.5 text-xs text-nov-s400">
                {JSON.stringify(entry.changeSet, null, 2)}
              </pre>
            )}
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
