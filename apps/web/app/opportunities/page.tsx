"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Handshake } from "lucide-react";
import { createOpportunity, getToken, useCurrentUser, listOpportunities, listParties, markLost, markWon, type Opportunity, type Party } from "@/lib/api";
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
 * (`Card`/`Button`/`PageHeader`/`EmptyState`). Migrado para Tailwind em
 * `ENG-0157`.
 */
export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [partyId, setPartyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useCurrentUser();

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

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)} required className="flex-1">
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

      {!loading && parties.length === 0 && <p className="mb-4 text-[13px] text-nov-s500">Cadastre uma Party em Relationship antes de criar uma Opportunity.</p>}

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}
      {!loading && opportunities.length === 0 && <EmptyState message="Nenhuma Opportunity ainda." />}

      {!loading && opportunities.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {(["open", "won", "lost"] as const).map((status) => {
            const columnOpportunities = opportunities.filter((o) => o.status === status);
            return (
              <div key={status}>
                <div className="mb-3 flex items-center gap-2 px-0.5">
                  <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
                  <span className="text-xs text-nov-s500">{columnOpportunities.length}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {columnOpportunities.map((opportunity) => (
                    <Card key={opportunity.id} padding={16}>
                      <div className="flex flex-col gap-2">
                        <div className="font-mono text-[11px] text-nov-s500">{opportunity.id.slice(0, 8)}</div>
                        <div className="text-sm font-semibold text-nov-s100">{partyName(opportunity.partyId)}</div>
                        {opportunity.status === "open" && (
                          <div className="mt-1 flex gap-2">
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
                  {columnOpportunities.length === 0 && <div className="px-0.5 py-2.5 text-xs text-nov-s600">Nenhuma aqui.</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
