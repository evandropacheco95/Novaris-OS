"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, MapPin } from "lucide-react";
import { createCalendarEvent, getToken, listCalendarEvents, listParties, type CalendarEvent, type Party } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

/** Tela de CalendarEvents (`ADR-0045`, `ENG-0146`) — adaptada do Salesforce Event, elevada em `ENG-0147`. */
export default function CalendarEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [partyId, setPartyId] = useState("");
  const [subject, setSubject] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
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
      const [eventList, partyList] = await Promise.all([listCalendarEvents(), listParties()]);
      setEvents(eventList);
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
      await createCalendarEvent(partyId, subject, new Date(startAt).toISOString(), new Date(endAt).toISOString(), location || undefined);
      setSubject("");
      setStartAt("");
      setEndAt("");
      setLocation("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar CalendarEvent");
    }
  }

  return (
    <DashboardShell title="Activity">
      <PageHeader title="Calendário" description="Compromissos com Parties, adaptado do Salesforce Event." actions={<Button variant="secondary" size="sm" onClick={() => router.push("/activity")}>← Activity</Button>} />

      <form onSubmit={handleCreate} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)} required>
          <option value="">Party</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Input placeholder="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
        <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
        <Input placeholder="Local (opcional)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Button type="submit" icon={<CalendarPlus size={15} />}>
          Novo Evento
        </Button>
      </form>

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {!loading && events.length === 0 && <EmptyState message="Nenhum evento ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {events.map((event) => (
          <Card key={event.id} padding={18}>
            <div style={{ fontSize: 14, color: "var(--nov-s100)", fontWeight: 600 }}>{event.subject}</div>
            <div style={{ fontSize: 12, color: "var(--nov-s500)", marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span>{partyName(event.partyId)}</span>
              <span>·</span>
              <span>
                {new Date(event.startAt).toLocaleString("pt-BR")} — {new Date(event.endAt).toLocaleString("pt-BR")}
              </span>
              {event.location && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={12} /> {event.location}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
