import { test, expect } from "@playwright/test";

test.describe("Pages légales", () => {
  test("mentions légales - affiche le contenu", async ({ page }) => {
    await page.goto("/mentions-legales");

    await expect(
      page.getByRole("heading", { name: /mentions légales/i }),
    ).toBeVisible();

    // Sections obligatoires
    await expect(page.getByText(/éditeur du site/i)).toBeVisible();
    await expect(page.getByText(/hébergement/i)).toBeVisible();
    await expect(page.getByText(/propriété intellectuelle/i)).toBeVisible();
  });

  test("mentions légales - méta title correct", async ({ page }) => {
    await page.goto("/mentions-legales");
    await expect(page).toHaveTitle(/mentions légales/i);
  });

  test("confidentialité - affiche le contenu", async ({ page }) => {
    await page.goto("/confidentialite");

    await expect(
      page.getByRole("heading", { name: /confidentialité/i }).first(),
    ).toBeVisible();

    // Sections RGPD
    await expect(page.getByRole("heading", { name: /données collectées/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /vos droits/i })).toBeVisible();
  });

  test("confidentialité - méta title correct", async ({ page }) => {
    await page.goto("/confidentialite");
    await expect(page).toHaveTitle(/confidentialité/i);
  });

  test("liens légaux sont dans le footer", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(
      footer.getByRole("link", { name: /mentions légales/i }),
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /confidentialité/i }),
    ).toBeVisible();
  });

  test("lien estimation est dans le footer", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(
      footer.getByRole("link", { name: /estimer mon bien/i }),
    ).toBeVisible();
  });
});
