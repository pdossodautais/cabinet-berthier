import { test, expect } from "@playwright/test";

test.describe("Page estimation", () => {
  test("affiche le formulaire d'estimation", async ({ page }) => {
    await page.goto("/estimation");

    await expect(
      page.getByRole("heading", { name: /estimez votre bien/i }),
    ).toBeVisible();
  });

  test("les champs du formulaire sont présents", async ({ page }) => {
    await page.goto("/estimation");

    await expect(page.getByLabel(/prénom/i)).toBeVisible();
    await expect(page.getByLabel(/^nom/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/adresse du bien/i)).toBeVisible();
    await expect(page.getByLabel(/ville/i)).toBeVisible();
    await expect(page.getByLabel(/type de bien/i)).toBeVisible();
  });

  test("affiche les avantages", async ({ page }) => {
    await page.goto("/estimation");

    await expect(page.getByText(/expertise locale/i)).toBeVisible();
    await expect(page.getByText(/sans engagement/i)).toBeVisible();
  });

  test("validation côté client - champs requis", async ({ page }) => {
    await page.goto("/estimation");

    const submitButton = page.getByRole("button", {
      name: /demander une estimation/i,
    });
    await submitButton.click();

    const firstNameInput = page.getByLabel(/prénom/i);
    const validationMessage = await firstNameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    expect(validationMessage).toBeTruthy();
  });

  test("méta title est correct", async ({ page }) => {
    await page.goto("/estimation");
    await expect(page).toHaveTitle(/estimation/i);
  });
});
