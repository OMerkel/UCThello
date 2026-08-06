/**
 * @file hmi.js
 * @author Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * @date 2016 February 12
 *
 * @section LICENSE
 *
 * Copyright 2016-2026, Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * All rights reserved.
 *
 * Released under the MIT license.
 *
 * @section DESCRIPTION
 *
 * @brief Class Hmi.
 *
 * Class representing the view or Hmi of UCThello. UCThello is a board game
 * using Monte Carlo Tree Search (MCTS) with UCB (Upper Confidence Bounds)
 * applied to trees (UCT in short) for the computer player AI.
 */

import {
	buildBoardMarkup,
	buildStatusHtml,
	calculateSquareSize,
	fieldIdFromCoordinates,
	isMustPass,
	parseMoveFromFieldId,
} from "./ui/pure.js";
import { initializeAccordion, initializeTabs } from "./ui/widgets.js";

export class Hmi {
	constructor() {
		this.emptySquare = "&nbsp;";
		this.validMove = "<div class='black checker marker'>&nbsp;</div>";
		this.whiteChecker = "<div class='white checker'>&nbsp;</div>";
		this.blackChecker = "<div class='black checker'>&nbsp;</div>";
		this.checker = [this.whiteChecker, this.blackChecker, this.emptySquare];

		this.boardWidth = 8;
		this.boardEdgeOffset = 138;

		this.boundResize = this.resize.bind(this);
		this.boundRestart = this.restart.bind(this);
		this.boundClickHandler = this.clickHandler.bind(this);
	}

	resize() {
		const size = calculateSquareSize(
			window,
			this.boardEdgeOffset,
			this.boardWidth,
		);
		const columns = document.querySelectorAll(".annotation.column");
		const rows = document.querySelectorAll(".annotation.row");
		const fields = document.querySelectorAll("#innerboard td");

		for (const column of columns) {
			column.style.width = `${size}px`;
		}
		for (const row of rows) {
			row.style.height = `${size}px`;
		}
		for (const field of fields) {
			field.style.minWidth = `${size}px`;
			field.style.minHeight = `${size}px`;
			field.style.width = `${size}px`;
			field.style.height = `${size}px`;
		}
	}

	renderStatus(board, actionInfo) {
		const status = document.getElementById("status");
		if (status) {
			status.innerHTML = buildStatusHtml(board, actionInfo);
		}
	}

	update(board, actionInfo) {
		this.board = board;
		for (let y = 0; y < this.boardWidth; ++y) {
			for (let x = 0; x < this.boardWidth; ++x) {
				const field = document.getElementById(fieldIdFromCoordinates(x, y));
				if (field) {
					field.innerHTML = this.checker[board.square[x][y]];
				}
			}
		}

		this.renderStatus(board, actionInfo);
		this.resize();

		if (isMustPass(board)) {
			setTimeout(this.pass.bind(this), 2500);
		} else if (board.nextishuman) {
			this.prepareHumanMove(board);
		} else if (!board.nextishuman && board.actions.length > 0) {
			this.requestAiAction();
		}
	}

	prepareHumanMove(board) {
		const showAvailableMove =
			document.getElementById("showavailablemove")?.checked;
		for (const action of board.actions) {
			const field = document.getElementById(
				fieldIdFromCoordinates(action.x, action.y),
			);
			if (!field) {
				continue;
			}
			field.innerHTML = showAvailableMove ? this.validMove : this.emptySquare;
			field.addEventListener("click", this.boundClickHandler);
		}
	}

	requestAiAction() {
		this.engine.postMessage({
			class: "request",
			request: "actionbyai",
			...this.getSettings(),
		});
	}

	deactivateClicks() {
		if (!this.board) {
			return;
		}
		for (const action of this.board.actions) {
			if (action.type !== "set") {
				continue;
			}
			const field = document.getElementById(
				fieldIdFromCoordinates(action.x, action.y),
			);
			if (!field) {
				continue;
			}
			field.innerHTML = this.emptySquare;
			field.removeEventListener("click", this.boundClickHandler);
		}
	}

	clickHandler(event) {
		this.deactivateClicks();
		const move = parseMoveFromFieldId(event.currentTarget.id);
		this.send(move);
	}

	pass() {
		this.send({ type: "pass" });
	}

	send(action) {
		this.engine.postMessage({
			class: "request",
			request: "perform",
			action,
			...this.getSettings(),
		});
	}

	getSettings() {
		const playerWhite = document.getElementById("playerwhiteai")?.checked
			? "AI"
			: "Human";
		const playerBlack = document.getElementById("playerblackai")?.checked
			? "AI"
			: "Human";
		const passingAllowed = Boolean(
			document.getElementById("nomovepass")?.checked,
		);

		return {
			playerwhite: playerWhite,
			playerblack: playerBlack,
			passingallowed: passingAllowed,
		};
	}

	engineInit() {
		this.engine = new Worker("js/controller.js");
		this.engine.addEventListener(
			"message",
			this.engineEventListener.bind(this),
			false,
		);
		this.engine.postMessage({
			class: "request",
			request: "start",
			...this.getSettings(),
		});
	}

	init() {
		this.buildBoard();

		const tabs = document.getElementById("tabs");
		if (tabs) {
			initializeTabs(tabs);
		}

		const accordion = document.getElementById("accordion");
		if (accordion) {
			initializeAccordion(accordion);
		}

		window.addEventListener("resize", this.boundResize);
		this.resize();
		this.engineInit();

		const newGameButton = document.getElementById("new");
		if (newGameButton) {
			newGameButton.addEventListener("click", this.boundRestart);
		}
	}

	buildBoard() {
		const innerBoard = document.getElementById("innerboard");
		if (innerBoard) {
			innerBoard.innerHTML = buildBoardMarkup(this.boardWidth);
		}
	}

	restart() {
		this.deactivateClicks();
		this.engine.postMessage({
			class: "request",
			request: "restart",
			...this.getSettings(),
		});
	}

	engineEventListener(eventReceived) {
		const data = eventReceived.data;
		switch (data.eventClass) {
			case "response":
				this.processEngineResponse(eventReceived);
				break;
			case "request":
				this.processEngineRequest(eventReceived);
				break;
			default:
				console.log("Engine used unknown event class");
		}
	}

	processEngineResponse(eventReceived) {
		const data = eventReceived.data;
		switch (data.state) {
			case "message":
				console.log(`Engine reported message: ${data.message}`);
				break;
			default:
				console.log("Engine reported unknown state");
		}
	}

	processEngineRequest(eventReceived) {
		const data = eventReceived.data;
		switch (data.request) {
			case "redraw":
				console.log(`Engine request: ${data.request}`);
				this.update(data.board, data.actioninfo);
				break;
			default:
				console.log("Engine used unknown request");
		}
	}
}

export function mountHmi() {
	new Hmi().init();
}

if (typeof document !== "undefined") {
	document.addEventListener("DOMContentLoaded", () => {
		mountHmi();
	});
}
