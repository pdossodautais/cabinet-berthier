import { test, expect } from "@playwright/test";

test.describe("Page des biens", () => {
  test("affiche le titre et les filtres", async ({ page }) => {
    await page.goto("/biens");

    await expect(
      page.getByRole("heading", { name: /nos biens immobiliers/i }),
    ).toBeVisible();

    // Search input
    await expect(
      page.getByPlaceholder(/rechercher par mot-clé/i),
    ).toBeVisible();
  });

  test("les filtres de type sont visibles", async ({ page }) => {
    await page.goto("/biens");

    // Transaction type, property type and rooms selects exist
    await expect(page.getByText(/vente & location/i)).toBeVisible();
    await expect(page.getByText(/tous types/i)).toBeVisible();
  });

  test("la recherche texte modifie l'URL", async ({ page }) => {
    await page.goto("/biens");

    const searchInput = page.getByPlaceholder(/rechercher par mot-clé/i);
    await searchInput.fill("paris");
    await searchInput.press("Enter");

    await page.waitForURL(/q=paris/);
    expect(page.url()).toContain("q=paris");
  });

  test("le tri modifie l'URL", async ({ page }) => {
    await page.goto("/biens");

    // Click on the sort select and choose "Prix croissant"
    await page.getByText(/plus récents/i).click();
    await page.getByRole("option", { name: /prix croissant/i }).click();

    await page.waitForURL(/tri=prix_asc/);
    expect(page.url()).toContain("tri=prix_asc");
  });

  test("le bouton effacer réinitialise les filtres", async ({ page }) => {
    await page.goto("/biens?type=maison&ville=paris");

    const clearButton = page.getByRole("button", { name: /effacer/i });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    await page.waitForURL("/biens");
    expect(page.url()).not.toContain("type=");
    expect(page.url()).not.toContain("ville=");
  });

  test("méta title est correct", async ({ page }) => {
    await page.goto("/biens");
    await expect(page).toHaveTitle(/nos biens immobiliers/i);
  });
});
