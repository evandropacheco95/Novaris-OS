import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Badge em pílula — mesmo componente visual do brandkit real (ex.: tag
 * "CRESCIMENTO"), elevado com um ponto indicador e glow sutil no tom `accent`
 * (design system, `ENG-0147`, migrado para Tailwind em `ENG-0157`). API
 * preservada (`tone`) — nenhum dos ~20 lugares que já usam `Tag` precisou
 * mudar.
 */
const TONE_CLASS: Record<string, { pill: string; dot: string }> = {
  accent: { pill: "text-nov-b300 border-nov-b700 bg-nov-bsoft", dot: "bg-nov-b500" },
  success: { pill: "text-nov-success border-[#0a5c3c] bg-nov-success-soft", dot: "bg-nov-success" },
  danger: { pill: "text-nov-danger border-[#7a1f2e] bg-nov-danger-soft", dot: "bg-nov-danger" },
  neutral: { pill: "text-nov-s400 border-nov-border2 bg-nov-surface2", dot: "bg-nov-s500" },
};

export function Tag({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "success" | "danger" | "neutral" }) {
  const c = TONE_CLASS[tone]!;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border py-1 pl-[9px] pr-[11px] text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap",
        c.pill,
      )}
    >
      <span className={cn("h-[5px] w-[5px] shrink-0 rounded-full", c.dot)} />
      {children}
    </span>
  );
}
