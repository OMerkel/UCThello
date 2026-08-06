import { beforeEach, describe, expect, it, vi } from "vitest";

import { Hmi, mountHmi } from "../js/hmi.js";

function makeSquares(value = 2) {
	const square = [];
	for (let x = 0; x < 8; ++x) {
		square[x] = [];
		for (let y = 0; y < 8; ++y) {
			square[x][y] = value;
		}
	}
	return square;
}

function baseBoard(overrides = {}) {
	return {
		square: makeSquares(),
		count: [2, 2],
		actions: [{ type: "set", x: 2, y: 3 }],
		previous: { type: "none" },
		turn: 1,
		ply: 1,
		nextishuman: true,
		...overrides,
	};
}

function createDom() {
	document.body.innerHTML = `
		<div id='tabs'>
			<ul>
				<li><a href='#tabs-board'>Board</a></li>
				<li><a href='#tabs-options'>Options</a></li>
				<li><a href='#tabs-about'>About</a></li>
			</ul>
			<div id='tabs-board'>
				<table><tbody id='innerboard'></tbody></table>
				<div id='status'></div>
				<button id='new' type='button'>New</button>
			</div>
			<div id='tabs-options'>Options</div>
			<div id='tabs-about'>
				<div id='accordion'>
					<h3>Rules</h3><div>Rules</div>
					<h3>Legal</h3><div>Legal</div>
				</div>
			</div>
		</div>
		<input id='showavailablemove' type='radio' checked>
		<input id='hideavailablemove' type='radio'>
		<input id='playerwhiteai' type='radio'>
		<input id='playerblackai' type='radio'>
		<input id='nomovepass' type='radio' checked>
	`;
}

