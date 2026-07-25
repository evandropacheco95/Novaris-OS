import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

/** EmptyState — estado vazio consistente do design system NOVARIS (`ENG-0147`). */
export function EmptyState({ icon, message }: { icon?: ReactNode; message: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "48px 24px",
        color: "var(--nov-s500)",
        border: "1px dashed var(--nov-border2)",
        borderRadius: "var(--radius-lg)",
        background: "var(--nov-bg2)",
      }}
    >
      <div style={{ color: "var(--nov-s600)" }}>{icon ?? <Inbox size={28} strokeWidth={1.5} />}</div>
      <p style={{ margin: 0, fontSize: 13.5 }}>{message}</p>
    </div>
  );
}
