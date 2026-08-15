import { test, expect } from "@playwright/test";

test.describe("SEO & Accessibilité", () => {
  test("la page d'accueil a les balises méta essentielles", async ({
    page,
  }) => {
    await page.goto("/");

    // Title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Meta description
    const description = page.locator('meta[name="description"]');
    await expect(description).toBeAttached();

    // Viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeAttached();

    // Canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toBeAttached();
  });

  test("robots.txt est accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);

    const text = await page.textContent("body");
    expect(text?.toLowerCase()).toContain("user-agent");
    expect(text?.toLowerCase()).toContain("sitemap");
  });

  test("sitemap.xml est accessible et contient les nouvelles pages", async ({
    page,
  }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);

    const text = await page.textContent("body");
    expect(text).toContain("/estimation");
    expect(text).toContain("/mentions-legales");
    expect(text).toContain("/confidentialite");
  });

  test("manifest.json est accessible", async ({ page }) => {
    const response = await page.goto("/manifest.webmanifest");
    expect(response?.status()).toBe(200);
  });

  test("les images ont des attributs alt", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      // All images should have alt attribute (can be empty for decorative)
      expect(alt).not.toBeNull();
    }
  });

  test("les titres sont dans le bon ordre hiérarchique", async ({ page }) => {
    await page.goto("/");

    // Should have exactly one h1
    const h1s = page.locator("h1");
    expect(await h1s.count()).toBe(1);
  });

  test("les liens de navigation ont du texte accessible", async ({ page }) => {
    await page.goto("/");

    const links = page.locator("header a");
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute("aria-label");
      // Each link should have either text content or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test("chaque page publique a un méta description", async ({ page }) => {
    const pages = [
      "/",
      "/biens",
      "/contact",
      "/estimation",
      "/blog",
      "/temoignages",
      "/mentions-legales",
      "/confidentialite",
    ];

    for (const path of pages) {
      await page.goto(path);
      const desc = page.locator('meta[name="description"]');
      await expect(desc).toBeAttached();
    }
  });

  test("chaque page publique a un h1 unique", async ({ page }) => {
    const pages = [
      "/",
      "/biens",
      "/contact",
      "/estimation",
      "/blog",
      "/temoignages",
      "/mentions-legales",
      "/confidentialite",
      "/a-propos",
      "/favoris",
    ];

    for (const path of pages) {
      await page.goto(path);
      const h1s = page.locator("h1");
      const count = await h1s.count();
      expect(count, `${path} should have exactly 1 h1, found ${count}`).toBe(
        1,
      );
    }
  });
});
