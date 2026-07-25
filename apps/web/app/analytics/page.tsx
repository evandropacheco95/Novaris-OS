"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Plus } from "lucide-react";
import {
  addWidgetToDashboard,
  createDashboard,
  getToken,
  listActivities,
  listDashboards,
  listInvoices,
  listLeads,
  listOpportunities,
  listParties,
  listProjects,
  type Activity,
  type Dashboard,
  type Invoice,
  type Lead,
  type Opportunity,
  type Party,
  type Project,
  type Widget,
  type WidgetType,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusDonut } from "@/components/status-donut";

/** Catálogo de métricas suportadas — `metricKey` é opaco para o Backend (`ADR-0049`); só este catálogo do Frontend sabe interpretá-lo contra dados já buscados. */
const METRIC_OPTIONS: Record<WidgetType, Array<{ value: string; label: string }>> = {
  kpi: [
    { value: "opportunities.open", label: "Oportunidades abertas" },
    { value: "leads.qualifying", label: "Leads em qualificação" },
    { value: "parties.total", label: "Parties cadastradas" },
    { value: "activities.open", label: "Activities em aberto" },
    { value: "projects.total", label: "Projetos ativos" },
    { value: "invoices.pending", label: "Faturas pendentes" },
  ],
  list: [
    { value: "leads.recent", label: "Leads recentes" },
    { value: "activities.recent", label: "Activities recentes" },
  ],
  donut: [
    { value: "opportunities.byStatus", label: "Opportunities por status" },
    { value: "activities.byStatus", label: "Activities por status" },
    { value: "invoices.byStatus", label: "Invoices por status" },
  ],
  bar: [{ value: "domains.overview", label: "Visão geral por domínio" }],
};

interface MetricData {
  opportunities: Opportunity[];
  leads: Lead[];
  parties: Party[];
  activities: Activity[];
  projects: Project[];
  invoices: Invoice[];
}

/** Tela de Analytics — Analytics Domain (`ENG-0133`). `Widget` desbloqueado (`ADR-0049`) com 4 tipos de visualização, interpretados aqui a partir dos mesmos dados já usados no Dashboard principal (`ENG-0149`). */
export default function AnalyticsPage() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [widgetType, setWidgetType] = useState<WidgetType>("kpi");
  const [widgetMetric, setWidgetMetric] = useState(METRIC_OPTIONS.kpi[0]!.value);
  const [widgetTitle, setWidgetTitle] = useState("");

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
      const [dashboardList, opportunities, leads, parties, activities, projects, invoices] = await Promise.all([
        listDashboards(),
        listOpportunities(),
        listLeads(),
        listParties(),
        listActivities(),
        listProjects(),
        listInvoices(),
      ]);
      setDashboards(dashboardList);
      setMetrics({ opportunities, leads, parties, activities, projects, invoices });
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
      await createDashboard(name);
      setName("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Dashboard");
    }
  }

  function handleTypeChange(type: WidgetType): void {
    setWidgetType(type);
    setWidgetMetric(METRIC_OPTIONS[type][0]!.value);
  }

  async function handleAddWidget(dashboardId: string): Promise<void> {
    setError(null);
    try {
      const title = widgetTitle.trim() || METRIC_OPTIONS[widgetType].find((m) => m.value === widgetMetric)?.label || "Widget";
      await addWidgetToDashboard(dashboardId, widgetType, title, widgetMetric);
      setAddingToId(null);
      setWidgetTitle("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao adicionar Widget");
    }
  }

  return (
    <DashboardShell title="Analytics">
      <PageHeader title="Analytics" description="Dashboards de indicadores, com widgets configuráveis." />

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Input placeholder="Nome do dashboard" value={name} onChange={(e) => setName(e.target.value)} required style={{ flex: 1 }} />
        <Button type="submit" icon={<LayoutDashboard size={15} />}>
          Novo Dashboard
        </Button>
      </form>

      {!loading && dashboards.length === 0 && <EmptyState message="Nenhum Dashboard ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id} padding={20}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, color: "var(--nov-s100)", fontWeight: 600 }}>{dashboard.name}</div>
              <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => setAddingToId(addingToId === dashboard.id ? null : dashboard.id)}>
                Widget
              </Button>
            </div>

            {addingToId === dashboard.id && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderBottom: "1px solid var(--nov-border)", paddingBottom: 14, marginBottom: 14 }}>
                <Select value={widgetType} onChange={(e) => handleTypeChange(e.target.value as WidgetType)}>
                  <option value="kpi">KPI numérico</option>
                  <option value="list">Lista</option>
                  <option value="donut">Donut</option>
                  <option value="bar">Barra</option>
                </Select>
                <Select value={widgetMetric} onChange={(e) => setWidgetMetric(e.target.value)}>
                  {METRIC_OPTIONS[widgetType].map((metric) => (
                    <option key={metric.value} value={metric.value}>
                      {metric.label}
                    </option>
                  ))}
                </Select>
                <Input placeholder="Título (opcional)" value={widgetTitle} onChange={(e) => setWidgetTitle(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
                <Button size="sm" onClick={() => handleAddWidget(dashboard.id)}>
                  Adicionar
                </Button>
              </div>
            )}

            {dashboard.widgets.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--nov-s500)" }}>Sem widgets ainda.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {dashboard.widgets.map((widget) => (
                  <WidgetView key={widget.id} widget={widget} metrics={metrics} />
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}

