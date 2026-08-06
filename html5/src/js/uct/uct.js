//
// Copyright (c) 2016-2026 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

function Uct() {}

Uct.prototype.getActionInfo = (board, maxIterations, maxTime, _verbose) => {
	const root = new UctNode(null, board, null);
	const startTime = Date.now();
	const timeLimit = startTime + maxTime;
	const blockSize = 50;
	let nodesVisted = 0;
	for (
		let iterations = 0;
		iterations < maxIterations && Date.now() < timeLimit;
		iterations += blockSize
	) {
		for (let i = 0; i < blockSize; ++i) {
			let node = root;
			const variantBoard = board.copy();
			/* Selection */
			while (node.unexamined.length === 0 && node.children.length > 0) {
				node = node.selectChild();
				variantBoard.doAction(node.action);
			}
			/* Expansion */
			if (node.unexamined.length > 0) {
				const j = Math.floor(Math.random() * node.unexamined.length);
				variantBoard.doAction(node.unexamined[j]);
				node = node.addChild(variantBoard, j);
			}
			/* Simulation */
			let actions = variantBoard.getActions();
			while (actions.length > 0) {
				variantBoard.doAction(
					actions[Math.floor(Math.random() * actions.length)],
				);
				++nodesVisted;
				actions = variantBoard.getActions();
			}
			/* Backpropagation */
			const result = variantBoard.getResult();
			while (node) {
				node.update(result);
				node = node.parentNode;
			}
		}
	}
	const duration = Date.now() - startTime;

	return {
		action: root.mostVisitedChild().action,
		info: `${Math.floor((nodesVisted * 1000.0) / duration)} nodes/sec examined.`,
	};
};
