import { beforeEach, describe, expect, it } from "vitest";

import { initializeAccordion, initializeTabs } from "../js/ui/widgets.js";

function createTabsMarkup() {
	document.body.innerHTML = `
		<div id='tabs'>
			<ul>
				<li><a href='#tabs-board'>Board</a></li>
				<li><a href='#tabs-options'>Options</a></li>
				<li><a href='#tabs-about'>About</a></li>
			</ul>
			<div id='tabs-board'>Board panel</div>
			<div id='tabs-options'>Options panel</div>
			<div id='tabs-about'>About panel</div>
		</div>
	`;
	return document.getElementById("tabs");
}

function createAccordionMarkup() {
	document.body.innerHTML = `
		<div id='accordion'>
			<h3>Rules</h3>
			<div id='r'>Rules content</div>
			<h3>Legal</h3>
			<div id='l'>Legal content</div>
			<h3>Concepts</h3>
			<div id='c'>Concepts content</div>
		</div>
	`;
	return document.getElementById("accordion");
}

describe("tabs widget", () => {
	beforeEach(() => {
		history.replaceState(null, "", "#");
	});

	// REQ: FR-009, FR-011, NFR-005, NFR-006
	it("initializes roles and default active tab", () => {
		const tabs = createTabsMarkup();
		initializeTabs(tabs);

		const links = tabs.querySelectorAll("a");
		expect(tabs.querySelector("ul").getAttribute("role")).toBe("tablist");
		expect(links[0].getAttribute("aria-selected")).toBe("true");
		expect(links[1].getAttribute("aria-selected")).toBe("false");
		expect(tabs.querySelector("#tabs-board").hidden).toBe(false);
		expect(tabs.querySelector("#tabs-options").hidden).toBe(true);
	});

	// REQ: FR-009, NFR-006
	it("uses URL hash for initial tab", () => {
		history.replaceState(null, "", "#tabs-about");
		const tabs = createTabsMarkup();
		initializeTabs(tabs);

		const links = tabs.querySelectorAll("a");
		expect(links[2].getAttribute("aria-selected")).toBe("true");
		expect(tabs.querySelector("#tabs-about").hidden).toBe(false);
	});

	// REQ: FR-009, NFR-006
	it("falls back to first tab for unknown URL hash", () => {
		history.replaceState(null, "", "#missing-panel");
		const tabs = createTabsMarkup();
		initializeTabs(tabs);

		const links = tabs.querySelectorAll("a");
		expect(links[0].getAttribute("aria-selected")).toBe("true");
		expect(tabs.querySelector("#tabs-board").hidden).toBe(false);
	});

	// REQ: FR-009, FR-011, NFR-005, NFR-006
	it("switches tabs by click and keyboard navigation", () => {
		const tabs = createTabsMarkup();
		initializeTabs(tabs);
		const links = tabs.querySelectorAll("a");

		links[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(links[1].getAttribute("aria-selected")).toBe("true");
		expect(tabs.querySelector("#tabs-options").hidden).toBe(false);
		expect(window.location.hash).toBe("#tabs-options");

		links[1].dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
		);
		expect(links[2].getAttribute("aria-selected")).toBe("true");

		links[2].dispatchEvent(
			new KeyboardEvent("keydown", { key: "End", bubbles: true }),
		);
		expect(links[2].getAttribute("aria-selected")).toBe("true");

		links[2].dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
		);
		expect(links[0].getAttribute("aria-selected")).toBe("true");

		links[0].dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
		);
		expect(links[2].getAttribute("aria-selected")).toBe("true");

		links[2].dispatchEvent(
			new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
		);
		expect(links[0].getAttribute("aria-selected")).toBe("true");

		links[0].dispatchEvent(
			new KeyboardEvent("keydown", { key: " ", bubbles: true }),
		);
		expect(links[0].getAttribute("aria-selected")).toBe("true");

		links[0].dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
		expect(links[0].getAttribute("aria-selected")).toBe("true");

		links[0].dispatchEvent(
			new KeyboardEvent("keydown", { key: "x", bubbles: true }),
		);
		expect(links[0].getAttribute("aria-selected")).toBe("true");
	});
});

describe("accordion widget", () => {
	// REQ: FR-010, NFR-005, NFR-006
	it("initializes and opens first item", () => {
		const accordion = createAccordionMarkup();
		initializeAccordion(accordion);

		const headers = accordion.querySelectorAll("h3");
		expect(headers[0].getAttribute("aria-expanded")).toBe("true");
		expect(headers[1].getAttribute("aria-expanded")).toBe("false");
		expect(headers[0].classList.contains("is-open")).toBe(true);
	});

	// REQ: FR-010, FR-011, NFR-005, NFR-006
	it("handles click and keyboard navigation", () => {
		const accordion = createAccordionMarkup();
		initializeAccordion(accordion);
		const headers = accordion.querySelectorAll("h3");

		headers[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(headers[1].getAttribute("aria-expanded")).toBe("true");

		headers[1].dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
		);
		expect(headers[2].getAttribute("aria-expanded")).toBe("true");

		headers[2].dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
		);
		expect(headers[0].getAttribute("aria-expanded")).toBe("true");

		headers[0].dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
		);
		expect(headers[2].getAttribute("aria-expanded")).toBe("true");

		headers[2].dispatchEvent(
			new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
		);
		expect(headers[0].getAttribute("aria-expanded")).toBe("true");

		headers[0].dispatchEvent(
			new KeyboardEvent("keydown", { key: "End", bubbles: true }),
		);
		expect(headers[2].getAttribute("aria-expanded")).toBe("true");

		headers[2].dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
		expect(headers[2].getAttribute("aria-expanded")).toBe("true");

		headers[2].dispatchEvent(
			new KeyboardEvent("keydown", { key: " ", bubbles: true }),
		);
		expect(headers[2].getAttribute("aria-expanded")).toBe("true");

		headers[2].dispatchEvent(
			new KeyboardEvent("keydown", { key: "x", bubbles: true }),
		);
		expect(headers[2].getAttribute("aria-expanded")).toBe("true");
	});

	// REQ: FR-010, NFR-006
	it("skips orphan headers without matching panel", () => {
		document.body.innerHTML = `
			<div id='accordion'>
				<h3>Rules</h3>
				<div>Rules</div>
				<h3>Broken header</h3>
			</div>
		`;
		const accordion = document.getElementById("accordion");
		initializeAccordion(accordion);
		const headers = accordion.querySelectorAll("h3");
		expect(headers[0].getAttribute("aria-expanded")).toBe("true");
		expect(headers[1].getAttribute("aria-expanded")).toBeNull();
	});
});
