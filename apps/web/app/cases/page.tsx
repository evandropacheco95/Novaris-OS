"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { closeCase, createCase, getToken, listCases, listParties, startCase, type Case, type CasePriority, type CaseStatus, type Party } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const STATUS_LABEL: Record<CaseStatus, string> = {
  new: "Novo",
  in_progress: "Em atendimento",
  closed: "Fechado",
};

const STATUS_TONE: Record<CaseStatus, "accent" | "success" | "danger"> = {
  new: "accent",
  in_progress: "accent",
  closed: "success",
};

const PRIORITY_TONE: Record<CasePriority, "neutral" | "accent" | "danger"> = {
  low: "neutral",
  medium: "accent",
  high: "danger",
};

/**
 * Tela de Cases (`ADR-0043`, `ENG-0144`) — adaptada do Service Cloud do
 * Salesforce, elevada em `ENG-0147`.
 */
export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [partyId, setPartyId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CasePriority>("medium");
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
      const [caseList, partyList] = await Promise.all([listCases(), listParties()]);
      setCases(caseList);
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
    setError(null);
    try {
      await createCase(partyId, subject, priority, description || undefined);
      setSubject("");
      setDescription("");
      setPriority("medium");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Case");
    }
  }

  async function handleTransition(id: string, action: "start" | "close"): Promise<void> {
    setError(null);
    try {
      if (action === "start") await startCase(id);
      if (action === "close") await closeCase(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar Case");
    }
  }

  return (
    <DashboardShell title="Activity">
      <PageHeader title="Cases" description="Atendimento a Parties, adaptado do Salesforce Service Cloud." actions={<Button variant="secondary" size="sm" onClick={() => router.push("/activity")}>← Activity</Button>} />

      <form onSubmit={handleCreate} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)} required>
          <option value="">Party</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Input placeholder="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)} required style={{ flex: 1 }} />
        <Input placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} style={{ flex: 1 }} />
        <Select value={priority} onChange={(e) => setPriority(e.target.value as CasePriority)}>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </Select>
        <Button type="submit" icon={<LifeBuoy size={15} />}>
          Novo Case
        </Button>
      </form>

      {!loading && parties.length === 0 && (
        <p style={{ color: "var(--nov-s500)", fontSize: 13, marginBottom: 16 }}>Cadastre uma Party em Relationship antes de criar um Case.</p>
      )}

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {!loading && cases.length === 0 && <EmptyState message="Nenhum Case ainda." />}

      {!loading && cases.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {(["new", "in_progress", "closed"] as const).map((status) => {
            const columnCases = cases.filter((c) => c.status === status);
            return (
              <div key={status}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 2px" }}>
                  <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
                  <span style={{ fontSize: 12, color: "var(--nov-s500)" }}>{columnCases.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {columnCases.map((caseInstance) => (
                    <Card key={caseInstance.id} padding={16}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontSize: 14, color: "var(--nov-s100)", fontWeight: 600 }}>{caseInstance.subject}</div>
                        <div style={{ fontSize: 11.5, color: "var(--nov-s500)" }}>
                          {partyName(caseInstance.partyId)}
                          {caseInstance.description ? ` · ${caseInstance.description}` : ""}
                        </div>
                        <Tag tone={PRIORITY_TONE[caseInstance.priority]}>{caseInstance.priority}</Tag>
                        {caseInstance.status !== "closed" && (
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            {caseInstance.status === "new" && (
                              <Button size="sm" onClick={() => handleTransition(caseInstance.id, "start")}>
                                Iniciar
                              </Button>
                            )}
                            <Button size="sm" variant="secondary" onClick={() => handleTransition(caseInstance.id, "close")}>
                              Fechar
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  {columnCases.length === 0 && <div style={{ fontSize: 12, color: "var(--nov-s600)", padding: "10px 2px" }}>Nenhum aqui.</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
