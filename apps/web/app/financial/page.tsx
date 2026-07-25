"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ReceiptText, Wallet } from "lucide-react";
import {
  createInvoice,
  createSubscription,
  getToken,
  listInvoices,
  listSubscriptions,
  markInvoicePaid,
  type Invoice,
  type Subscription,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusDonut } from "@/components/status-donut";

/**
 * Tela de Financial — Financial Domain (`ENG-0131`), elevada em `ENG-0147`.
 * Lista/cria Invoices e Subscriptions, marca Invoice como paga.
 */
export default function FinancialPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [subName, setSubName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [subscriptionId, setSubscriptionId] = useState("");

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
      const [i, s] = await Promise.all([listInvoices(), listSubscriptions()]);
      setInvoices(i);
      setSubscriptions(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSubscription(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createSubscription(subName);
      setSubName("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Subscription");
    }
  }

  async function handleCreateInvoice(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createInvoice(Number(amount), currency, subscriptionId || undefined);
      setAmount("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Invoice");
    }
  }

  async function handleMarkPaid(id: string): Promise<void> {
    setError(null);
    try {
      await markInvoicePaid(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao marcar como paga");
    }
  }

  function subscriptionName(id?: string): string | undefined {
    if (!id) return undefined;
    return subscriptions.find((s) => s.id === id)?.name ?? id;
  }

  return (
    <DashboardShell title="Financial">
      <PageHeader title="Financial" description="Faturas e planos de assinatura." />

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}

      <section style={{ marginBottom: 36 }}>
        <h2 style={sectionTitleStyle}>Subscriptions</h2>
        <form onSubmit={handleCreateSubscription} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Input placeholder="Nome do plano" value={subName} onChange={(e) => setSubName(e.target.value)} required style={{ flex: 1 }} />
          <Button type="submit" icon={<Wallet size={15} />}>
            Nova Subscription
          </Button>
        </form>

        {!loading && subscriptions.length === 0 && <EmptyState message="Nenhuma Subscription ainda." />}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} padding={16}>
              <div style={{ fontSize: 14, color: "var(--nov-s200)" }}>{subscription.name}</div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Invoices</h2>

        {!loading && invoices.length > 0 && (
          <div style={{ maxWidth: 380, marginBottom: 20 }}>
            <StatusDonut
              title="Invoices por status"
              data={[
                { label: "Pendente", value: invoices.filter((i) => i.status === "pending").length, color: "var(--nov-warning)" },
                { label: "Paga", value: invoices.filter((i) => i.status === "paid").length, color: "var(--nov-success)" },
              ]}
            />
          </div>
        )}

        <form onSubmit={handleCreateInvoice} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Input placeholder="Valor" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: 120 }} />
          <Input placeholder="Moeda" value={currency} onChange={(e) => setCurrency(e.target.value)} required style={{ width: 90 }} />
          <Select value={subscriptionId} onChange={(e) => setSubscriptionId(e.target.value)}>
            <option value="">Sem Subscription (avulsa)</option>
            {subscriptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Button type="submit" icon={<ReceiptText size={15} />}>
            Nova Invoice
          </Button>
        </form>

        {!loading && invoices.length === 0 && <EmptyState message="Nenhuma Invoice ainda." />}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {invoices.map((invoice) => (
            <Card key={invoice.id} padding={18} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, color: "var(--nov-s200)" }}>
                  {invoice.currency} {invoice.amount.toFixed(2)}
                </div>
                {invoice.subscriptionId && (
                  <div style={{ fontSize: 12, color: "var(--nov-s500)", marginTop: 4 }}>{subscriptionName(invoice.subscriptionId)}</div>
                )}
                <div style={{ marginTop: 6 }}>
                  <Tag tone={invoice.status === "paid" ? "success" : "neutral"}>{invoice.status === "paid" ? "Paga" : "Pendente"}</Tag>
                </div>
              </div>
              {invoice.status === "pending" && (
                <Button size="sm" onClick={() => handleMarkPaid(invoice.id)}>
                  Marcar como paga
                </Button>
              )}
            </Card>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

const sectionTitleStyle = { fontSize: 14, fontWeight: 700, color: "var(--nov-s200)", marginBottom: 14, letterSpacing: "-0.01em" };
