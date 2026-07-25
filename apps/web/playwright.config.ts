import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração de E2E real (Playwright) para `apps/web` — primeira ferramenta
 * de QA visual real desta engenharia (antes só verificação via `curl`+leitura
 * de código, nunca renderização real). Aponta para uma instância já rodando
 * em `http://localhost:3000` (`pnpm --filter @novaris/web run start`/`dev`)
 * — não gerencia o ciclo de vida do servidor (a aplicação depende de Postgres
 * real/seed já populado, fora do escopo do que o Playwright deveria orquestrar).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "on",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
