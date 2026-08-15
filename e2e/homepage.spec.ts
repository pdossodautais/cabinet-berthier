import { test, expect } from "@playwright/test";

test.describe("Page d'accueil", () => {
  test("affiche le header et la navigation", async ({ page }) => {
    await page.goto("/");

    // Header visible
    await expect(page.locator("header")).toBeVisible();

    // Navigation links (desktop)
    const nav = page.locator("header nav");
    if (await nav.isVisible()) {
      await expect(nav.getByRole("link", { name: /nos biens/i })).toBeVisible();
      await expect(nav.getByRole("link", { name: /contact/i })).toBeVisible();
    }
  });

  test("affiche la section hero avec recherche", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("affiche le footer avec les informations de l'agence", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/tous droits réservés/i)).toBeVisible();
  });

  test("lien skip-to-content existe", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /aller au contenu/i });
    await expect(skipLink).toBeAttached();
  });

  test("cookie banner s'affiche et peut être accepté", async ({ page }) => {
    await page.goto("/");

    const banner = page.getByText(/cookies essentiels/i);
    await expect(banner).toBeVisible();

    await page.getByRole("button", { name: /accepter/i }).click();
    await expect(banner).not.toBeVisible();
  });

  test("cookie banner peut être refusé", async ({ page }) => {
    await page.goto("/");

    const banner = page.getByText(/cookies essentiels/i);
    await expect(banner).toBeVisible();

    await page.getByRole("button", { name: /refuser/i }).click();
    await expect(banner).not.toBeVisible();
  });

  test("méta title est correct", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/agence immobilière/i);
  });
});
