//
// Copyright (c) 2016-2026 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

function Random() {}

Random.prototype.getActionInfo = (board, _verbose) => {
	var startTime = Date.now();
	var actions = board.getActions();
	var _nodesVisted = 1;
	var _duration = Date.now() - startTime;
	return {
		action: actions[Math.floor(Math.random() * actions.length)],
		info: `Random select out of ${actions.length} available actions.`,
	};
};
