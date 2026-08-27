import { test, expect } from "@playwright/test";

async function newGameOnTerminal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "New Session" }).click();
  await page.getByRole("button", { name: "TERMINAL", exact: true }).click();
}

test("reading the engineering log unlocks the diagnostic toolset", async ({ page }) => {
  await newGameOnTerminal(page);
  const input = page.getByLabel("Terminal command input");

  await input.fill("scan laboratory");
  await input.press("Enter");
  await expect(page.getByText("command not found: scan")).toBeVisible();

  await input.fill("cat /engineering/power-log.txt");
  await input.press("Enter");
  await expect(page.getByText(/New tools available/)).toBeVisible();

  await input.fill("scan laboratory");
  await input.press("Enter");
  await expect(page.getByText(/Sector cleared for power restoration/)).toBeVisible();
});

test("laboratory unlock chain: scan clears the seal, then decrypt reveals the archive file", async ({ page }) => {
  await newGameOnTerminal(page);
  const input = page.getByLabel("Terminal command input");

  async function run(cmd: string) {
    await input.fill(cmd);
    await input.press("Enter");
  }

  await run("cat /engineering/power-log.txt");
  await run("scan laboratory");
  await run("power cameras off"); // free enough headroom for the 65kW laboratory draw
  await run("power laboratory on");
  await expect(page.getByText("Laboratory: ONLINE")).toBeVisible();

  await run("cat /archive/tantalus-survey.txt");
  await expect(page.getByText(/FILE ENCRYPTED/)).toBeVisible();

  await run("decrypt /archive/tantalus-survey.txt");
  await expect(page.getByText(/DECRYPTED/)).toBeVisible();

  await run("cat /archive/tantalus-survey.txt");
  await expect(page.getByText(/Radar reflectivity/)).toBeVisible();
});

test("communications repair chain requires diagnostic then route, and powering it needs life support off", async ({
  page,
}) => {
  await newGameOnTerminal(page);
  const input = page.getByLabel("Terminal command input");

  async function run(cmd: string) {
    await input.fill(cmd);
    await input.press("Enter");
  }

  await run("cat /engineering/power-log.txt");
  await run("power communications on");
  await expect(page.getByText(/CANNOT ENABLE/)).toBeVisible();

  await run("route communications");
  await expect(page.getByText(/no fault diagnosed/i)).toBeVisible();

  await run("diagnostic communications");
  await run("route communications");
  await expect(page.getByText(/ARRAY REPAIRED/)).toBeVisible();

  await run("power communications on");
  await expect(page.getByText(/INSUFFICIENT POWER/)).toBeVisible();

  await run("power life-support off");
  await expect(page.getByText(/LIFE SUPPORT OFFLINE/)).toBeVisible();
  await run("power communications on");
  await expect(page.getByText("Communications: ONLINE")).toBeVisible();

  await run("cat /communications/concord-correspondence.log");
  await expect(page.getByText(/legacy probe/)).toBeVisible();
});

test("camera feed resolves the Sector C motion red herring", async ({ page }) => {
  await newGameOnTerminal(page);
  const input = page.getByLabel("Terminal command input");

  async function run(cmd: string) {
    await input.fill(cmd);
    await input.press("Enter");
  }

  await run("cat /engineering/power-log.txt");
  await run("power cameras off");
  await run("power security on");
  await expect(page.getByText(/MOTION SENSOR SC-04/)).toBeVisible();

  // free up headroom again so Cameras can come back on alongside Security
  await run("power security off");
  await run("power cameras on");
  await run("camera sector-c");
  await expect(page.getByText(/hairline stress fracture/)).toBeVisible();
  await expect(page.getByText(/No personnel signature detected/)).toBeVisible();
});
