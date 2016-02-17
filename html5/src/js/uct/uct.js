//
// Copyright (c) 2016 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

function Uct() {}

Uct.prototype.getMoveInfo = function ( board, maxIterations, maxTime, verbose ) {
  var root = new UctNode(null, board, null);
  var startTime = (new Date()).getTime();
  var timeLimit = startTime + maxTime;
  var blockSize = 50;
  var nodesVisted = 0;
  for(var iterations=0; iterations<maxIterations &&
    (new Date()).getTime()<timeLimit; iterations+=blockSize) {
    for(var i=0; i<blockSize; ++i) {
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
        ++nodesVisted;
      }
      /* Backpropagation */
      var result = variantBoard.getResult();
      while(node) {
        node.update(result);
        node = node.parentNode;
      }
    }
  }
  var duration = (new Date()).getTime() - startTime;
  
  return { mostvisited : root.mostVisitedChild().move,
    nodespersecond : nodesVisted / duration * 1000 };
};
