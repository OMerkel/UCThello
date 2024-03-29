/**
 * @file hmi.js
 * @author Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * @date 2016 February 12
 *
 * @section LICENSE
 *
 * Copyright 2016, Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
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
 * The board game used for demonstration of the UCT algorithm is close to
 * a game named Othello depending on selected options. In fact it can be
 * played depending on your configuration following the official tournament
 * rules of the WOF - World Othello Federation - if intended. Other rule
 * settings to play variants are available, too.
 *
 */

function Hmi() {
  this.emptySquare = '&nbsp;'
  this.validMove = "<div class='black checker marker'>&nbsp;</div>";
  this.whiteChecker = "<div class='white checker'>&nbsp;</div>";
  this.blackChecker = "<div class='black checker'>&nbsp;</div>";
  this.checker = [ this.whiteChecker, this.blackChecker, this.emptySquare ];
}

Hmi.prototype.resize = function() {
  var $window = $(window);
  var offset_h=138;
  var wh = window.innerHeight-offset_h;
  var ww = window.innerWidth-offset_h;
  var tmp = wh<ww ? wh : ww;
  var size = tmp / 8;
  var annotation = $('.annotation');
  annotation.filter('.column').css( { width: size + 'px', } );
  annotation.filter('.row').css( { height: size + 'px', } );
  $("#innerboard").children().children().filter('td').css( {
    'min-width': size + 'px',
    'min-height': size + 'px',
    'width': size + 'px',
    'height': size + 'px',
  } );
};

Hmi.prototype.mustPass = function(board) {
  return 1 == board.actions.length && board.actions[0].type == 'pass';
};

Hmi.prototype.renderStatus = function(board, actionInfo) {
  var status = '(B: ' + board.count[1] + ' / W: ' + board.count[0] + ') ';
  status += 0 == board.actions.length ? 'Game over.' :
    ( ( 0 == board.turn ? 'White' : 'Black' ) +
    ( this.mustPass(board) ? ' must pass this turn!' : " to play." ) );
  if (board.previous.type != 'none') {
    var previousActionPlayer = ( 0 == board.previous.by ? 'White' : 'Black' );
    var pos = String.fromCharCode(97+board.previous.x) + (board.previous.y+1);
    status += '<br />' + ( board.ply >> 1 ) + '. ' +
      ( board.previous.type == 'pass' ? ( previousActionPlayer + ' passed.' ) :
      ( 'Black' == previousActionPlayer ? pos + '&#8230;' : '&#8230;' + pos ) +
      ' by ' + previousActionPlayer + ' flipping ' + board.previous.flip.length + ' checkers.');
  }
  if (actionInfo) {
    status += '<br />' + actionInfo.info;
  }
  $('#status').html(status);
};

Hmi.prototype.update = function(board, actionInfo) {
  this.board = board;
  for(var y=0; y<8; ++y) {
    for(var x=0; x<8; ++x) {
      $('#field' + String.fromCharCode(97+x) +
        (y+1)).html( this.checker[board.square[x][y]] );
    }
  }
  this.renderStatus(board, actionInfo);
  this.resize();
  if( this.mustPass(board) ) {
    setTimeout( this.pass.bind(this), 2500 );
  } else if( board.nextishuman ) {
    this.prepareHumanMove(board);
  } else if ( !board.nextishuman && 0 < board.actions.length ) {
    this.requestAiAction(board);
  }
};

Hmi.prototype.prepareHumanMove = function ( board ) {
  var showAvailableMove = $('#showavailablemove').is(':checked');
  for(var i=0; i<board.actions.length; ++i) {
    var field = '#field' + String.fromCharCode(97+board.actions[i].x) +
      (board.actions[i].y+1);
    $(field).html(showAvailableMove ? this.validMove : this.emptySquare);
    $(field).on( 'click', this.clickHandler.bind(this) );
  }
};

Hmi.prototype.requestAiAction = function ( board ) {
  // console.log('AI ' + board.turn + ' to move next!');
  /* @TODO: disable 'new game' */
  var playerWhite = $('#playerwhiteai').is(':checked') ? 'AI' : 'Human';
  var playerBlack = $('#playerblackai').is(':checked') ? 'AI' : 'Human';
  var passingAllowed = $('#nomovepass').is(':checked');
  this.engine.postMessage({ class: 'request', request: 'actionbyai',
    playerwhite: playerWhite, playerblack: playerBlack,
    passingallowed: passingAllowed });
};

