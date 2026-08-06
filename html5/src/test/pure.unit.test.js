import { describe, expect, it } from "vitest";

import {
	buildBoardMarkup,
	buildStatusHtml,
	calculateSquareSize,
	fieldIdFromCoordinates,
	isMustPass,
	parseMoveFromFieldId,
} from "../js/ui/pure.js";

describe("pure ui helpers", () => {
	// REQ: FR-012, NFR-002, NFR-006
	it("calculates square size from the smaller viewport side", () => {
		const size = calculateSquareSize(
			{ innerHeight: 900, innerWidth: 500 },
			100,
			8,
		);
		expect(size).toBe(50);
	});

	// REQ: FR-006, NFR-002, NFR-006
	it("detects pass-only move lists", () => {
		expect(isMustPass({ actions: [{ type: "pass" }] })).toBe(true);
		expect(
			isMustPass({ actions: [{ type: "set", x: 0, y: 0 }, { type: "pass" }] }),
		).toBe(false);
	});

	// REQ: FR-001, FR-003, NFR-002, NFR-006
	it("maps board coordinates to field ids and back", () => {
		expect(fieldIdFromCoordinates(2, 5)).toBe("fieldc6");
		expect(parseMoveFromFieldId("fieldh8")).toEqual({
			type: "set",
			x: 7,
			y: 7,
		});
	});

	// REQ: FR-002, NFR-002, NFR-006
	it("builds status for active play and game over", () => {
		const activeBoard = {
			count: [2, 4],
			actions: [{ type: "set", x: 2, y: 3 }],
			turn: 1,
			previous: { type: "none" },
			ply: 1,
		};

		const overBoard = {
			count: [33, 31],
			actions: [],
			turn: 0,
			previous: { type: "none" },
			ply: 50,
		};

		expect(buildStatusHtml(activeBoard, null)).toContain("Black to play.");
		expect(buildStatusHtml(overBoard, null)).toContain("Game over.");
	});

	// REQ: FR-002, FR-006, NFR-002, NFR-006
	it("formats previous pass and set actions and appends action info", () => {
		const passBoard = {
			count: [10, 12],
			actions: [{ type: "pass" }],
			turn: 0,
			previous: { type: "pass", by: 1, x: 0, y: 0, flip: [] },
			ply: 8,
		};
		const setBoardWhite = {
			count: [12, 10],
			actions: [{ type: "set", x: 0, y: 0 }],
			turn: 1,
			previous: {
				type: "set",
				by: 0,
				x: 2,
				y: 3,
				flip: [
					{ x: 3, y: 3 },
					{ x: 4, y: 3 },
				],
			},
			ply: 10,
		};
		const setBoardBlack = {
			count: [12, 10],
			actions: [{ type: "set", x: 0, y: 0 }],
			turn: 1,
			previous: {
				type: "set",
				by: 1,
				x: 5,
				y: 2,
				flip: [{ x: 4, y: 2 }],
			},
			ply: 12,
		};

		const passStatus = buildStatusHtml(passBoard, null);
		expect(passStatus).toContain("must pass this turn!");
		expect(passStatus).toContain("Black passed.");

		const whiteStatus = buildStatusHtml(setBoardWhite, {
			info: "UCT chose c4",
		});
		expect(whiteStatus).toContain("&#8230;c4 by White flipping 2 checkers.");
		expect(whiteStatus).toContain("UCT chose c4");

		const blackStatus = buildStatusHtml(setBoardBlack, null);
		expect(blackStatus).toContain("f3&#8230; by Black flipping 1 checkers.");
	});

	// REQ: FR-001, NFR-002, NFR-006
	it("builds full board markup for all fields", () => {
		const html = buildBoardMarkup(8);
		expect((html.match(/<td /g) || []).length).toBe(64);
		expect(html).toContain("id='fielda1'");
		expect(html).toContain("id='fieldh8'");
	});
});
