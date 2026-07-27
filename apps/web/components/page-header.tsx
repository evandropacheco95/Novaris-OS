import type { ReactNode } from "react";

/** PageHeader — cabeçalho consistente de página do design system NOVARIS (`ENG-0147`, migrado para Tailwind em `ENG-0157`). */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
      <div>
        <h1 className="text-[19px] font-bold m-0 text-nov-s50 tracking-[-0.01em]">{title}</h1>
        {description && <p className="text-[13px] text-nov-s500 mt-1.5 mb-0">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
