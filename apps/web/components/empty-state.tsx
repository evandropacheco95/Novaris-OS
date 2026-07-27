import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

/** EmptyState — estado vazio consistente do design system NOVARIS (`ENG-0147`, migrado para Tailwind em `ENG-0157`). */
export function EmptyState({ icon, message }: { icon?: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-nov-lg border border-dashed border-nov-border2 bg-nov-bg2 px-6 py-12 text-nov-s500">
      <div className="text-nov-s600">{icon ?? <Inbox size={28} strokeWidth={1.5} />}</div>
      <p className="m-0 text-[13.5px]">{message}</p>
    </div>
  );
}
