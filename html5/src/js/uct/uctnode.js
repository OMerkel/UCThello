//
// Copyright (c) 2016-2026 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

function UctNode(parentNode, board, action) {
	this.action = action;
	this.parentNode = parentNode;
	this.children = [];
	this.wins = 0;
	this.visits = 0;
	this.unexamined = board.getActions();
	this.activePlayer = board.active;
}

UctNode.prototype.addChild = function (board, index) {
	const node = new UctNode(this, board, this.unexamined[index]);
	this.unexamined.splice(index, 1);
	this.children[this.children.length] = node;
	return node;
};

UctNode.prototype.selectChild = function () {
	let selected = null;
	let bestValue = Number.NEGATIVE_INFINITY;
	for (let i = 0; i < this.children.length; ++i) {
		const child = this.children[i];
		const uctValue =
			child.wins / child.visits +
			Math.sqrt((2 * Math.log(this.visits)) / child.visits);
		if (uctValue > bestValue) {
			selected = child;
			bestValue = uctValue;
		}
	}
	return selected;
};

UctNode.prototype.update = function (result) {
	++this.visits;
	this.wins += result[this.activePlayer];
};

UctNode.prototype.mostVisitedChild = function () {
	/*
    for(var i=0; i<this.children.length; ++i) {
      console.log(String.fromCharCode(97+this.children[i].action.x) +
        (this.children[i].action.y+1) + ' (' + this.children[i].wins +
        '/' + this.children[i].visits + ')');
    }
   */

	let mostVisited = this.children[0];
	for (let i = 1; i < this.children.length; ++i) {
		if (this.children[i].visits > mostVisited.visits) {
			mostVisited = this.children[i];
		}
	}
	return mostVisited;
};
