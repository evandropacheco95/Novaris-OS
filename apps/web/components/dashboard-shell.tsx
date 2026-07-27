"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Users,
  Activity as ActivityIcon,
  FolderKanban,
  Megaphone,
  Wallet,
  BarChart3,
  Building2,
  UserCog,
  FileClock,
  LogOut,
} from "lucide-react";
import { clearSession, useCurrentUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Tag } from "./tag";

/**
 * 10 Business Domains confirmados em `knowledge/core/DOMAIN_MODEL.md`
 * (Identity/Workspace/Relationship/Sales/Activity/Project/Marketing/Financial/
 * Analytics/System) — todos os 10 têm API implementada (`ENG-0120`-`0135`).
 * `System` (`/system`, Audit) é somente leitura — sem tela de criação, ver
 * `ADR-0035` (entradas nascem só do enriquecimento automático). Sidebar
 * deliberadamente restrita aos 10 domínios oficiais — sub-recursos (Leads,
 * Quotations, Cases, Comments, etc.) navegam via links internos de cada
 * domínio, nunca ganham entrada própria aqui (decisão repetida em
 * `ENG-0143`-`0146`, preserva a contagem oficial de domínios).
 *
 * Migrado para Tailwind (`ENG-0157`) — mesmos valores visuais de `ENG-0147`.
 */
const DOMAINS = [
  { label: "Sales", href: "/opportunities", live: true, icon: TrendingUp },
  { label: "Relationship", href: "/customer", live: true, icon: Users },
  { label: "Activity", href: "/activity", live: true, icon: ActivityIcon },
  { label: "Project", href: "/projects", live: true, icon: FolderKanban },
  { label: "Marketing", href: "/marketing", live: true, icon: Megaphone },
  { label: "Financial", href: "/financial", live: true, icon: Wallet },
  { label: "Analytics", href: "/analytics", live: true, icon: BarChart3 },
  { label: "Workspace", href: "/settings", live: true, icon: Building2 },
  { label: "Identity", href: "/team", live: true, icon: UserCog },
  { label: "System", href: "/system", live: true, icon: FileClock },
];

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const user = useCurrentUser();

  function handleLogout(): void {
    clearSession();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col border-r border-nov-border bg-nov-bg2 px-3.5 py-[22px]">
        <a href="/" className="mb-[30px] flex items-center gap-2.5 px-1.5 no-underline">
          <div className="h-[26px] w-[26px] shrink-0 rounded-[7px] bg-gradient-to-br from-nov-b400 to-nov-b700 shadow-nov-glow" />
          <span className="font-nov-display text-[14.5px] font-bold tracking-[0.15em] text-nov-s50">NOVARIS</span>
        </a>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {DOMAINS.map((domain) => {
            const active = domain.live && domain.label === title;
            const Icon = domain.icon;
            return (
              <a
                key={domain.label}
                href={domain.live ? domain.href : undefined}
                className={cn(
                  "relative flex items-center justify-between rounded-nov px-3 py-[9px] text-[13px] no-underline transition-[background,color] duration-nov-fast",
                  active ? "bg-nov-bsoft font-semibold text-nov-s50" : "font-medium text-nov-s300 hover:bg-nov-surface2",
                  !domain.live && "cursor-default text-nov-s500",
                  domain.live && "cursor-pointer",
                )}
              >
                {active && <span className="absolute -left-3.5 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-sm bg-nov-b500 shadow-[0_0_8px_var(--nov-bglow)]" />}
                <span className="flex items-center gap-2.5">
                  <Icon size={16} strokeWidth={2} className={cn("shrink-0", !domain.live && "opacity-50")} />
                  {domain.label}
                </span>
                {!domain.live && <Tag tone="neutral">em breve</Tag>}
              </a>
            );
          })}
        </nav>

        <div className="mt-3.5 border-t border-nov-border pt-3.5">
          {user && (
            <div className="mb-3 flex items-center gap-2.5 px-0.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-nov-border2 bg-nov-surface2 text-xs font-bold text-nov-b300">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="break-all text-xs leading-tight text-nov-s400">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-nov border border-nov-border2 bg-transparent px-3 py-2 text-[12.5px] font-semibold text-nov-s300 transition-[background,color] duration-nov-fast hover:bg-nov-danger-soft hover:text-nov-danger"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      <main className="nov-animate-in max-w-[1280px] flex-1 px-11 py-9">{children}</main>
    </div>
  );
}
