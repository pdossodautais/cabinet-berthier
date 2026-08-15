import { test, expect } from "@playwright/test";

test.describe("Page témoignages", () => {
  test("affiche le titre", async ({ page }) => {
    await page.goto("/temoignages");

    await expect(
      page.getByRole("heading", { name: /témoignages/i }),
    ).toBeVisible();
  });

  test("méta title correct", async ({ page }) => {
    await page.goto("/temoignages");
    await expect(page).toHaveTitle(/témoignages/i);
  });

  test("la page est accessible (status 200)", async ({ page }) => {
    const response = await page.goto("/temoignages");
    expect(response?.status()).toBe(200);
  });
});
