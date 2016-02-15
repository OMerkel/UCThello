//
// Copyright (c) 2016 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

function Uct() {}

Uct.prototype.getMostVisitedMove = function ( board, iterations, verbose ) {
  var root = new UctNode(null, board, null);

  for(var i=0; i<iterations; ++i) {
    var node = root;
    var variantBoard = board.copy();
    /* Selection */
    while (node.unexamined.length == 0 && node.children.length > 0) {
      node = node.selectChild();
      variantBoard.doMove(node.move);
    }
    /* Expansion */
    if (node.unexamined.length > 0) {
      var j = Math.floor(Math.random() * node.unexamined.length);
      variantBoard.doMove(node.unexamined[j]);
      node = node.addChild(variantBoard, j);
    }
    /* Simulation */
    while(variantBoard.getMoves().length > 0) {
      var ml = variantBoard.getMoves();
      variantBoard.doMove(ml[Math.floor(Math.random() * ml.length)]);
    }
    /* Backpropagation */
    var result = variantBoard.getResult();
    while(node) {
      node.update(result[node.activePlayer]);
      node = node.parentNode;
    }
  }
  return root.mostVisitedChild().move;
};