Hmi.prototype.deactivateClicks = function () {
  for(var i=0; i<this.board.actions.length; ++i) {
    var field = '#field' + String.fromCharCode(97+this.board.actions[i].x) +
      (this.board.actions[i].y+1)
    $(field).html(this.emptySquare);
    $(field).off( 'click' );
  }
};

Hmi.prototype.clickHandler = function( event ) {
  this.deactivateClicks();
  var move = { type: 'set', x: (event.currentTarget.id[5].charCodeAt(0)-97),
    y: (Number(event.currentTarget.id[6])-1) };
  this.send( move );
};

Hmi.prototype.pass = function () {
  var pass = { type: 'pass' };
  this.send( pass );
};

Hmi.prototype.send = function ( action ) {
  var playerWhite = $('#playerwhiteai').is(':checked') ? 'AI' : 'Human';
  var playerBlack = $('#playerblackai').is(':checked') ? 'AI' : 'Human';
  var passingAllowed = $('#nomovepass').is(':checked');
  this.engine.postMessage({ class: 'request',
    request: 'perform', action: action,
    playerwhite: playerWhite, playerblack: playerBlack,
    passingallowed: passingAllowed });
};

Hmi.prototype.engineInit = function() {
  var playerWhite = $('#playerwhiteai').is(':checked') ? 'AI' : 'Human';
  var playerBlack = $('#playerblackai').is(':checked') ? 'AI' : 'Human';
  var passingAllowed = $('#nomovepass').is(':checked');

  this.engine = new Worker('js/controller.js');
  this.engine.addEventListener('message', this.engineEventListener.bind(this), false);
  this.engine.postMessage({ class: 'request', request: 'start',
    playerwhite: playerWhite, playerblack: playerBlack,
    passingallowed: passingAllowed });
};

Hmi.prototype.init = function() {
  this.buildBoard();
  var $window = $(window);
  $window.resize( this.resize.bind(this) );
  $window.resize();
  this.engineInit();
  $('#new').on( 'click', this.restart.bind(this) );
};

Hmi.prototype.buildBoard = function() {
  var html = '';
  for(var y=0; y<8; ++y) {
    html += '<tr>';
    for(var x=0; x<8; ++x) {
      html +="<td id='field" +
        String.fromCharCode(97+x) + (y+1) +
        /* "' class='" + ( 0 == ((x+y) % 2) ? "buff" : "green" ) + */
        "' class='green" +
        " square'>&nbsp;</td>";
    }
    html += '</tr>';
  }
  $("#innerboard").html(html);
};

Hmi.prototype.restart = function() {
  this.deactivateClicks();
  var playerWhite = $('#playerwhiteai').is(':checked') ? 'AI' : 'Human';
  var playerBlack = $('#playerblackai').is(':checked') ? 'AI' : 'Human';
  var passingAllowed = $('#nomovepass').is(':checked');

  this.engine.postMessage({ class: 'request', request: 'restart',
    playerwhite: playerWhite, playerblack: playerBlack,
    passingallowed: passingAllowed });
  $( '#left-panel' ).panel( 'close' );
};

Hmi.prototype.engineEventListener = function( eventReceived ) {
  var data = eventReceived.data;
  switch (data.eventClass) {
    case 'response':
      this.processEngineResponse( eventReceived );
      break;
    case 'request':
      this.processEngineRequest( eventReceived );
      break;
    default:
      console.log('Engine used unknown event class');
  }
};

Hmi.prototype.processEngineResponse = function( eventReceived ) {
  var data = eventReceived.data;
  switch (data.state) {
    case 'message':
      console.log('Engine reported message: ' + data.message);
      break;
    default:
      console.log('Engine reported unknown state');
  }
};

Hmi.prototype.processEngineRequest = function( eventReceived ) {
  var data = eventReceived.data;
  switch (data.request) {
    case 'redraw':
      console.log('Engine request: ' + data.request);
      this.update(data.board, data.actioninfo);
      break;
    default:
      console.log('Engine used unknown request');
  }
};

$(document).ready( function () { (new Hmi()).init(); });

