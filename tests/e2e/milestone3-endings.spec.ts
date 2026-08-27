import { test, expect, type Page } from "@playwright/test";

async function run(page: Page, cmd: string) {
  const input = page.getByLabel("Terminal command input");
  await input.fill(cmd);
  await input.press("Enter");
}

/** Boots a new session and plays through the vertical slice up to reading the unknown
 * transmission, which unlocks 'conclude'. Shared setup for all four ending tests. */
async function reachClimax(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();

  await run(page, "cat /engineering/power-log.txt");
  await run(page, "power cameras off");
  await run(page, "power security on");
  await run(page, "cat /security/incident-report.log");
  await run(page, "cat /communications/incoming.log");
  await expect(page.getByText(/Run 'conclude' when ready/)).toBeVisible();
}

/** Repairs and powers Communications, which forces Life Support off to fit the budget. */
async function unlockAndPowerCommunications(page: Page) {
  await run(page, "diagnostic communications");
  await run(page, "route communications");
  await run(page, "power security off");
  await run(page, "power life-support off");
  await run(page, "power communications on");
  await expect(page.getByText("Communications: ONLINE")).toBeVisible();
}

async function sendIncidentReportDraft(page: Page) {
  await page.getByRole("button", { name: "COMMS", exact: true }).click();
  await page.getByText("Send: Incident Report (Cascade & Signal Findings)").locator("..").getByRole("button").click();
  await expect(page.getByText(/Full incident report queued/)).toBeVisible();
}

test("Silence: no report sent, no sustained risk -> the unspoiled default ending", async ({ page }) => {
  await reachClimax(page);
  await run(page, "conclude");
  await expect(page.getByText("ENDING -- SILENCE")).toBeVisible();
});

test("Disclosure: incident report sent without reading CASSIUS's internal note", async ({ page }) => {
  await reachClimax(page);
  await unlockAndPowerCommunications(page);
  await sendIncidentReportDraft(page);
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
  await run(page, "conclude");
  await expect(page.getByText("ENDING -- DISCLOSURE")).toBeVisible();
});

test("Custodian: incident report sent after understanding CASSIUS's directive conflict", async ({ page }) => {
  await reachClimax(page);
  await unlockAndPowerCommunications(page);
  await run(page, "cat /communications/concord-correspondence.log");
  await run(page, "cat /system/cassius-internal.log");
  await expect(page.getByText("CASSIUS: Acknowledged. Record open. No further comment.")).toBeVisible();
  await sendIncidentReportDraft(page);
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
  await run(page, "conclude");
  await expect(page.getByText("ENDING -- CUSTODIAN")).toBeVisible();
});

test("Resonance: no report sent, Life Support left off through 40+ minutes of station time", async ({ page }) => {
  await reachClimax(page);
  await run(page, "power life-support off");
  for (let i = 0; i < 7; i++) {
    await run(page, "diagnostic");
  }
  await run(page, "conclude");
  await expect(page.getByText("ENDING -- RESONANCE")).toBeVisible();
});

test("regression: the ending screen moves keyboard focus off the terminal input, so it isn't left as a dead but live control surface behind the modal", async ({
  page,
}) => {
  await reachClimax(page);

  const terminalInput = page.getByLabel("Terminal command input");
  await expect(terminalInput).toBeFocused();

  await run(page, "conclude");
  await expect(page.getByText("ENDING -- SILENCE")).toBeVisible();

  // focus must have moved off the terminal input and onto the ending screen's Restart button
  await expect(terminalInput).not.toBeFocused();
  await expect(page.getByRole("button", { name: "Restart Session" })).toBeFocused();

  // pressing Enter now activates the focused Restart button (standard button semantics), not a
  // terminal command hidden behind the modal
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "New Session" })).toBeVisible();
});
