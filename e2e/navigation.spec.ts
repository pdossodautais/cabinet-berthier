import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navigation desktop fonctionne", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("header nav");
    if (await nav.isVisible()) {
      // Navigate to biens
      await nav.getByRole("link", { name: /nos biens/i }).click();
      await page.waitForURL("/biens");
      await expect(page).toHaveURL("/biens");

      // Navigate to contact
      await nav.getByRole("link", { name: /contact/i }).click();
      await page.waitForURL("/contact");
      await expect(page).toHaveURL("/contact");
    }
  });

  test("navigation mobile fonctionne", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Test mobile uniquement");

    await page.goto("/");

    // Open mobile menu
    const menuButton = page.getByRole("button", { name: /menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Check mobile nav links
    await expect(page.getByRole("link", { name: /nos biens/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /contact/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /favoris/i })).toBeVisible();
  });

  test("page 404 pour une URL inexistante", async ({ page }) => {
    const response = await page.goto("/page-inexistante-xyz");
    expect(response?.status()).toBe(404);
  });

  test("le logo ramène à l'accueil", async ({ page }) => {
    await page.goto("/biens");

    await page
      .locator("header")
      .getByRole("link", { name: /mon agence/i })
      .click();
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });
});
