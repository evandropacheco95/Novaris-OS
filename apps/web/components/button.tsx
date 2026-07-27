"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-nov-b500 to-nov-b600 text-white border-nov-b700 hover:brightness-110 active:scale-[0.98]",
  secondary: "bg-nov-surface2 text-nov-s200 border-nov-border2 hover:bg-nov-border2 active:scale-[0.98]",
  ghost: "bg-transparent text-nov-s300 border-transparent hover:bg-nov-surface2 active:scale-[0.98]",
  danger: "bg-nov-danger-soft text-nov-danger border-[#7a1f2e] hover:bg-[#ff3b5c22] active:scale-[0.98]",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "px-3 py-[7px] text-[12.5px]",
  md: "px-[18px] py-[10px] text-[13.5px]",
};

/** Button — primitivo compartilhado do design system NOVARIS (`ENG-0147`, migrado para Tailwind em `ENG-0157`). */
export function Button({ variant = "primary", size = "md", icon, loading, children, className, disabled, ...rest }: ButtonProps & { className?: string }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-nov border font-nov-body font-semibold whitespace-nowrap transition-[filter,transform,background] duration-nov-fast",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        (disabled || loading) && "opacity-55 cursor-not-allowed",
        !(disabled || loading) && "cursor-pointer",
        className,
      )}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

function Spinner() {
  return <span className="inline-block h-[13px] w-[13px] animate-nov-spin rounded-full border-2 border-current border-t-transparent" />;
}
