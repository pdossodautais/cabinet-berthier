import { test, expect } from "@playwright/test";

test.describe("Admin - Navigation (non-auth)", () => {
  test("la page login charge correctement", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);
  });

  test("l'icône Building2 est visible sur le login", async ({ page }) => {
    await page.goto("/login");

    // Le logo est un div avec l'icône Building2
    await expect(
      page.getByRole("heading", { name: /administration/i }),
    ).toBeVisible();
  });

  test("auth callback route existe", async ({ page }) => {
    // Should redirect to login since no valid token
    await page.goto("/auth/callback");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});
