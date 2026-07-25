"use client";

import type { FocusEvent, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const baseFieldStyle = {
  padding: "10px 13px",
  borderRadius: "var(--radius)",
  border: "1px solid var(--nov-border2)",
  background: "var(--nov-bg2)",
  color: "var(--nov-s100)",
  fontSize: 13.5,
  fontFamily: "var(--ff-body)",
  transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
  outline: "none",
} as const;

function focusHandlers() {
  return {
    onFocus: (e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--nov-b500)";
      e.currentTarget.style.boxShadow = "0 0 0 3px var(--nov-bsoft)";
    },
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--nov-border2)";
      e.currentTarget.style.boxShadow = "none";
    },
  };
}

/** Input — primitivo compartilhado do design system NOVARIS (`ENG-0147`). */
export function Input({ style, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} {...focusHandlers()} style={{ ...baseFieldStyle, ...style }} />;
}

export function Textarea({ style, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} {...focusHandlers()} style={{ ...baseFieldStyle, resize: "vertical", minHeight: 72, ...style }} />;
}

export function Select({ style, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select {...rest} {...focusHandlers()} style={{ ...baseFieldStyle, cursor: "pointer", ...style }}>
      {children}
    </select>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label style={{ fontSize: 12, fontWeight: 600, color: "var(--nov-s400)", letterSpacing: "0.03em", marginBottom: 6, display: "block" }}>{children}</label>;
}
