import { cn } from "@/lib/utils";

/**
 * Skeleton — placeholder de carregamento (`ENG-0158`, `ADR-0050`), substitui
 * o texto "Carregando..." nas telas que já usam board/lista. Shimmer via
 * gradiente animado (`nov-shimmer`, CSS puro) — sem biblioteca nova, mesma
 * filosofia de `StatusDonut`/`Reveal`. Variantes imitam a forma real do
 * conteúdo (card, linha, círculo) em vez de um spinner genérico.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-nov bg-[length:200%_100%] bg-gradient-to-r from-nov-surface via-nov-surface2 to-nov-surface bg-[position:0_0] animate-nov-shimmer",
        className,
      )}
    />
  );
}

/** Placeholder de um Card de lista (linha de título + subtítulo), mesmo padding do `Card` real. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5 rounded-nov-lg border border-nov-border bg-nov-surface p-[18px]", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/** Lista de `SkeletonCard`, para substituir `{loading && <p>Carregando...</p>}` em telas de lista/board. */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
