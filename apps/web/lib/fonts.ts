import { Inter, Orbitron } from "next/font/google";

/** Tipografia do brandkit real — Orbitron (display/wordmark) + Inter (corpo). */
export const orbitron = Orbitron({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-orbitron" });
export const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });
