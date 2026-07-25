import type { ReactNode } from "react";

/** PageHeader — cabeçalho consistente de página do design system NOVARIS (`ENG-0147`). */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "var(--nov-s50)", letterSpacing: "-0.01em" }}>{title}</h1>
        {description && <p style={{ fontSize: 13, color: "var(--nov-s500)", margin: "6px 0 0" }}>{description}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{actions}</div>}
    </div>
  );
}
