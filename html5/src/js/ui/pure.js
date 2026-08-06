const PLAYER_NAME = ["White", "Black"];

export function calculateSquareSize(viewport, boardEdgeOffset, boardWidth) {
	const availableHeight = viewport.innerHeight - boardEdgeOffset;
	const availableWidth = viewport.innerWidth - boardEdgeOffset;
	const side = Math.min(availableHeight, availableWidth);
	return side / boardWidth;
}

export function isMustPass(board) {
	return board.actions.length === 1 && board.actions[0].type === "pass";
}

export function fieldIdFromCoordinates(x, y) {
	return `field${String.fromCharCode(97 + x)}${y + 1}`;
}

export function parseMoveFromFieldId(fieldId) {
	return {
		type: "set",
		x: fieldId[5].charCodeAt(0) - 97,
		y: Number(fieldId[6]) - 1,
	};
}

function formatPreviousAction(board) {
	if (board.previous.type === "none") {
		return "";
	}

	const previousActionPlayer = PLAYER_NAME[board.previous.by];
	const pos =
		String.fromCharCode(97 + board.previous.x) + (board.previous.y + 1);
	const moveMarker =
		previousActionPlayer === "Black" ? `${pos}&#8230;` : `&#8230;${pos}`;

	return board.previous.type === "pass"
		? `<br />${board.ply >> 1}. ${previousActionPlayer} passed.`
		: `<br />${board.ply >> 1}. ${moveMarker} by ${previousActionPlayer} flipping ${board.previous.flip.length} checkers.`;
}

export function buildStatusHtml(board, actionInfo) {
	const statusHead = `(B: ${board.count[1]} / W: ${board.count[0]}) `;
	const turnInfo =
		board.actions.length === 0
			? "Game over."
			: `${PLAYER_NAME[board.turn]}${isMustPass(board) ? " must pass this turn!" : " to play."}`;
	const previous = formatPreviousAction(board);
	const info = actionInfo ? `<br />${actionInfo.info}` : "";

	return `${statusHead}${turnInfo}${previous}${info}`;
}

export function buildBoardMarkup(size) {
	let html = "";
	for (let y = 0; y < size; ++y) {
		html += "<tr>";
		for (let x = 0; x < size; ++x) {
			html += `<td id='${fieldIdFromCoordinates(x, y)}' class='green square'>&nbsp;</td>`;
		}
		html += "</tr>";
	}
	return html;
}
