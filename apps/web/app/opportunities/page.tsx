"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Handshake } from "lucide-react";
import { createOpportunity, getToken, getUser, listOpportunities, listParties, markLost, markWon, type Opportunity, type Party } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const STATUS_LABEL: Record<Opportunity["status"], string> = {
  open: "Aberta",
  won: "Ganha",
  lost: "Perdida",
};

const STATUS_TONE: Record<Opportunity["status"], "accent" | "success" | "danger"> = {
  open: "accent",
  won: "success",
  lost: "danger",
};

/**
 * Tela de Opportunities — segunda tela real da NOVARIS (`ENG-0123`), elevada
 * visualmente em `ENG-0147` com o design system compartilhado
 * (`Card`/`Button`/`PageHeader`/`EmptyState`).
 */
export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [partyId, setPartyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== "undefined" ? getUser() : null;

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
      const [opportunityList, partyList] = await Promise.all([listOpportunities(), listParties()]);
      setOpportunities(opportunityList);
      setParties(partyList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  function partyName(id: string): string {
    return parties.find((p) => p.id === id)?.name ?? id;
  }

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!user) return;
    setError(null);
    try {
      await createOpportunity(partyId, user.organizationId);
      setPartyId("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar");
    }
  }

  async function handleClose(id: string, outcome: "won" | "lost"): Promise<void> {
    setError(null);
    try {
      await (outcome === "won" ? markWon(id) : markLost(id));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar");
    }
  }

  return (
    <DashboardShell title="Sales">
      <PageHeader
        title="Opportunities"
        description="Negociações em andamento com suas Parties."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<ArrowUpRight size={14} />} onClick={() => router.push("/leads")}>
              Leads
            </Button>
            <Button variant="secondary" size="sm" icon={<ArrowUpRight size={14} />} onClick={() => router.push("/quotations")}>
              Quotations
            </Button>
          </>
        }
      />

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)} required style={{ flex: 1 }}>
          <option value="">Party</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Button type="submit" icon={<Handshake size={15} />}>
          Nova Opportunity
        </Button>
      </form>

      {!loading && parties.length === 0 && (
        <p style={{ color: "var(--nov-s500)", fontSize: 13, marginBottom: 16 }}>Cadastre uma Party em Relationship antes de criar uma Opportunity.</p>
      )}

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {!loading && opportunities.length === 0 && <EmptyState message="Nenhuma Opportunity ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} padding={18}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 11, color: "var(--nov-s500)", fontFamily: "monospace" }}>{opportunity.id}</div>
                <div style={{ fontSize: 14, color: "var(--nov-s100)", fontWeight: 600 }}>{partyName(opportunity.partyId)}</div>
                <Tag tone={STATUS_TONE[opportunity.status]}>{STATUS_LABEL[opportunity.status]}</Tag>
              </div>
              {opportunity.status === "open" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="sm" onClick={() => handleClose(opportunity.id, "won")}>
                    Ganhar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleClose(opportunity.id, "lost")}>
                    Perder
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
