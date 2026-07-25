import { test, expect, type Page } from "@playwright/test";

/**
 * E2E real (Playwright) — primeira verificação visual de verdade desta
 * engenharia (renderização real em navegador, não `curl`+leitura de código).
 * Usa a conta de teste já seedada (`apps/api/src/seed.ts`) — nunca as
 * credenciais reais do SuperMaster. Cada domínio: navega, confirma o título
 * (`<h1>`, `DashboardShell`) e tira um screenshot (`e2e/screenshots/`, também
 * salvo automaticamente em `test-results/` pela config `screenshot: "on"`).
 */
const TEST_EMAIL = "testenovaris@testenovaris.com.br";
const TEST_PASSWORD = "teste@novaris";

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(TEST_EMAIL);
  await page.getByPlaceholder("Senha").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  // Login redireciona para `/` (home dashboard, `ENG-0147`) — antes ia direto para `/opportunities`.
  await page.waitForURL(/\/$/);
}

test.describe("NOVARIS — QA visual real dos 10 Business Domains", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  const domains: Array<{ path: string; title: string; screenshot: string }> = [
    { path: "/opportunities", title: "Opportunities", screenshot: "01-sales.png" },
    { path: "/customer", title: "Relationship", screenshot: "02-relationship.png" },
    { path: "/activity", title: "Activity", screenshot: "03-activity.png" },
    { path: "/projects", title: "Projects", screenshot: "04-project.png" },
    { path: "/marketing", title: "Marketing", screenshot: "05-marketing.png" },
    { path: "/financial", title: "Financial", screenshot: "06-financial.png" },
    { path: "/analytics", title: "Analytics", screenshot: "07-analytics.png" },
    { path: "/settings", title: "Workspace", screenshot: "08-workspace.png" },
    { path: "/team", title: "Identity", screenshot: "09-identity.png" },
    { path: "/system", title: "Trilha de Auditoria", screenshot: "10-system.png" },
  ];

  for (const domain of domains) {
    test(`${domain.title} (${domain.path}) renderiza corretamente`, async ({ page }) => {
      await page.goto(domain.path);
      await expect(page.locator("h1")).toHaveText(domain.title);
      // Espera o fetch inicial terminar — screenshot deve capturar o estado
      // final, não o instante de "Carregando...".
      await expect(page.getByText("Carregando...")).toHaveCount(0);
      // Nenhuma tela deveria mostrar uma mensagem de erro por padrão.
      await expect(page.getByText("Falha ao carregar")).toHaveCount(0);
      await page.screenshot({ path: `e2e/screenshots/${domain.screenshot}`, fullPage: true });
    });
  }
});

test.describe("NOVARIS — login", () => {
  test("login com credenciais inválidas mostra erro, sem navegar", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(TEST_EMAIL);
    await page.getByPlaceholder("Senha").fill("senha-errada");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(/Falha ao autenticar|Credenciais inválidas|inválid/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("sidebar mostra os 10 domínios, todos habilitados", async ({ page }) => {
    await login(page);
    const domainLabels = [
      "Sales",
      "Relationship",
      "Activity",
      "Project",
      "Marketing",
      "Financial",
      "Analytics",
      "Workspace",
      "Identity",
      "System",
    ];
    for (const label of domainLabels) {
      await expect(page.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(page.getByText("Carregando...")).toHaveCount(0);
    await page.screenshot({ path: "e2e/screenshots/00-sidebar.png", fullPage: true });
  });
});
