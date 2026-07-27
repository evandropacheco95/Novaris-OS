"use client";

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "rounded-nov border border-nov-border2 bg-nov-bg2 px-[13px] py-2.5 text-[13.5px] text-nov-s100 font-nov-body outline-none transition-[border-color,box-shadow] duration-nov-fast focus:border-nov-b500 focus:shadow-[0_0_0_3px_var(--nov-bsoft)]";

/** Input — primitivo compartilhado do design system NOVARIS (`ENG-0147`, migrado para Tailwind em `ENG-0157`). */
export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn(FIELD_CLASS, className)} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn(FIELD_CLASS, "min-h-[72px] resize-y", className)} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select {...rest} className={cn(FIELD_CLASS, "cursor-pointer", className)}>
      {children}
    </select>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold tracking-[0.03em] text-nov-s400">{children}</label>;
}
