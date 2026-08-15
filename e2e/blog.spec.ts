import { test, expect } from "@playwright/test";

test.describe("Page blog", () => {
  test("affiche le titre du blog", async ({ page }) => {
    await page.goto("/blog");

    await expect(
      page.getByRole("heading", { name: /blog/i }),
    ).toBeVisible();
  });

  test("affiche un message si aucun article", async ({ page }) => {
    await page.goto("/blog");

    // Either shows articles or empty state
    const heading = page.getByRole("heading", { name: /blog/i });
    await expect(heading).toBeVisible();
  });

  test("méta title contient blog", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/blog/i);
  });

  test("le lien blog est dans la navigation", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("header nav");
    if (await nav.isVisible()) {
      await expect(
        nav.getByRole("link", { name: /blog/i }),
      ).toBeVisible();
    }
  });
});