function WidgetView({ widget, metrics }: { widget: Widget; metrics: MetricData | null }): JSX.Element {
  if (!metrics) return <></>;

  if (widget.type === "kpi") {
    const value = computeKpi(widget.metricKey, metrics);
    return (
      <Card padding={16} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--ff-display)", color: "var(--nov-s50)" }}>{value}</div>
        <div style={{ fontSize: 11.5, color: "var(--nov-s500)" }}>{widget.title}</div>
      </Card>
    );
  }

  if (widget.type === "list") {
    const items = computeList(widget.metricKey, metrics);
    return (
      <Card padding={16}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--nov-s200)", marginBottom: 8 }}>{widget.title}</div>
        {items.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--nov-s600)" }}>Nenhum item.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {items.map((item, i) => (
              <div key={i} style={{ fontSize: 12, color: "var(--nov-s400)" }}>
                {item}
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  if (widget.type === "donut") {
    const data = computeDonut(widget.metricKey, metrics);
    return <StatusDonut title={widget.title} data={data} />;
  }

  const bars = computeBars(metrics);
  return (
    <Card padding={16}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--nov-s200)", marginBottom: 10 }}>{widget.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bars.map((bar) => (
          <div key={bar.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--nov-s400)", marginBottom: 3 }}>
              <span>{bar.label}</span>
              <span>{bar.value}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "var(--nov-bg2)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${bar.pct}%`, background: "var(--nov-b500)", borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function computeKpi(metricKey: string, m: MetricData): number {
  switch (metricKey) {
    case "opportunities.open":
      return m.opportunities.filter((o) => o.status === "open").length;
    case "leads.qualifying":
      return m.leads.filter((l) => l.status === "new" || l.status === "contacted" || l.status === "qualified").length;
    case "parties.total":
      return m.parties.length;
    case "activities.open":
      return m.activities.filter((a) => a.status === "open").length;
    case "projects.total":
      return m.projects.length;
    case "invoices.pending":
      return m.invoices.filter((i) => i.status === "pending").length;
    default:
      return 0;
  }
}

function computeList(metricKey: string, m: MetricData): string[] {
  if (metricKey === "leads.recent") {
    return m.leads.slice(0, 5).map((l) => l.name);
  }
  if (metricKey === "activities.recent") {
    return m.activities.slice(0, 5).map((a) => a.notes || a.type);
  }
  return [];
}

function computeDonut(metricKey: string, m: MetricData): Array<{ label: string; value: number; color: string }> {
  if (metricKey === "activities.byStatus") {
    return [
      { label: "Aberta", value: m.activities.filter((a) => a.status === "open").length, color: "var(--nov-b500)" },
      { label: "Concluída", value: m.activities.filter((a) => a.status === "completed").length, color: "var(--nov-success)" },
    ];
  }
  if (metricKey === "invoices.byStatus") {
    return [
      { label: "Pendente", value: m.invoices.filter((i) => i.status === "pending").length, color: "var(--nov-warning)" },
      { label: "Paga", value: m.invoices.filter((i) => i.status === "paid").length, color: "var(--nov-success)" },
    ];
  }
  return [
    { label: "Aberta", value: m.opportunities.filter((o) => o.status === "open").length, color: "var(--nov-b500)" },
    { label: "Ganha", value: m.opportunities.filter((o) => o.status === "won").length, color: "var(--nov-success)" },
    { label: "Perdida", value: m.opportunities.filter((o) => o.status === "lost").length, color: "var(--nov-danger)" },
  ];
}

function computeBars(m: MetricData): Array<{ label: string; value: number; pct: number }> {
  const counts = [
    { label: "Opportunities", value: m.opportunities.length },
    { label: "Leads", value: m.leads.length },
    { label: "Parties", value: m.parties.length },
    { label: "Activities", value: m.activities.length },
    { label: "Projects", value: m.projects.length },
    { label: "Invoices", value: m.invoices.length },
  ];
  const max = Math.max(1, ...counts.map((c) => c.value));
  return counts.map((c) => ({ ...c, pct: (c.value / max) * 100 }));
}
