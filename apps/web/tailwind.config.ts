import type { Config } from "tailwindcss";

/**
 * Tailwind config da NOVARIS (`ADR-0050`) — NENHUM token de cor/espaçamento é
 * recriado aqui. Toda entrada abaixo referencia as mesmas CSS custom
 * properties `--nov-*`/`--ff-*`/`--radius-*`/`--shadow-*`/`--space-*`/
 * `--transition*` já declaradas em `app/globals.css` (extraídas do brandkit
 * oficial, `NOVARIS_Brand_Identity_v1.0.html`) — `globals.css` continua
 * sendo a única fonte de verdade visual da marca. `spacing` não precisou de
 * mapeamento: a escala `--space-*` (4/8/12/16/20/24/32/40/48px) já é
 * idêntica à escala padrão do Tailwind (`p-1`..`p-12`).
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "nov-bg": "var(--nov-bg)",
        "nov-bg2": "var(--nov-bg2)",
        "nov-bg3": "var(--nov-bg3)",
        "nov-surface": "var(--nov-surface)",
        "nov-surface2": "var(--nov-surface2)",
        "nov-border": "var(--nov-border)",
        "nov-border2": "var(--nov-border2)",
        "nov-s50": "var(--nov-s50)",
        "nov-s100": "var(--nov-s100)",
        "nov-s200": "var(--nov-s200)",
        "nov-s300": "var(--nov-s300)",
        "nov-s400": "var(--nov-s400)",
        "nov-s500": "var(--nov-s500)",
        "nov-s600": "var(--nov-s600)",
        "nov-b300": "var(--nov-b300)",
        "nov-b400": "var(--nov-b400)",
        "nov-b500": "var(--nov-b500)",
        "nov-b600": "var(--nov-b600)",
        "nov-b700": "var(--nov-b700)",
        "nov-b800": "var(--nov-b800)",
        "nov-bglow": "var(--nov-bglow)",
        "nov-bsoft": "var(--nov-bsoft)",
        "nov-success": "var(--nov-success)",
        "nov-success-soft": "var(--nov-success-soft)",
        "nov-danger": "var(--nov-danger)",
        "nov-danger-soft": "var(--nov-danger-soft)",
        "nov-warning": "var(--nov-warning)",
        "nov-warning-soft": "var(--nov-warning-soft)",
      },
      fontFamily: {
        "nov-display": "var(--ff-display)",
        "nov-body": "var(--ff-body)",
      },
      borderRadius: {
        "nov-sm": "var(--radius-sm)",
        nov: "var(--radius)",
        "nov-lg": "var(--radius-lg)",
        "nov-xl": "var(--radius-xl)",
      },
      boxShadow: {
        "nov-sm": "var(--shadow-sm)",
        "nov-md": "var(--shadow-md)",
        "nov-lg": "var(--shadow-lg)",
        "nov-glow": "var(--shadow-glow)",
      },
      transitionDuration: {
        "nov-fast": "120ms",
        nov: "200ms",
      },
      animation: {
        "nov-spin": "nov-spin 0.7s linear infinite",
        "nov-fade-in": "nov-fade-in var(--transition) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
