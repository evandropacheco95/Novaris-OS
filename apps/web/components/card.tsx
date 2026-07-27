"use client";

import { useRef, useState, type HTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: number | string;
  interactive?: boolean;
  /** Spotlight que segue o cursor (`ENG-0158`), inspirado no "Tilt Card" do 21st.dev (`tom_ui/tilt-card`) — sem a rotação 3D, que ficaria exagerada para cards densos de texto/dados. Só o efeito de luz. */
  glow?: boolean;
  /** Fundo translúcido com `backdrop-blur` (`ENG-0158`), inspirado no brandkit — substitui o gradiente de superfície padrão (não soma com ele), para cards de destaque sobre um fundo com textura atrás. */
  glass?: boolean;
}

/** Card — superfície elevada compartilhada do design system NOVARIS (`ENG-0147`, migrado para Tailwind em `ENG-0157`, glow/glass em `ENG-0158`). */
export function Card({ children, padding = 20, interactive = false, glow = false, glass = false, className, style, onPointerMove, ...rest }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    onPointerMove?.(event);
    if (!glow || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
  }

  return (
    <div
      ref={ref}
      {...rest}
      style={{ padding, ...style }}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => glow && setHovering(true)}
      onPointerLeave={() => glow && setHovering(false)}
      className={cn(
        "relative overflow-hidden border rounded-nov-lg shadow-nov-md transition-[transform,box-shadow,border-color] duration-nov",
        glass ? "border-nov-glass-border bg-nov-glass-bg backdrop-blur-md" : "border-nov-border bg-gradient-to-b from-nov-surface2 to-nov-surface",
        interactive && "hover:border-nov-border2 hover:shadow-nov-lg hover:-translate-y-0.5",
        className,
      )}
    >
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity: hovering ? 1 : 0,
            background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, var(--nov-bsoft), transparent 60%)`,
          }}
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
