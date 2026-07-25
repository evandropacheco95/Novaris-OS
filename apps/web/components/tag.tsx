import type { ReactNode } from "react";

/**
 * Badge em pílula — mesmo componente visual do brandkit real (ex.: tag
 * "CRESCIMENTO"), elevado com um ponto indicador e glow sutil no tom `accent`
 * (design system, `ENG-0147`). API preservada (`tone`) — nenhum dos ~20
 * lugares que já usam `Tag` precisou mudar.
 */
export function Tag({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "success" | "danger" | "neutral" }) {
  const colors: Record<string, { fg: string; border: string; bg: string; dot: string }> = {
    accent: { fg: "var(--nov-b300)", border: "var(--nov-b700)", bg: "var(--nov-bsoft)", dot: "var(--nov-b500)" },
    success: { fg: "var(--nov-success)", border: "#0a5c3c", bg: "var(--nov-success-soft)", dot: "var(--nov-success)" },
    danger: { fg: "var(--nov-danger)", border: "#7a1f2e", bg: "var(--nov-danger-soft)", dot: "var(--nov-danger)" },
    neutral: { fg: "var(--nov-s400)", border: "var(--nov-border2)", bg: "var(--nov-surface2)", dot: "var(--nov-s500)" },
  };
  const c = colors[tone]!;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 11px 4px 9px",
        borderRadius: 999,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.fg,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {children}
    </span>
  );
}
