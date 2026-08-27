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

test("language choice is a standalone browser preference: it survives reload before any save is touched", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "SETTINGS", exact: true }).click();
  await page.getByRole("radio", { name: "Español (Argentina)" }).click();

  // No debounced-autosave wait needed: language is written straight to localStorage on
  // setLanguage() (src/core/language.ts's storeLanguage()), independent of the save snapshot.
  await page.reload();

  // Even the boot screen itself -- chrome for a not-yet-loaded session, with no save continued
  // yet -- is already in Spanish, unlike volume/reduced-motion which do live inside the snapshot.
  await expect(page.getByText("AION-7 :: SISTEMA OPERATIVO DE TERMINAL")).toBeVisible();
  await expect(page.getByRole("button", { name: "Nueva Sesión" })).toBeVisible();
});

test("language choice is independent of loading a save: loading one does not revert it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
  await page.getByLabel("Terminal command input").fill("status");
  await page.getByLabel("Terminal command input").press("Enter");

  // give the debounced autosave a moment to persist (this save has no language of its own)
  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "SETTINGS", exact: true }).click();
  await page.getByRole("radio", { name: "Español (Argentina)" }).click();
  await page.reload();

  const continueButton = page.locator(".boot-screen__button--save", { hasText: "Autoguardado" });
  await expect(continueButton).toBeEnabled({ timeout: 10000 });
  await continueButton.click();

  await expect(page.getByRole("button", { name: "AJUSTES", exact: true })).toBeVisible();
});
