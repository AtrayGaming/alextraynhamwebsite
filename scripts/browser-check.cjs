/* CI-only dependencies; none are shipped to visitors. */
const { createRequire } = require("node:module");
const requireTest = createRequire(
  `${process.env.TEST_DEPS || "/tmp/portfolio-test-deps"}/package.json`,
);
const { chromium, firefox, webkit } = requireTest("playwright");
const { expect } = requireTest("@playwright/test");
const AxeBuilder = requireTest("@axe-core/playwright").default;
const assert = require("node:assert/strict");
const fs = require("node:fs");
const engine = process.env.BROWSER || "chromium";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8080";
const pages = [
  "index.html",
  "radio-ready.html",
  "one-group-different-speeds.html",
  "youtube-content.html",
  "guest-experience.html",
];
(async () => {
  const browser = await { chromium, firefox, webkit }[engine].launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [],
    results = [];
  page.on("pageerror", (e) => errors.push(e.message));
  fs.mkdirSync("test-results", { recursive: true });
  try {
    for (const file of pages) {
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const response = await page.goto(`${base}/${file}`);
        assert.ok(
          [200, 304].includes(response.status()),
          `${file}: HTTP ${response.status()}`,
        );
        await page.locator("h1").waitFor();
        const dimensions = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          viewport: innerWidth,
        }));
        assert.ok(
          dimensions.scroll <= dimensions.viewport + 1,
          `${file} at ${width}: horizontal overflow ${JSON.stringify(dimensions)}`,
        );
        assert.equal(await page.locator("h1").count(), 1);
        // All local image files must decode; lazy images are scrolled into view.
        for (const img of await page.locator("img").all()) {
          await img.scrollIntoViewIfNeeded();
          await expect
            .poll(() =>
              img.evaluate((el) => el.complete && el.naturalWidth > 0),
            )
            .toBe(true);
        }
        if (width === 390 || width === 1440) {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({
            path: `test-results/${engine}-${file}-${width}.png`,
            fullPage: true,
          });
          const audit = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze();
          fs.writeFileSync(
            `test-results/${engine}-${file}-${width}-axe.json`,
            JSON.stringify(audit.violations, null, 2),
          );
          assert.deepEqual(
            audit.violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
            [],
            `${file} ${width}: axe`,
          );
        }
        results.push(`${file}: ${width}px layout and images`);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/index.html`);
    await page.keyboard.press("Tab");
    await expect(page.locator(".skip")).toBeFocused();
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => location.hash), "#main");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator(".menu-toggle")).toBeFocused();
    await expect(page.locator("#navLinks")).toBeHidden();
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page
      .locator("#navLinks")
      .getByRole("link", { name: "The work" })
      .click();
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await page
      .getByRole("button", { name: "In the edit", exact: true })
      .click();
    await expect(page.locator("#lens-edit")).toBeVisible();
    await expect(page.locator("#lens-floor")).toBeHidden();
    await page
      .getByRole("button", { name: "At the workbench", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#lens-build")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "At the workbench", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    results.push(
      "Keyboard skip, mobile menu, Escape focus, menu link closure, all three perspectives",
    );
    await page.goto(`${base}/one-group-different-speeds.html`);
    for (let i = 1; i <= 6; i++) {
      await page
        .getByRole("button", { name: new RegExp(`^Beat ${i}:`) })
        .click();
      await expect(page.locator(`#story-beat-${i}`)).toBeVisible();
      await expect(page.locator(".story-position")).toContainText(
        `Beat ${i} of 6`,
      );
      assert.equal(await page.locator(".story-frame:visible").count(), 1);
    }
    results.push("All six storyboard beats and accessible selection state");
    await page.goto(`${base}/youtube-content.html`);
    assert.equal(
      await page.locator("iframe").getAttribute("src"),
      null,
      "Video must not load until requested",
    );
    await page.route("https://www.youtube-nocookie.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<p>Test fixture: video URL requested.</p>",
      }),
    );
    await page.getByRole("button", { name: "Load YouTube video" }).click();
    await expect(page.locator("iframe")).toBeVisible();
    assert.ok(
      (await page.locator("iframe").getAttribute("src")).startsWith(
        "https://www.youtube-nocookie.com/embed/",
      ),
    );
    results.push(
      "Click-to-load video request and direct fallback link (playback not tested)",
    );
    assert.equal(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
      "auto",
    );
    const noJS = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const fallback = await noJS.newPage();
    await fallback.goto(`${base}/index.html`);
    await expect(fallback.locator("#navLinks")).toBeVisible();
    assert.equal(await fallback.locator(".lens-panel:visible").count(), 3);
    await fallback.goto(`${base}/one-group-different-speeds.html`);
    assert.equal(await fallback.locator(".story-frame:visible").count(), 6);
    await fallback.goto(`${base}/youtube-content.html`);
    await expect(
      fallback.getByRole("link", {
        name: "watch the original video on YouTube",
        exact: true,
      }),
    ).toBeVisible();
    await noJS.close();
    assert.deepEqual(errors, [], "Client exceptions");
    results.push(
      "Reduced motion and no-JavaScript navigation, perspectives, storyboard and video fallback",
    );
    fs.writeFileSync(
      `test-results/${engine}-summary.json`,
      JSON.stringify({ engine, status: "passed", results }, null, 2),
    );
    console.log(JSON.stringify({ engine, status: "passed", results }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
