"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Users,
  Activity as ActivityIcon,
  FolderKanban,
  Wallet,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  getToken,
  useCurrentUser,
  listOpportunities,
  listParties,
  listActivities,
  listProjects,
  listInvoices,
  listLeads,
  type Opportunity,
  type Party,
  type Activity,
  type Project,
  type Invoice,
  type Lead,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/card";
import { StatusDonut } from "@/components/status-donut";

/**
 * Home — painel real de visão geral (`ENG-0147`, elevação de UI/UX), primeira
 * tela após login. Antes só redirecionava direto para `/opportunities`
 * (`ENG-0123`); agora agrega contagens reais dos domínios já implementados
 * num único painel, pensado para abrir uma apresentação ao vivo da plataforma.
 */
export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const user = useCurrentUser();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    void load();
  }, []);

  async function load(): Promise<void> {
    try {
      const [oppList, partyList, activityList, projectList, invoiceList, leadList] = await Promise.all([
        listOpportunities(),
        listParties(),
        listActivities(),
        listProjects(),
        listInvoices(),
        listLeads(),
      ]);
      setOpportunities(oppList);
      setParties(partyList);
      setActivities(activityList);
      setProjects(projectList);
      setInvoices(invoiceList);
      setLeads(leadList);
    } finally {
      setLoading(false);
    }
  }

  const openOpportunities = opportunities.filter((o) => o.status === "open").length;
  const openActivities = activities.filter((a) => a.status === "open").length;
  const pendingInvoices = invoices.filter((i) => i.status === "pending").length;
  const newLeads = leads.filter((l) => l.status === "new" || l.status === "contacted" || l.status === "qualified").length;
  const firstName = user?.email.split("@")[0] ?? "";

  const opportunitiesByStatus = [
    { label: "Aberta", value: opportunities.filter((o) => o.status === "open").length, color: "var(--nov-b500)" },
    { label: "Ganha", value: opportunities.filter((o) => o.status === "won").length, color: "var(--nov-success)" },
    { label: "Perdida", value: opportunities.filter((o) => o.status === "lost").length, color: "var(--nov-danger)" },
  ];

  return (
    <DashboardShell title="">
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--nov-b400)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          <Sparkles size={13} />
          Intelligent Operating Platform
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "var(--nov-s50)", letterSpacing: "-0.01em" }}>
          Bem-vindo{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p style={{ fontSize: 14, color: "var(--nov-s500)", margin: "8px 0 0" }}>Visão geral da sua operação em tempo real.</p>
      </div>

      {loading ? (
        <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando painel...</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            <StatCard label="Oportunidades abertas" value={openOpportunities} icon={<TrendingUp size={18} />} href="/opportunities" tone="accent" />
            <StatCard label="Leads em qualificação" value={newLeads} icon={<Sparkles size={18} />} href="/leads" tone="accent" />
            <StatCard label="Parties cadastradas" value={parties.length} icon={<Users size={18} />} href="/customer" tone="neutral" />
            <StatCard label="Atividades em aberto" value={openActivities} icon={<ActivityIcon size={18} />} href="/activity" tone="neutral" />
            <StatCard label="Projetos ativos" value={projects.length} icon={<FolderKanban size={18} />} href="/projects" tone="neutral" />
            <StatCard label="Faturas pendentes" value={pendingInvoices} icon={<Wallet size={18} />} href="/financial" tone={pendingInvoices > 0 ? "danger" : "success"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 380px) 1fr", gap: 16 }}>
            <StatusDonut title="Pipeline de Opportunities" data={opportunitiesByStatus} />

            <Card padding={24}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "var(--nov-s100)" }}>Acessos rápidos</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                {[
                  { label: "Leads", href: "/leads" },
                  { label: "Quotations", href: "/quotations" },
                  { label: "Products", href: "/products" },
                  { label: "Contracts", href: "/contracts" },
                  { label: "Cases", href: "/cases" },
                  { label: "Comments", href: "/comments" },
                  { label: "Calendário", href: "/calendar-events" },
                  { label: "Reminders", href: "/reminders" },
                  { label: "Checklists", href: "/checklists" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--nov-border)",
                      background: "var(--nov-bg2)",
                      color: "var(--nov-s300)",
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: "none",
                      transition: "border-color var(--transition-fast), color var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--nov-b700)";
                      e.currentTarget.style.color = "var(--nov-s100)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--nov-border)";
                      e.currentTarget.style.color = "var(--nov-s300)";
                    }}
                  >
                    {link.label}
                    <ArrowUpRight size={14} />
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
