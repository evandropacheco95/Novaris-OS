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
import { clearSession, getUser } from "@/lib/api";
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
  const user = typeof window !== "undefined" ? getUser() : null;

  function handleLogout(): void {
    clearSession();
    router.replace("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          background: "var(--nov-bg2)",
          borderRight: "1px solid var(--nov-border)",
          display: "flex",
          flexDirection: "column",
          padding: "22px 14px",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30, padding: "0 6px", textDecoration: "none" }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "linear-gradient(135deg, var(--nov-b400), var(--nov-b700))",
              boxShadow: "0 0 16px -2px var(--nov-bglow)",
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: 14.5, letterSpacing: "0.15em", color: "var(--nov-s50)" }}>NOVARIS</span>
        </a>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
          {DOMAINS.map((domain) => {
            const active = domain.live && domain.label === title;
            const Icon = domain.icon;
            return (
              <a
                key={domain.label}
                href={domain.live ? domain.href : undefined}
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 12px",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  textDecoration: "none",
                  color: domain.live ? (active ? "var(--nov-s50)" : "var(--nov-s300)") : "var(--nov-s500)",
                  background: active ? "var(--nov-bsoft)" : "transparent",
                  cursor: domain.live ? "pointer" : "default",
                  transition: "background var(--transition-fast), color var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!active && domain.live) e.currentTarget.style.background = "var(--nov-surface2)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: -14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 16,
                      borderRadius: 2,
                      background: "var(--nov-b500)",
                      boxShadow: "0 0 8px var(--nov-bglow)",
                    }}
                  />
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={16} strokeWidth={2} style={{ flexShrink: 0, opacity: domain.live ? 1 : 0.5 }} />
                  {domain.label}
                </span>
                {!domain.live && <Tag tone="neutral">em breve</Tag>}
              </a>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid var(--nov-border)", paddingTop: 14, marginTop: 14 }}>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 2px" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--nov-surface2)",
                  border: "1px solid var(--nov-border2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--nov-b300)",
                  flexShrink: 0,
                }}
              >
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: "var(--nov-s400)", wordBreak: "break-all", lineHeight: 1.3 }}>{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--nov-border2)",
              background: "transparent",
              color: "var(--nov-s300)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background var(--transition-fast), color var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--nov-danger-soft)";
              e.currentTarget.style.color = "var(--nov-danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--nov-s300)";
            }}
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      <main className="nov-animate-in" style={{ flex: 1, padding: "36px 44px", maxWidth: 1280 }}>
        {children}
      </main>
    </div>
  );
}
