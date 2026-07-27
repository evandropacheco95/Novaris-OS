import type { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

const TONE_CLASS: Record<string, string> = {
  accent: "text-nov-b400",
  success: "text-nov-success",
  danger: "text-nov-danger",
  neutral: "text-nov-s400",
};

/**
 * StatCard — cartão de métrica compartilhado do design system NOVARIS
 * (`ENG-0147`, migrado para Tailwind em `ENG-0157`), usado na home (`/`).
 * `trend` opcional (`ENG-0158`) — só deve ser passado quando existe uma
 * variação real (série histórica de verdade); nunca fabricado só para
 * preencher o card, mesma disciplina de dado real de toda a engenharia.
 */
export function StatCard({
  label,
  value,
  icon,
  href,
  tone = "accent",
  trend,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  href?: string;
  tone?: "accent" | "success" | "danger" | "neutral";
  trend?: { value: number; direction: "up" | "down" };
}) {
  const content = (
    <Card interactive={Boolean(href)} glow={Boolean(href)} padding={20} className="flex h-full flex-col gap-3.5">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-nov border border-nov-border bg-nov-bsoft", TONE_CLASS[tone])}>{icon}</div>
        {trend && (
          <div className={cn("flex items-center gap-0.5 text-xs font-semibold", trend.direction === "up" ? "text-nov-success" : "text-nov-danger")}>
            {trend.direction === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <div className="font-nov-display text-[26px] font-bold leading-tight text-nov-s50">{value}</div>
        <div className="mt-1 text-[12.5px] text-nov-s500">{label}</div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block h-full no-underline">
        {content}
      </a>
    );
  }
  return content;
}
