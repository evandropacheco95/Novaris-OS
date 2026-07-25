"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: number | string;
  interactive?: boolean;
}

/** Card — superfície elevada compartilhada do design system NOVARIS (`ENG-0147`). */
export function Card({ children, padding = 20, interactive = false, style, ...rest }: CardProps) {
  const base: CSSProperties = {
    background: "linear-gradient(180deg, var(--nov-surface2), var(--nov-surface))",
    border: "1px solid var(--nov-border)",
    borderRadius: "var(--radius-lg)",
    padding,
    boxShadow: "var(--shadow-md)",
    transition: "transform var(--transition), box-shadow var(--transition), border-color var(--transition)",
    ...style,
  };

  return (
    <div
      {...rest}
      style={base}
      onMouseEnter={(e) => {
        if (interactive) {
          e.currentTarget.style.borderColor = "var(--nov-border2)";
          e.currentTarget.style.boxShadow = "var(--shadow-lg)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (interactive) {
          e.currentTarget.style.borderColor = "var(--nov-border)";
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {children}
    </div>
  );
}
