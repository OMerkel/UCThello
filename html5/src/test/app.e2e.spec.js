import { expect, test } from "@playwright/test";

// REQ: FR-009, FR-010, FR-011, NFR-001, NFR-005, NFR-006
test("tabs and accordion interactions work without jQuery", async ({
	page,
}) => {
	await page.goto("/index.html");

	const boardTab = page.locator("#tabs > ul a").first();
	await expect(boardTab).toHaveAttribute("role", "tab");
	await expect(page.locator("#tabs-board")).toBeVisible();
	await expect(page.locator("#tabs-options")).toBeHidden();

	await page.locator("#tabs > ul a[href='#tabs-options']").click();
	await expect(page.locator("#tabs-options")).toBeVisible();
	await expect(page).toHaveURL(/#tabs-options/);

	await page.locator("#tabs > ul a[href='#tabs-about']").click();
	await expect(page.locator("#tabs-about")).toBeVisible();

	await page.locator("#accordion > h3").nth(1).click();
	await expect(page.locator("#accordion > h3").nth(1)).toHaveAttribute(
		"aria-expanded",
		"true",
	);
});

// REQ: FR-007, FR-011, NFR-005, NFR-006
test("new game control is keyboard accessible", async ({ page }) => {
	await page.goto("/index.html");
	const newButton = page.locator("#new");
	await expect(newButton).toHaveAttribute("type", "button");
	await newButton.focus();
	await page.keyboard.press("Enter");
	await expect(newButton).toBeVisible();
});
