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
import { StatusDonut } from "@/components/status-donut";

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

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}

      {!loading && activities.length > 0 && (
        <div className="mb-6 max-w-[380px]">
          <StatusDonut
            title="Activities por status"
            data={[
              { label: "Aberta", value: activities.filter((a) => a.status === "open").length, color: "var(--nov-b500)" },
              { label: "Concluída", value: activities.filter((a) => a.status === "completed").length, color: "var(--nov-success)" },
            ]}
          />
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 flex flex-wrap gap-2">
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
        <Input placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1" />
        <Button type="submit" icon={<PhoneCall size={15} />}>
          Nova Activity
        </Button>
      </form>

      {!loading && parties.length === 0 && <p className="mb-4 text-[13px] text-nov-s500">Cadastre uma Party em Relationship antes de criar uma Activity.</p>}
      {!loading && activities.length === 0 && <EmptyState message="Nenhuma Activity ainda." />}

      <div className="flex flex-col gap-2.5">
        {activities.map((activity) => (
          <Card key={activity.id} padding={18} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-nov-s200">
                {partyName(activity.partyId)} <Tag>{activity.type}</Tag>
              </div>
              {activity.notes && <div className="mt-1.5 text-xs text-nov-s400">{activity.notes}</div>}
              <div className="mt-2">
                <Tag tone={activity.status === "completed" ? "success" : "neutral"}>{activity.status === "completed" ? "Concluída" : "Aberta"}</Tag>
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
