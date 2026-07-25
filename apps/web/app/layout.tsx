import type { ReactNode } from "react";
import { inter, orbitron } from "@/lib/fonts";
import "./globals.css";

export const metadata = {
  title: "NOVARIS",
  description: "NOVARIS — Intelligent Operating Platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${orbitron.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
