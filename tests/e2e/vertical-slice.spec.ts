import { test, expect } from "@playwright/test";

/**
 * Full vertical-slice completion path (docs/ROADMAP.md, Milestone 0):
 * new game -> terminal -> find the engineering log -> power tradeoff (cameras off,
 * security on) -> movement-alert event fires -> read the contradictory incident report ->
 * unexpected transmission arrives -> demo end screen.
 */
test("vertical slice is completable end to end", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("AION-7 :: TERMINAL OPERATING SYSTEM")).toBeVisible();
  await page.getByRole("button", { name: "New Session" }).click({ trial: false });

  await expect(page.getByRole("button", { name: "TERMINAL", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();

  const terminalInput = page.getByLabel("Terminal command input");
  await expect(terminalInput).toBeVisible();

  async function runCommand(command: string) {
    await terminalInput.fill(command);
    await terminalInput.press("Enter");
  }

  await runCommand("cat /engineering/power-log.txt");
  await expect(page.getByText(/Phantom load again/)).toBeVisible();

  await runCommand("power security on");
  await expect(page.getByText(/INSUFFICIENT POWER/)).toBeVisible();

  await runCommand("power cameras off");
  await runCommand("power security on");
  await expect(page.getByText("Security: ONLINE")).toBeVisible();

  await expect(page.getByText(/MOTION SENSOR SC-04/)).toBeVisible();

  await runCommand("cat /security/incident-report.log");
  await expect(page.getByText(/SECURITY INCIDENT REPORT/)).toBeVisible();

  await expect(page.getByText(/INCOMING TRANSMISSION -- UNREGISTERED SOURCE/).first()).toBeVisible();

  await runCommand("cat /communications/incoming.log");
  await expect(page.getByText(/still reading, Priya/)).toBeVisible();

  await expect(page.getByText("END OF DEMONSTRATION SEGMENT")).toBeVisible();
});
