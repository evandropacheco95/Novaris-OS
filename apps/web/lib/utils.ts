import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** cn — helper padrão shadcn (`ADR-0050`), combina classes condicionais e resolve conflitos Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
