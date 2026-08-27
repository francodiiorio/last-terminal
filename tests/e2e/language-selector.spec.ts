import { test, expect } from "@playwright/test";

/**
 * Coverage for the Argentine Spanish language selector (Settings app): switching languages
 * re-localizes UI chrome (window titles, taskbar), the terminal, and narrative content
 * immediately, without a reload -- see src/i18n/ and content/*'s Localized<T> fields.
 */

test("switching to Español (Argentina) re-localizes UI chrome and terminal output live", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();

  await page.getByRole("button", { name: "SETTINGS", exact: true }).click();
  await expect(page.locator('[aria-label="SETTINGS"]')).toBeVisible();

  await page.getByRole("radio", { name: "Español (Argentina)" }).click();

  // Window title and taskbar re-localize immediately.
  await expect(page.locator('[aria-label="AJUSTES"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "AJUSTES", exact: true })).toBeVisible();

  // Terminal output localizes too.
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
  const input = page.getByLabel("Entrada de comandos de la terminal");
  await input.fill("status");
  await input.press("Enter");
  await expect(page.getByText("AION-7 -- ESTADO DE LA ESTACIÓN")).toBeVisible();

  // Switching back to English re-localizes live too, with no residual Spanish chrome.
  await page.getByRole("button", { name: "AJUSTES", exact: true }).click();
  await page.getByRole("radio", { name: "English" }).click();
  await expect(page.locator('[aria-label="SETTINGS"]')).toBeVisible();
  await expect(page.locator('[aria-label="AJUSTES"]')).not.toBeVisible();
});

test("language choice is stored in the save snapshot and reapplies on continue", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "SETTINGS", exact: true }).click();
  await page.getByRole("radio", { name: "Español (Argentina)" }).click();

  // Wait past the debounced autosave (1.2s) before reloading, so the language choice is persisted
  // into the autosave snapshot (settings.language -- see src/store/types.ts's GameSnapshot).
  await page.waitForTimeout(2000);
  await page.reload();

  // The boot screen itself is chrome for a not-yet-loaded session, so it renders in the live
  // store's default language (English) until a save is actually continued -- same as every other
  // setting (volume, reduced motion). Continuing the autosave re-applies the saved language.
  const continueButton = page.locator(".boot-screen__button--save", { hasText: "Autosave" });
  await expect(continueButton).toBeEnabled({ timeout: 10000 });
  await continueButton.click();

  await expect(page.getByRole("button", { name: "AJUSTES", exact: true })).toBeVisible();
});
