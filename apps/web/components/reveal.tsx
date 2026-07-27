"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal — anima fade+slide+blur ao entrar no viewport (`ENG-0158`,
 * `ADR-0050`), inspirado no componente "Reveal" do catálogo 21st.dev
 * (`asanshay/reveal`) — mas reimplementado com `IntersectionObserver` +
 * transição CSS pura em vez de framer-motion, para não adicionar uma nova
 * dependência de animação só para isso (mesma filosofia de zero-dependência
 * já usada em `StatusDonut`/`nov-animate-in`). `index` controla o atraso do
 * stagger (150ms por posição), mesmo valor do componente de referência.
 */
export function Reveal({ children, className, index = 0 }: { children: ReactNode; className?: string; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("transition-[opacity,filter,transform] duration-500 ease-out", visible ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-sm translate-y-2.5", className)}
      style={{ transitionDelay: visible ? `${index * 90}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
