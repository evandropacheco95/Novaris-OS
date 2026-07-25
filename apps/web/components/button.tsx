"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
}

const VARIANT_STYLE: Record<Variant, { background: string; color: string; border: string; hoverBackground: string }> = {
  primary: { background: "linear-gradient(180deg, var(--nov-b500), var(--nov-b600))", color: "#fff", border: "1px solid var(--nov-b700)", hoverBackground: "linear-gradient(180deg, var(--nov-b400), var(--nov-b500))" },
  secondary: { background: "var(--nov-surface2)", color: "var(--nov-s200)", border: "1px solid var(--nov-border2)", hoverBackground: "var(--nov-border2)" },
  ghost: { background: "transparent", color: "var(--nov-s300)", border: "1px solid transparent", hoverBackground: "var(--nov-surface2)" },
  danger: { background: "var(--nov-danger-soft)", color: "var(--nov-danger)", border: "1px solid #7a1f2e", hoverBackground: "#ff3b5c22" },
};

/** Button — primitivo compartilhado do design system NOVARIS (elevação de UI/UX, `ENG-0147`). */
export function Button({ variant = "primary", size = "md", icon, loading, children, style, disabled, ...rest }: ButtonProps) {
  const v = VARIANT_STYLE[variant];
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: size === "sm" ? "7px 12px" : "10px 18px",
        borderRadius: "var(--radius)",
        border: v.border,
        background: v.background,
        color: v.color,
        fontSize: size === "sm" ? 12.5 : 13.5,
        fontWeight: 600,
        fontFamily: "var(--ff-body)",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.55 : 1,
        transition: "filter var(--transition-fast), transform var(--transition-fast), background var(--transition-fast)",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) e.currentTarget.style.filter = "brightness(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "none";
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) e.currentTarget.style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 13,
        height: 13,
        borderRadius: "50%",
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        display: "inline-block",
        animation: "nov-spin 0.7s linear infinite",
      }}
    />
  );
}
