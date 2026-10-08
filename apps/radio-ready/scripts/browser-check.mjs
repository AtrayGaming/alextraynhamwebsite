import { chromium, firefox, webkit } from "playwright";
import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
const engine = process.env.BROWSER || "chromium";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const browser = await { chromium, firefox, webkit }[engine].launch({
  ...(process.env.CHROMIUM_EXECUTABLE
    ? {
        executablePath: process.env.CHROMIUM_EXECUTABLE,
        args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
      }
    : {}),
  headless: true,
});
mkdirSync("test-results", { recursive: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const checks = [];
try {
  const landing = await page.goto(`${base}/`);
  if (process.env.PUBLIC_DEMO === "1") {
    console.log(JSON.stringify({
      origin: base,
      status: landing?.status(),
      title: await page.title(),
      mitigation: landing?.headers()["cf-mitigated"] || null,
    }));
  }
  assert.equal(landing?.status(), 200, "Landing page HTTP status");
  await page.getByRole("link", { name: "Explore the practice studio" }).click();
  await page.getByRole("heading", { name: "Your practice studio." }).waitFor();
  await page
    .getByRole("button", { name: "Start Quick Match", exact: true })
    .waitFor();
  await page.screenshot({
    path: "test-results/workspace-desktop.png",
    fullPage: true,
  });
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  writeFileSync(
    "test-results/accessibility.json",
    JSON.stringify(audit.violations, null, 2),
  );
  assert.deepEqual(
    audit.violations.map((x) => x.id),
    [],
    "Overview accessibility violations",
  );
  checks.push("Overview accessibility");
  await page
    .getByLabel("Focus your next session")
    .selectOption("Creative studio");
  await page
    .getByRole("button", { name: "Start Quick Match", exact: true })
    .click();
  await page.getByRole("heading", { name: "Make the connection." }).waitFor();
  const content = await (await page.request.get(`${base}/api/content`)).json();
  // Deliberately miss the first question, then clear every concept.
  let cue = await page.locator(".question-card h2").textContent();
  let item = content.items.find((x) => x.cue === cue);
  let wrong = page
    .locator(".choice")
    .filter({ hasNotText: item.meaning })
    .first();
  await wrong.click();
  await page.getByText("Keep this one in the mix.", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Next question", exact: true })
    .click();
  for (let i = 0; i < 12; i++) {
    if (
      await page
        .getByRole("heading", { name: "That’s a good place to finish." })
        .isVisible()
    )
      break;
    cue = await page.locator(".question-card h2").textContent();
    item = content.items.find((x) => x.cue === cue);
    await page
      .getByRole("button", {
        name: new RegExp(item.meaning.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      .click();
    const next = page.getByRole("button", {
      name: /^(Next question|See your session result)/,
    });
    await next.click();
  }
  await page
    .getByRole("heading", { name: "That’s a good place to finish." })
    .waitFor();
  checks.push("Quick Match retries and finite completion");
  await page.screenshot({ path: "test-results/completion.png" });
  await page.reload();
  await page.getByRole("heading", { name: "Your practice studio." }).waitFor();
  await page
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await page.getByText("10", { exact: true }).first().waitFor();
  checks.push("Guest refresh persistence");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page
    .getByRole("button", { name: "Reveal meaning", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Reviewed · next" }).click();
  checks.push("Flashcard reveal and review");
  await page.getByRole("button", { name: "Scenarios", exact: true }).click();
  await page.locator(".choice").first().click();
  await page.locator(".feedback").waitFor();
  checks.push("Scenario response feedback");
  await page
    .getByRole("button", { name: "Trainer Studio", exact: true })
    .click();
  await page.getByRole("button", { name: "Add point to Team A" }).click();
  assert.equal(
    await page.locator(".team-scores strong").first().textContent(),
    "1",
  );
  await page.getByRole("button", { name: "Presentation view" }).click();
  await page.getByRole("button", { name: "Exit presentation" }).waitFor();
  checks.push("Trainer scoring and presentation");
  await page.getByRole("button", { name: "Exit presentation" }).click();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/workspace-mobile.png",
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "No horizontal overflow on mobile",
  );
  const mobileAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    mobileAudit.violations.map((x) => x.id),
    [],
    "Mobile accessibility",
  );
  checks.push("Mobile layout and accessibility");
  await page.goto(`${base}/`);
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
  const landingAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    landingAudit.violations.map((x) => x.id),
    [],
    "Landing accessibility",
  );
  checks.push("Landing accessibility");
  await page.goto(`${base}/case-study`);
  await page
    .getByRole("heading", { name: "Making practice feel purposeful." })
    .waitFor();
  assert.equal(errors.length, 0, errors.join("\n"));
  checks.push("Case study and no client errors");
  // Use a fresh context to verify keyboard entry and real account controls.
  const accountContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const accountPage = await accountContext.newPage();
  await accountPage.goto(`${base}/practice`);
  await accountPage
    .getByRole("heading", { name: "Your practice studio." })
    .waitFor();
  await accountPage.getByRole("link", { name: "Skip to content" }).focus();
  assert.equal(
    await accountPage.locator(":focus").textContent(),
    "Skip to content",
  );
  await accountPage.keyboard.press("Enter");
  await expect(accountPage.locator("#main")).toBeFocused();
  checks.push("Keyboard skip navigation");
  if (process.env.PUBLIC_DEMO !== "1") {
    const fixture = JSON.parse(
      readFileSync(".data/test-accounts.json", "utf8"),
    );
    await accountPage
      .getByRole("button", { name: "Sign in", exact: true })
      .click();
    await accountPage
      .getByLabel("Email", { exact: true })
      .fill(fixture.adminA.email);
    await accountPage
      .getByLabel("Password", { exact: true })
      .fill(fixture.adminA.password);
    await accountPage
      .locator("form")
      .getByRole("button", { name: "Sign in", exact: true })
      .click();
    await accountPage
      .getByRole("button", { name: "Content library", exact: true })
      .waitFor();
    await accountPage
      .getByRole("button", { name: "Content library", exact: true })
      .click();
    await accountPage
      .getByRole("button", { name: "Create a concept", exact: true })
      .click();
    await accountPage
      .getByLabel("Label / title", { exact: true })
      .fill("DEMO–PAPER UI CHECK");
    await accountPage
      .getByLabel("Correct answer", { exact: true })
      .fill("Paper sculpture");
    await accountPage
      .getByLabel("scenario", { exact: true })
      .fill("An imaginary visitor wants to fold a paper sculpture.");
    await accountPage
      .getByLabel("explanation", { exact: true })
      .fill("An invented creative activity for this interface check.");
    await accountPage.getByRole("checkbox").check();
    await accountPage
      .getByRole("button", { name: "Save draft", exact: true })
      .click();
    await accountPage
      .getByText("Draft saved. Submit it for a separate publishing review.")
      .waitFor();
    const draftRow = accountPage
      .locator(".content-versions article")
      .filter({ hasText: "DEMO–PAPER UI CHECK" })
      .first();
    await draftRow
      .getByRole("button", { name: "Submit for review", exact: true })
      .click();
    await accountPage
      .getByText("Version 1 submitted for review.", { exact: true })
      .waitFor();
    checks.push("Real administrator login, draft editor and review submission");
  } else {
    const response = await accountPage.request.get(`${base}/api/config`);
    assert.equal((await response.json()).accounts, false);
    checks.push("Unconfigured account services explicitly disabled");
  }
  await accountContext.close();

  console.log(JSON.stringify({ browser: engine, passed: checks }, null, 2));
  writeFileSync(
    `test-results/browser-${engine}.json`,
    JSON.stringify({ browser: engine, passed: checks }, null, 2),
  );
} finally {
  await browser.close();
}
