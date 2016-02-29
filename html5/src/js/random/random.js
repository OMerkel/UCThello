//
// Copyright (c) 2016 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

function Random() {}

Random.prototype.getActionInfo = function ( board, verbose ) {
  var startTime = (new Date()).getTime();
  var actions = board.getActions();
  var nodesVisted = 1;
  var duration = (new Date()).getTime() - startTime;
  return { action : actions[Math.floor(Math.random() * actions.length)],
    info: 'Random select out of ' + actions.length + ' available actions.' };
};
