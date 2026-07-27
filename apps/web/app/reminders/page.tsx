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
import { StatusDonut } from "@/components/status-donut";

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

      {!loading && reminders.length > 0 && (
        <div className="mb-6 max-w-[380px]">
          <StatusDonut
            title="Reminders por status"
            data={[
              { label: "Ativo", value: reminders.filter((r) => !r.dismissed).length, color: "var(--nov-b500)" },
              { label: "Dispensado", value: reminders.filter((r) => r.dismissed).length, color: "var(--nov-s500)" },
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
        <Input placeholder="Mensagem" value={message} onChange={(e) => setMessage(e.target.value)} required className="flex-1" />
        <Input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} required />
        <Button type="submit" icon={<BellPlus size={15} />}>
          Novo Reminder
        </Button>
      </form>

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}
      {!loading && reminders.length === 0 && <EmptyState message="Nenhum Reminder ainda." />}

      <div className="flex flex-col gap-2.5">
        {reminders.map((reminder) => (
          <Card key={reminder.id} padding={18} className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-nov-s100">{reminder.message}</div>
              <div className="text-xs text-nov-s500">
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
