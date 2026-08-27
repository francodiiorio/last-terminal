import { test, expect } from "@playwright/test";

test("Comms app inbox reveals correspondence once Communications is powered, and CASSIUS reacts to its own note being found", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();

  const input = page.getByLabel("Terminal command input");
  async function run(cmd: string) {
    await input.fill(cmd);
    await input.press("Enter");
  }

  // unlock tools, repair + power Communications (same chain as Milestone 1)
  await run("cat /engineering/power-log.txt");
  await run("diagnostic communications");
  await run("route communications");
  await run("power life-support off");
  await run("power communications on");
  await expect(page.getByText("Communications: ONLINE")).toBeVisible();

  await page.getByRole("button", { name: "COMMS", exact: true }).click();
  await expect(page.getByText("NO MESSAGES -- COMMUNICATIONS OFFLINE")).not.toBeVisible();
  await expect(page.getByText("Office of the Signal Program, the Concord").first()).toBeVisible();

  // select the MD 90 correspondence (first entry in the inbox)
  const messageButtons = page.locator(".comms-app__message-button");
  await messageButtons.first().click();
  await expect(page.getByText(/legacy probe/)).toBeVisible();

  // reading it via the GUI must mark the same flag `cat` would, so the CASSIUS note unlocks
  await run("cat /system/cassius-internal.log");
  await expect(page.getByText(/Anand-Kel's decode result contradicts/)).toBeVisible();
  await expect(page.getByText("CASSIUS: Acknowledged. Record open. No further comment.")).toBeVisible();
});

test("sending the incident report draft draws a CASSIUS reaction distinct from the routine update", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();

  const input = page.getByLabel("Terminal command input");
  async function run(cmd: string) {
    await input.fill(cmd);
    await input.press("Enter");
  }

  await run("cat /engineering/power-log.txt");
  await run("diagnostic communications");
  await run("route communications");
  await run("power life-support off");
  await run("power communications on");

  await page.getByRole("button", { name: "COMMS", exact: true }).click();

  const routineButton = page.getByRole("button", { name: "SEND" }).first();
  await routineButton.click();
  await expect(page.getByText(/Routine status update queued/)).toBeVisible();

  const incidentButton = page.getByRole("button", { name: "SEND" }); // now only the incident-report SEND remains enabled
  await incidentButton.click();
  await expect(page.getByText(/Full incident report queued/)).toBeVisible();
  await expect(
    page.getByText("CASSIUS: Outbound content flagged -- exceeds current disclosure directive."),
  ).toBeVisible();
});
