"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: number | string;
  interactive?: boolean;
}

/** Card — superfície elevada compartilhada do design system NOVARIS (`ENG-0147`, migrado para Tailwind em `ENG-0157`). */
export function Card({ children, padding = 20, interactive = false, className, style, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      style={{ padding, ...style }}
      className={cn(
        "bg-gradient-to-b from-nov-surface2 to-nov-surface border border-nov-border rounded-nov-lg shadow-nov-md transition-[transform,box-shadow,border-color] duration-nov",
        interactive && "hover:border-nov-border2 hover:shadow-nov-lg hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}
