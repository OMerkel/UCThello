//
// Copyright (c) 2016 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

importScripts('board.js');
importScripts('uct/uctnode.js');
importScripts('uct/uct.js');

function Controller() {
  this.board = new OthelloBoard();
  this.board.setup(8);
  this.engine = new Uct();
}

Controller.prototype.hmiEventListener = function( eventReceived ) {
  var data = eventReceived.data;
  switch (data.class) {
    case 'response':
      this.processHmiResponse( eventReceived );
      break;
    case 'request':
      this.processHmiRequest( eventReceived );
      break;
    default:
      console.log('Hmi used unknown event class');
  }
};

Controller.prototype.processHmiResponse = function( eventReceived ) {
  var data = eventReceived.data;
  switch (data.state) {
    default:
      console.log('Hmi reported unknown state');
  }
};

Controller.prototype.processHmiRequest = function( eventReceived ) {
  var data = eventReceived.data;
  switch (data.request) {
    case 'movebyai':
      this.updateSettings( data );
      var move = this.engine.getMostVisitedMove( this.board, 4000, false );
      this.board.doMove( move );
      this.draw( data );
      break;
    case 'move':
      this.updateSettings( data );
      this.board.doMove( data.move );
      this.draw( data );
      break;
    case 'start':
      this.start();
      this.draw( data );
      break;
    case 'restart':
      this.restart();
      this.draw( data );
      break;
    default:
      console.log('Hmi used unknown request');
  }
};

Controller.prototype.updateSettings = function( data ) {
  this.board.rules.passingAllowed = data.passingallowed;
};

Controller.prototype.start = function() {
};

Controller.prototype.restart = function() {
  this.board.setup(8);
};

Controller.prototype.draw = function( data ) {
  var board = this.board.getState();
  board.nextishuman = ( board.turn == 1 ? data.playerblack :
    data.playerwhite ) == 'Human' &&
    board.moves.length > 0 && board.moves[0].type == 'set';
  self.postMessage( { eventClass: 'request',
    request: 'redraw', board: board } );
};

Controller.prototype.init = function() {
  addEventListener('message', this.hmiEventListener.bind( this ), false);
};

(new Controller()).init();
