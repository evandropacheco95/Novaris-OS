"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ListPlus } from "lucide-react";
import { addChecklistItem, createChecklist, getToken, listChecklists, listParties, toggleChecklistItem, type Checklist, type Party } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

/** Tela de Checklists (`ADR-0045`, `ENG-0146`) — Activity Domain, elevada em `ENG-0147`. */
export default function ChecklistsPage() {
  const router = useRouter();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [partyId, setPartyId] = useState("");
  const [title, setTitle] = useState("");
  const [newItemLabel, setNewItemLabel] = useState<Record<string, string>>({});
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
      const [checklistList, partyList] = await Promise.all([listChecklists(), listParties()]);
      setChecklists(checklistList);
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
      await createChecklist(partyId, title);
      setTitle("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Checklist");
    }
  }

  async function handleAddItem(checklistId: string): Promise<void> {
    const label = newItemLabel[checklistId];
    if (!label) return;
    setError(null);
    try {
      await addChecklistItem(checklistId, label);
      setNewItemLabel((prev) => ({ ...prev, [checklistId]: "" }));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao adicionar item");
    }
  }

  async function handleToggle(checklistId: string, itemId: string): Promise<void> {
    setError(null);
    try {
      await toggleChecklistItem(checklistId, itemId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao alternar item");
    }
  }

  return (
    <DashboardShell title="Activity">
      <PageHeader title="Checklists" description="Listas de tarefas vinculadas a Parties." actions={<Button variant="secondary" size="sm" onClick={() => router.push("/activity")}>← Activity</Button>} />

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)} required>
          <option value="">Party</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ flex: 1 }} />
        <Button type="submit" icon={<ListPlus size={15} />}>
          Novo Checklist
        </Button>
      </form>

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {!loading && checklists.length === 0 && <EmptyState message="Nenhum Checklist ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {checklists.map((checklist) => {
          const total = checklist.items.length;
          const done = checklist.items.filter((i) => i.completed).length;
          return (
            <Card key={checklist.id} padding={18}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontSize: 14, color: "var(--nov-s100)", fontWeight: 600 }}>{checklist.title}</div>
                {total > 0 && <div style={{ fontSize: 11.5, color: "var(--nov-s500)" }}>{done}/{total}</div>}
              </div>
              <div style={{ fontSize: 12, color: "var(--nov-s500)", marginBottom: 12 }}>{partyName(checklist.partyId)}</div>

              {total > 0 && (
                <div style={{ height: 4, borderRadius: 4, background: "var(--nov-border)", marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: "var(--nov-b500)", transition: "width var(--transition)" }} />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {checklist.items.map((item) => (
                  <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={item.completed} onChange={() => handleToggle(checklist.id, item.id)} />
                    <span style={{ fontSize: 13, color: item.completed ? "var(--nov-s500)" : "var(--nov-s200)", textDecoration: item.completed ? "line-through" : "none" }}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  placeholder="Novo item"
                  value={newItemLabel[checklist.id] ?? ""}
                  onChange={(e) => setNewItemLabel((prev) => ({ ...prev, [checklist.id]: e.target.value }))}
                  style={{ flex: 1 }}
                />
                <Button size="sm" onClick={() => handleAddItem(checklist.id)}>
                  Adicionar
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
