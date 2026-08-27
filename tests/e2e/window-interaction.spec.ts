import { test, expect } from "@playwright/test";

/**
 * Regression coverage for a real user-reported bug: pressing a window's close button did
 * nothing. Root cause: the header's pointerdown handler captured the pointer unconditionally,
 * including presses that started on the close button. Any real click's sub-pixel jitter between
 * pointerdown and pointerup then registered as a micro-drag, and with the pointer captured by
 * the header, the resulting click event's target resolved to the header rather than the button
 * -- so the button's onClick never fired. Playwright's default `.click()` moves with zero
 * jitter, which is why this never showed up in the rest of the suite; these tests simulate the
 * jitter explicitly. See src/os/windows/Window.tsx's onPointerDown for the fix.
 */

test("close button works even with realistic mouse jitter between down and up", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "POWER GRID", exact: true }).click();

  const closeButton = page.locator('[aria-label="POWER GRID"] .window__close');
  const box = await closeButton.boundingBox();
  if (!box) throw new Error("close button not found");
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + 2, centerY + 1); // the jitter a real click almost always has
  await page.mouse.up();

  await expect(page.locator('[aria-label="POWER GRID"]')).not.toBeVisible({ timeout: 3000 });
});

test("dragging by the title area (not the close button) still works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "POWER GRID", exact: true }).click();

  const titleSpan = page.locator('[aria-label="POWER GRID"] .window__title');
  const before = await page.locator('[aria-label="POWER GRID"]').boundingBox();
  const box = await titleSpan.boundingBox();
  if (!box || !before) throw new Error("elements not found");

  await page.mouse.move(box.x + 10, box.y + 5);
  await page.mouse.down();
  await page.mouse.move(box.x + 110, box.y + 105, { steps: 5 });
  await page.mouse.up();

  const after = await page.locator('[aria-label="POWER GRID"]').boundingBox();
  expect(after!.x).toBeGreaterThan(before.x + 50);
});
