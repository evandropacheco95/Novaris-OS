"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PhoneCall } from "lucide-react";
import {
  completeActivity,
  createActivity,
  getToken,
  listActivities,
  listParties,
  type Activity,
  type ActivityType,
  type Party,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const ACTIVITY_TYPES: ActivityType[] = ["ligacao", "whatsapp", "email", "reuniao", "visita", "nota"];

/**
 * Tela de Activity — Activity Domain (`ENG-0133`), elevada em `ENG-0147`.
 * Lista/cria Activities vinculadas a uma Party e permite concluí-las.
 */
export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [partyId, setPartyId] = useState("");
  const [type, setType] = useState<ActivityType>("ligacao");
  const [notes, setNotes] = useState("");

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
      const [a, p] = await Promise.all([listActivities(), listParties()]);
      setActivities(a);
      setParties(p);
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
      await createActivity(partyId, type, notes || undefined);
      setNotes("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Activity");
    }
  }

  async function handleComplete(id: string): Promise<void> {
    setError(null);
    try {
      await completeActivity(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao concluir Activity");
    }
  }

  function partyName(id: string): string {
    return parties.find((p) => p.id === id)?.name ?? id;
  }

  return (
    <DashboardShell title="Activity">
      <PageHeader
        title="Activity"
        description="Interações com Parties — ligações, e-mails, reuniões e mais."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => router.push("/cases")}>Cases →</Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/comments")}>Comments →</Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/calendar-events")}>Calendário →</Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/reminders")}>Reminders →</Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/checklists")}>Checklists →</Button>
          </>
        }
      />

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)} required>
          <option value="">Party</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Input placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ flex: 1 }} />
        <Button type="submit" icon={<PhoneCall size={15} />}>
          Nova Activity
        </Button>
      </form>

      {!loading && parties.length === 0 && (
        <p style={{ color: "var(--nov-s500)", fontSize: 13, marginBottom: 16 }}>Cadastre uma Party em Relationship antes de criar uma Activity.</p>
      )}
      {!loading && activities.length === 0 && <EmptyState message="Nenhuma Activity ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {activities.map((activity) => (
          <Card key={activity.id} padding={18} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, color: "var(--nov-s200)", display: "flex", alignItems: "center", gap: 8 }}>
                {partyName(activity.partyId)} <Tag>{activity.type}</Tag>
              </div>
              {activity.notes && <div style={{ fontSize: 12, color: "var(--nov-s400)", marginTop: 6 }}>{activity.notes}</div>}
              <div style={{ marginTop: 8 }}>
                <Tag tone={activity.status === "completed" ? "success" : "neutral"}>
                  {activity.status === "completed" ? "Concluída" : "Aberta"}
                </Tag>
              </div>
            </div>
            {activity.status === "open" && (
              <Button size="sm" onClick={() => handleComplete(activity.id)}>
                Concluir
              </Button>
            )}
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
