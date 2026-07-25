"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BellPlus, Check } from "lucide-react";
import { createReminder, dismissReminder, getToken, listParties, listReminders, type Party, type Reminder } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

/** Tela de Reminders (`ADR-0045`, `ENG-0146`) — adaptada do Salesforce Reminder, elevada em `ENG-0147`. */
export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [partyId, setPartyId] = useState("");
  const [message, setMessage] = useState("");
  const [remindAt, setRemindAt] = useState("");
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
      const [reminderList, partyList] = await Promise.all([listReminders(), listParties()]);
      setReminders(reminderList);
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
      await createReminder(partyId, message, new Date(remindAt).toISOString());
      setMessage("");
      setRemindAt("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Reminder");
    }
  }

  async function handleDismiss(id: string): Promise<void> {
    setError(null);
    try {
      await dismissReminder(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao dispensar Reminder");
    }
  }

  return (
    <DashboardShell title="Activity">
      <PageHeader title="Reminders" description="Lembretes vinculados a Parties, adaptado do Salesforce Reminder." actions={<Button variant="secondary" size="sm" onClick={() => router.push("/activity")}>← Activity</Button>} />

      <form onSubmit={handleCreate} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)} required>
          <option value="">Party</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Input placeholder="Mensagem" value={message} onChange={(e) => setMessage(e.target.value)} required style={{ flex: 1 }} />
        <Input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} required />
        <Button type="submit" icon={<BellPlus size={15} />}>
          Novo Reminder
        </Button>
      </form>

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {!loading && reminders.length === 0 && <EmptyState message="Nenhum Reminder ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reminders.map((reminder) => (
          <Card key={reminder.id} padding={18} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 14, color: "var(--nov-s100)" }}>{reminder.message}</div>
              <div style={{ fontSize: 12, color: "var(--nov-s500)" }}>
                {partyName(reminder.partyId)} · {new Date(reminder.remindAt).toLocaleString("pt-BR")}
              </div>
              <Tag tone={reminder.dismissed ? "neutral" : "accent"}>{reminder.dismissed ? "Dispensado" : "Ativo"}</Tag>
            </div>
            {!reminder.dismissed && (
              <Button size="sm" icon={<Check size={14} />} onClick={() => handleDismiss(reminder.id)}>
                Dispensar
              </Button>
            )}
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
