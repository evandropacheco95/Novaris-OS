"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import { createCampaign, getToken, listCampaigns, type Campaign } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

/**
 * Tela de Marketing — Marketing Domain (`ENG-0133`), elevada em `ENG-0147`.
 * Lista/cria Campaigns. `startDate`/`endDate` opcionais (`ADR-0033`).
 */
export default function MarketingPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      setCampaigns(await listCampaigns());
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
      await createCampaign(
        name,
        startDate ? new Date(startDate).toISOString() : undefined,
        endDate ? new Date(endDate).toISOString() : undefined,
      );
      setName("");
      setStartDate("");
      setEndDate("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Campaign");
    }
  }

  function formatDate(iso?: string): string | undefined {
    if (!iso) return undefined;
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  return (
    <DashboardShell title="Marketing">
      <PageHeader title="Marketing" description="Campanhas de marketing." />

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <Input placeholder="Nome da campanha" value={name} onChange={(e) => setName(e.target.value)} required style={{ flex: 1 }} />
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button type="submit" icon={<Megaphone size={15} />}>
          Nova Campaign
        </Button>
      </form>

      {!loading && campaigns.length === 0 && <EmptyState message="Nenhuma Campaign ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {campaigns.map((campaign) => (
          <Card key={campaign.id} padding={18}>
            <div style={{ fontSize: 14, color: "var(--nov-s200)" }}>{campaign.name}</div>
            {(campaign.startDate || campaign.endDate) && (
              <div style={{ fontSize: 12, color: "var(--nov-s500)", marginTop: 6 }}>
                {formatDate(campaign.startDate) ?? "—"} até {formatDate(campaign.endDate) ?? "—"}
              </div>
            )}
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
