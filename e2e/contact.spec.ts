import { test, expect } from "@playwright/test";

test.describe("Page contact", () => {
  test("affiche le formulaire de contact", async ({ page }) => {
    await page.goto("/contact");

    await expect(
      page.getByRole("heading", { name: /contact/i }).first(),
    ).toBeVisible();
  });

  test("les champs du formulaire sont présents", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByLabel(/prénom/i)).toBeVisible();
    await expect(page.getByLabel(/^nom/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
  });

  test("validation côté client - champs requis", async ({ page }) => {
    await page.goto("/contact");

    // Try to submit empty form
    const submitButton = page.getByRole("button", { name: /envoyer/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Browser should prevent submission due to required fields
      const firstNameInput = page.getByLabel(/prénom/i);
      const validationMessage = await firstNameInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage,
      );
      expect(validationMessage).toBeTruthy();
    }
  });
});
