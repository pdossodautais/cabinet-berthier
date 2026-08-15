import { test, expect } from "@playwright/test";

test.describe("Admin - Login", () => {
  test("affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: /administration/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /se connecter/i }),
    ).toBeVisible();
  });

  test("affiche une erreur pour des identifiants incorrects", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("wrong@email.com");
    await page.getByLabel(/mot de passe/i).fill("wrongpassword");
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(
      page.getByText(/email ou mot de passe incorrect/i),
    ).toBeVisible();
  });

  test("le lien 'Mot de passe oublié' est présent", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByText(/mot de passe oublié/i),
    ).toBeVisible();
  });

  test("redirige vers login si non authentifié", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("redirige vers login pour les pages protégées", async ({ page }) => {
    const protectedPages = [
      "/biens",
      "/contacts",
      "/equipe",
      "/parametres",
      "/alertes",
      "/estimations",
      "/blog",
      "/temoignages",
      "/profil",
    ];

    for (const path of protectedPages) {
      const response = await page.goto(path);
      // Should redirect to login (302) or show login page
      expect(page.url()).toContain("/login");
    }
  });
});
