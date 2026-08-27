import { test, expect } from "@playwright/test";

test("progress persists via autosave and continue", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();

  const terminalInput = page.getByLabel("Terminal command input");
  await terminalInput.fill("power cameras off");
  await terminalInput.press("Enter");
  await terminalInput.fill("power security on");
  await terminalInput.press("Enter");
  await expect(page.getByText("Security: ONLINE")).toBeVisible();

  // give the debounced autosave a moment to persist to IndexedDB
  await page.waitForTimeout(2000);
  await page.reload();

  const continueButton = page.locator(".boot-screen__button--save", { hasText: "Autosave" });
  await expect(continueButton).toBeEnabled();
  await continueButton.click();

  // continuing should drop us straight onto the desktop with prior power state restored
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
  await page.getByLabel("Terminal command input").fill("power");
  await page.getByLabel("Terminal command input").press("Enter");
  await expect(page.getByText(/security\s+ON/)).toBeVisible();
});

test("export produces a save file that can be imported into a fresh session", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();

  const terminalInput = page.getByLabel("Terminal command input");
  await terminalInput.fill("power cameras off");
  await terminalInput.press("Enter");
  await terminalInput.fill("power security on");
  await terminalInput.press("Enter");
  await expect(page.getByText("Security: ONLINE")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Save" }).click();
  const download = await downloadPromise;
  const savePath = await download.path();
  expect(savePath).toBeTruthy();

  // start a fresh session in place -- confirms state actually reset
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
  await page.getByLabel("Terminal command input").fill("power");
  await page.getByLabel("Terminal command input").press("Enter");
  await expect(page.getByText(/security\s+OFF/)).toBeVisible();

  // reload back to the boot screen and import the exported save
  await page.reload();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import Save File" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(savePath!);

  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
  await page.getByLabel("Terminal command input").fill("power");
  await page.getByLabel("Terminal command input").press("Enter");
  await expect(page.getByText(/security\s+ON/)).toBeVisible();
});

test("Save As creates a manual slot visible in the boot screen save browser, and it can be deleted", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();

  page.once("dialog", (dialog) => dialog.accept("My Manual Save"));
  await page.getByRole("button", { name: "Save As..." }).click();
  await expect(page.getByText('Saved as "My Manual Save".')).toBeVisible();

  await page.reload();
  const savedRow = page.locator(".boot-screen__button--save", { hasText: "My Manual Save" });
  await expect(savedRow).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete save My Manual Save" }).click();
  await expect(savedRow).not.toBeVisible();
});
