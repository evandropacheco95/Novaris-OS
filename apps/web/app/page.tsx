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
import { Reveal } from "@/components/reveal";
import { Skeleton } from "@/components/skeleton";

/**
 * Home — painel real de visão geral (`ENG-0147`, elevação de UI/UX), primeira
 * tela após login. Antes só redirecionava direto para `/opportunities`
 * (`ENG-0123`); agora agrega contagens reais dos domínios já implementados
 * num único painel, pensado para abrir uma apresentação ao vivo da
 * plataforma. Migrado para Tailwind em `ENG-0157`. Elevação de design real
 * com inspiração do 21st.dev em `ENG-0158`: StatCards com `Reveal` staggered
 * e glow no hover, skeleton de carregamento, card de "Acessos rápidos" com
 * leve efeito de vidro (glass).
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
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-nov-b400">
          <Sparkles size={13} />
          Intelligent Operating Platform
        </div>
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.01em] text-nov-s50">Bem-vindo{firstName ? `, ${firstName}` : ""}.</h1>
        <p className="mt-2 mb-0 text-sm text-nov-s500">Visão geral da sua operação em tempo real.</p>
      </div>

      {loading ? (
        <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <span className="sr-only">Carregando painel...</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {[
              { label: "Oportunidades abertas", value: openOpportunities, icon: <TrendingUp size={18} />, href: "/opportunities", tone: "accent" as const },
              { label: "Leads em qualificação", value: newLeads, icon: <Sparkles size={18} />, href: "/leads", tone: "accent" as const },
              { label: "Parties cadastradas", value: parties.length, icon: <Users size={18} />, href: "/customer", tone: "neutral" as const },
              { label: "Atividades em aberto", value: openActivities, icon: <ActivityIcon size={18} />, href: "/activity", tone: "neutral" as const },
              { label: "Projetos ativos", value: projects.length, icon: <FolderKanban size={18} />, href: "/projects", tone: "neutral" as const },
              { label: "Faturas pendentes", value: pendingInvoices, icon: <Wallet size={18} />, href: "/financial", tone: (pendingInvoices > 0 ? "danger" : "success") as "danger" | "success" },
            ].map((stat, i) => (
              <Reveal key={stat.href} index={i}>
                <StatCard {...stat} />
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-[minmax(260px,380px)_1fr] gap-4">
            <Reveal index={6}>
              <StatusDonut title="Pipeline de Opportunities" data={opportunitiesByStatus} />
            </Reveal>

            <Reveal index={7}>
              <Card padding={24} glass>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="m-0 text-sm font-bold text-nov-s100">Acessos rápidos</h3>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
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
                      className="flex items-center justify-between rounded-nov border border-nov-border bg-nov-bg2 px-3.5 py-2.5 text-[13px] font-medium text-nov-s300 no-underline transition-[border-color,color] duration-nov-fast hover:border-nov-b700 hover:text-nov-s100"
                    >
                      {link.label}
                      <ArrowUpRight size={14} />
                    </a>
                  ))}
                </div>
              </Card>
            </Reveal>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
