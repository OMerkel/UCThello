//
// Copyright (c) 2016 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

importScripts('board.js');
importScripts('uct/uctnode.js');
importScripts('uct/uct.js');
importScripts('random/random.js');

function Controller() {
  this.board = new OthelloBoard();
  this.board.setup(8);
  this.uct = new Uct();
  this.random = new Random();
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
    case 'actionbyai':
      this.updateSettings( data );
      var actionInfo = 1 == this.board.ply ?
        this.random.getActionInfo( this.board, false ) :
        this.uct.getActionInfo( this.board, 32000, 8000, false );
      this.board.doAction( actionInfo.action );
      this.draw( data, actionInfo );
      break;
    case 'perform':
      this.updateSettings( data );
      this.board.doAction( data.action );
      this.draw( data, null );
      break;
    case 'start':
      this.draw( data, null );
      break;
    case 'restart':
      this.restart();
      this.draw( data, null );
      break;
    default:
      console.log('Hmi used unknown request');
  }
};

Controller.prototype.updateSettings = function( data ) {
  this.board.rules.passingAllowed = data.passingallowed;
};

Controller.prototype.restart = function() {
  this.board.setup(8);
};

Controller.prototype.draw = function( data, actionInfo ) {
  var board = this.board.getState();
  board.nextishuman = ( board.turn == 1 ? data.playerblack :
    data.playerwhite ) == 'Human' &&
    board.actions.length > 0 && board.actions[0].type == 'set';
  self.postMessage( { eventClass: 'request',
    request: 'redraw', board: board, actioninfo: actionInfo } );
};

Controller.prototype.init = function() {
  addEventListener('message', this.hmiEventListener.bind( this ), false);
};

(new Controller()).init();
