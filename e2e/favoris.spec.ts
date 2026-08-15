import { test, expect } from "@playwright/test";

test.describe("Page favoris", () => {
  test("affiche le message vide quand aucun favori", async ({ page }) => {
    await page.goto("/favoris");

    await expect(
      page.getByRole("heading", { name: /mes favoris/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/aucun favori pour le moment/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /voir les biens/i }),
    ).toBeVisible();
  });

  test("le lien 'Voir les biens' redirige vers /biens", async ({ page }) => {
    await page.goto("/favoris");

    await page.getByRole("link", { name: /voir les biens/i }).click();
    await page.waitForURL("/biens");
  });

  test("méta title est correct", async ({ page }) => {
    await page.goto("/favoris");
    await expect(page).toHaveTitle(/mes favoris/i);
  });
});
