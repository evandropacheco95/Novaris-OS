import type { ReactNode } from "react";
import { Card } from "./card";

/** StatCard — cartão de métrica compartilhado do design system NOVARIS (`ENG-0147`), usado na home (`/`). */
export function StatCard({ label, value, icon, href, tone = "accent" }: { label: string; value: string | number; icon: ReactNode; href?: string; tone?: "accent" | "success" | "danger" | "neutral" }) {
  const toneColor: Record<string, string> = {
    accent: "var(--nov-b400)",
    success: "var(--nov-success)",
    danger: "var(--nov-danger)",
    neutral: "var(--nov-s400)",
  };

  const content = (
    <Card interactive={Boolean(href)} padding={20} style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius)",
          background: "var(--nov-bsoft)",
          border: "1px solid var(--nov-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: toneColor[tone],
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "var(--nov-s50)", fontFamily: "var(--ff-display)", lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: "var(--nov-s500)", marginTop: 4 }}>{label}</div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        {content}
      </a>
    );
  }
  return content;
}
