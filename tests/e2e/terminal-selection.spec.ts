import { test, expect } from "@playwright/test";

/**
 * Regression coverage: selecting output text (e.g. to copy a log line) used to be immediately
 * wiped out. Root cause: the terminal container refocuses its input on any click, and the
 * mouseup that completes a text-selection drag also fires a click -- so the selection was
 * collapsed the instant it was made. Fixed by skipping the refocus when a selection is active.
 * See src/os/terminal/TerminalApp.tsx's handleTerminalClick.
 */
test("selecting terminal output text survives releasing the mouse", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
  const input = page.getByLabel("Terminal command input");
  await input.fill("cat /engineering/power-log.txt");
  await input.press("Enter");

  const outputLine = page.locator(".terminal__line").last();
  const box = await outputLine.boundingBox();
  if (!box) throw new Error("no box for output line");

  await page.mouse.move(box.x + 5, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();

  const selected = await page.evaluate(() => window.getSelection()?.toString() ?? "");
  expect(selected.length).toBeGreaterThan(5);
});

test("a plain click (no drag) still refocuses the input as before", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
  const input = page.getByLabel("Terminal command input");

  // click elsewhere first so the input isn't already focused, then click the output area
  await page.locator(".terminal__output").click();
  await expect(input).toBeFocused();
});