describe("Hmi", () => {
	beforeEach(() => {
		createDom();
		vi.restoreAllMocks();
	});

	// REQ: FR-001, FR-008, FR-009, FR-010, FR-012, NFR-003, NFR-004, NFR-006
	it("initializes board, widgets, resize and worker start message", () => {
		const workerInstances = [];
		globalThis.Worker = class {
			constructor(url) {
				this.url = url;
				this.messages = [];
				workerInstances.push(this);
			}
			addEventListener() {}
			postMessage(msg) {
				this.messages.push(msg);
			}
		};

		mountHmi();
		const fields = document.querySelectorAll("#innerboard td");
		expect(fields.length).toBe(64);
		expect(document.querySelector("#tabs > ul").getAttribute("role")).toBe(
			"tablist",
		);
		expect(
			document.querySelector("#accordion > h3").getAttribute("aria-expanded"),
		).toBe("true");
		expect(workerInstances.length).toBe(1);
		expect(workerInstances[0].url).toBe("js/controller.js");
		expect(workerInstances[0].messages[0]).toMatchObject({
			class: "request",
			request: "start",
			playerwhite: "Human",
			playerblack: "Human",
			passingallowed: true,
		});
	});

	// REQ: FR-004, FR-007, FR-008, FR-013, NFR-003, NFR-006
	it("computes settings and posts perform/actionbyai/restart/pass", () => {
		const hmi = new Hmi();
		hmi.engine = { postMessage: vi.fn() };
		hmi.board = baseBoard({
			actions: [{ type: "set", x: 1, y: 1 }, { type: "pass" }],
		});
		document.getElementById("playerwhiteai").checked = true;
		document.getElementById("playerblackai").checked = true;
		hmi.send({ type: "set", x: 1, y: 2 });
		hmi.requestAiAction();
		hmi.restart();
		hmi.pass();

		expect(hmi.engine.postMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				request: "perform",
				playerwhite: "AI",
				playerblack: "AI",
				passingallowed: true,
			}),
		);
		expect(hmi.engine.postMessage).toHaveBeenCalledWith(
			expect.objectContaining({ request: "actionbyai" }),
		);
		expect(hmi.engine.postMessage).toHaveBeenCalledWith(
			expect.objectContaining({ request: "restart" }),
		);
	});

	// REQ: FR-003, FR-005, FR-008, NFR-003, NFR-006
	it("handles human move preparation, click and deactivation", () => {
		const hmi = new Hmi();
		hmi.engine = { postMessage: vi.fn() };
		hmi.buildBoard();
		const board = baseBoard({ actions: [{ type: "set", x: 0, y: 0 }] });
		hmi.board = board;

		hmi.prepareHumanMove(board);
		const field = document.getElementById("fielda1");
		expect(field.innerHTML).toContain("marker");

		field.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(hmi.engine.postMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				request: "perform",
				action: { type: "set", x: 0, y: 0 },
			}),
		);

		document.getElementById("showavailablemove").checked = false;
		document.getElementById("hideavailablemove").checked = true;
		hmi.prepareHumanMove(board);
		expect(field.innerHTML).toBe("&nbsp;");
		hmi.deactivateClicks();
		hmi.board = null;
		hmi.deactivateClicks();
	});

	// REQ: FR-002, FR-006, FR-013, NFR-003, NFR-004, NFR-006
	it("updates status and follows update branches", () => {
		vi.useFakeTimers();
		const hmi = new Hmi();
		hmi.buildBoard();
		hmi.engine = { postMessage: vi.fn() };
		const prepareSpy = vi.spyOn(hmi, "prepareHumanMove");
		const aiSpy = vi.spyOn(hmi, "requestAiAction");
		const passSpy = vi.spyOn(hmi, "pass");

		hmi.update(baseBoard({ nextishuman: true }), null);
		expect(prepareSpy).toHaveBeenCalled();
		expect(document.getElementById("status").innerHTML).toContain("to play.");

		hmi.update(baseBoard({ nextishuman: false }), null);
		expect(aiSpy).toHaveBeenCalled();

		hmi.update(
			baseBoard({ actions: [{ type: "pass" }], nextishuman: false }),
			null,
		);
		vi.advanceTimersByTime(2500);
		expect(passSpy).toHaveBeenCalled();
		vi.useRealTimers();
	});

	// REQ: FR-002, FR-003, FR-008, NFR-003, NFR-006
	it("handles missing DOM nodes and no-op update branches", () => {
		const hmi = new Hmi();
		hmi.engine = { postMessage: vi.fn() };

		document.getElementById("status").remove();
		hmi.renderStatus(baseBoard(), null);
		hmi.buildBoard();
		document.getElementById("fielda1").remove();

		const boardWithMissingField = baseBoard({
			actions: [{ type: "set", x: 99, y: 99 }],
		});
		hmi.prepareHumanMove(boardWithMissingField);

		hmi.board = {
			...baseBoard(),
			actions: [{ type: "pass" }, { type: "set", x: 99, y: 99 }],
		};
		hmi.deactivateClicks();

		const aiSpy = vi.spyOn(hmi, "requestAiAction");
		const prepareSpy = vi.spyOn(hmi, "prepareHumanMove");
		hmi.update(baseBoard({ nextishuman: false, actions: [] }), null);
		expect(aiSpy).not.toHaveBeenCalled();
		expect(prepareSpy).not.toHaveBeenCalled();

		globalThis.Worker = class {
			addEventListener() {}
			postMessage() {}
		};
		document.getElementById("tabs").remove();
		hmi.init();
	});

	// REQ: FR-007, FR-012, NFR-003, NFR-006
	it("renders resize styles and binds new game click handler", () => {
		const workerInstances = [];
		globalThis.Worker = class {
			constructor() {
				this.messages = [];
				workerInstances.push(this);
			}
			addEventListener() {}
			postMessage(msg) {
				this.messages.push(msg);
			}
		};

		const hmi = new Hmi();
		hmi.buildBoard();
		document
			.getElementById("innerboard")
			.insertAdjacentHTML(
				"beforebegin",
				"<div class='annotation column'></div><div class='annotation row'></div>",
			);

		hmi.resize();
		const column = document.querySelector(".annotation.column");
		const row = document.querySelector(".annotation.row");
		const anyField = document.querySelector("#innerboard td");
		expect(column.style.width).toMatch(/px$/);
		expect(row.style.height).toMatch(/px$/);
		expect(anyField.style.width).toMatch(/px$/);

		hmi.init();
		document.getElementById("new").click();
		expect(workerInstances[0].messages).toEqual(
			expect.arrayContaining([expect.objectContaining({ request: "restart" })]),
		);
	});

	// REQ: FR-008, NFR-003, NFR-006
	it("routes engine events and logs unknown events", () => {
		const hmi = new Hmi();
		const updateSpy = vi.spyOn(hmi, "update").mockImplementation(() => {});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		hmi.engineEventListener({
			data: { eventClass: "response", state: "message", message: "ok" },
		});
		hmi.engineEventListener({
			data: { eventClass: "response", state: "other" },
		});
		hmi.engineEventListener({
			data: {
				eventClass: "request",
				request: "redraw",
				board: baseBoard(),
				actioninfo: null,
			},
		});
		hmi.engineEventListener({
			data: { eventClass: "request", request: "other" },
		});
		hmi.engineEventListener({ data: { eventClass: "unknown" } });

		expect(updateSpy).toHaveBeenCalled();
		expect(logSpy).toHaveBeenCalledWith("Engine reported unknown state");
		expect(logSpy).toHaveBeenCalledWith("Engine used unknown request");
		expect(logSpy).toHaveBeenCalledWith("Engine used unknown event class");
	});
});
