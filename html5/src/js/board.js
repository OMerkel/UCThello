//
// Copyright (c) 2016 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

function OthelloBoard() {
  this.field = { playerX: 0, playerO: 1, empty: 2 };
  this.direction = [
    { x:-1, y: 1 }, { x:0, y: 1 }, { x: 1, y: 1 },
    { x:-1, y: 0 },                { x: 1, y: 0 },
    { x:-1, y:-1 }, { x:0, y:-1 }, { x: 1, y:-1 }
  ];
  this.rules = {
    passingAllowed : true
  };
  this.none = 'none';
  this.set = 'set';
  this.pass = 'pass';
}

OthelloBoard.prototype.setup = function (size) {
  this.size = size;
  var halfsize = Math.floor(size / 2);
  this.active = this.field.playerO;
  this.board = [];
  for(var i=0; i<size; ++i) {
    var row = [];
    for(var j=0; j<size; ++j) {
      row[row.length] = this.field.empty;
    }
    this.board[this.board.length] = row;
  }
  this.board[halfsize-1][halfsize-1] = this.field.playerX;
  this.board[halfsize][halfsize] = this.field.playerX;
  this.board[halfsize-1][halfsize] = this.field.playerO;
  this.board[halfsize][halfsize-1] = this.field.playerO;
  this.passing = false;
  this.previousAction = { type: this.none };
  this.ply = 1;
};

OthelloBoard.prototype.copy = function () {
  var result = new OthelloBoard();
  result.size = this.size;
  result.active = this.active;
  result.board = [];
  for(var i=0; i<this.size; ++i) {
    var column = [];
    for(var j=0; j<this.size; ++j) {
      column[column.length] = this.board[i][j];
    }
    result.board[result.board.length] = column;
  }
  result.passing = this.passing;
  result.previousAction = { type: this.previousAction.type };
  if (this.set == this.previousAction) {
    result.previousAction.x = this.previousAction.x;
    result.previousAction.y = this.previousAction.y;
    result.previousAction.by = this.previousAction.by;
    result.previousAction.flip = [];
    for(var i=0; i<this.previousAction.flip.length; ++i) {
      result.previousAction.flip[i] = { x: this.previousAction.flip[i].x,
        y: this.previousAction.flip[i].y };
    }
  }
  result.ply = this.ply;
  return result;
};

OthelloBoard.prototype.onBoard = function ( position ) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};

OthelloBoard.prototype.getActions = function () {
  var action = [];
  if ( this.getStatistics()[this.field.empty] > 0 ) {
    var opponent = this.active ^ 1;
    for(var y=0; y<this.size; ++y) {
      for(var x=0; x<this.size; ++x) {
        if(this.field.empty == this.board[x][y]) {
          for(var d=0; d<this.direction.length; ++d) {
            var step = { x: x+this.direction[d].x, y: y+this.direction[d].y };
            if(this.onBoard(step) && opponent == this.board[step.x][step.y]) {
              while(this.onBoard(step) &&
                opponent == this.board[step.x][step.y]) {
                step = { x: step.x+this.direction[d].x,
                  y: step.y+this.direction[d].y };
              }
              if(this.onBoard(step) &&
                this.active == this.board[step.x][step.y]) {
                action[action.length] = { type: this.set, x: x, y: y };
                d=this.direction.length;
              }
            }
          }
        }
      }
    }
    action = 0 == action.length && !this.passing && this.rules.passingAllowed ?
      [ { type: this.pass } ] : action;
  }
  return action;
};

OthelloBoard.prototype.doAction = function (action) {
  var opponent = this.active ^ 1;
  this.passing = action.type == this.pass && this.rules.passingAllowed;
  var historyInfo = this.passing ? { type: this.pass } :
    { type: this.set, x: action.x, y: action.y, by: this.active, flip: [] };
  if ( !this.passing ) {
    this.board[action.x][action.y] = this.active;
    for(var d=0; d<this.direction.length; ++d) {
      var step = { x: action.x+this.direction[d].x,
        y: action.y+this.direction[d].y };
      if(this.onBoard(step) && opponent == this.board[step.x][step.y]) {
        opponentField = [];
        while(this.onBoard(step) &&
          opponent == this.board[step.x][step.y]) {
          opponentField[opponentField.length] = { x: step.x, y: step.y };
          step = { x: step.x+this.direction[d].x,
            y: step.y+this.direction[d].y };
        }
        if(this.onBoard(step) &&
          this.active == this.board[step.x][step.y]) {
          for(var i=0; i<opponentField.length; ++i) {
            this.board[opponentField[i].x][opponentField[i].y] =
              this.active;
            historyInfo.flip[historyInfo.flip.length] =
              { x: opponentField[i].x, y: opponentField[i].y };
          }
        }
      }
    }
  }
  this.active = opponent;
  this.previousAction = historyInfo;
  ++this.ply;
};

OthelloBoard.prototype.getStatistics = function() {
  var count = [ 0, 0, 0 ];
  for(var y=0; y<this.size; ++y) {
    for(var x=0; x<this.size; ++x) {
      ++count[this.board[x][y]];
    }
  }
  return count;
};

OthelloBoard.prototype.getResult = function() {
  var count = this.getStatistics();
  return count[0] > count[1] ? [ 0, 1 ] :
         count[1] > count[0] ? [ 1, 0 ] : [ 0.5, 0.5 ];
};

OthelloBoard.prototype.log = function() {
  var s = '';
  var score = [ 0, 0, 0 ];
  for(var i=this.size-1; i>=0; --i) {
    s += i;
    for(var j=0; j<this.size; ++j) {
      s += "XO."[this.board[j][i]];
      ++score[this.board[j][i]];
    }
    s += '\n';
  }
  s += ' 01234567\nX:' + score[0] + ' / O:' + score[1];
  console.log(s);
};

OthelloBoard.prototype.getState = function() {
  var board = [];
  for(var x=0; x<this.size; ++x) {
    var column = [];
    for(var y=0; y<this.size; ++y) {
      column[column.length] = this.board[x][y];
    }
    board[board.length] = column;
  }
  return { square: board, turn: this.active, ply: this.ply,
    actions: this.getActions(), previous: this.previousAction,
    count: this.getStatistics() };
};
