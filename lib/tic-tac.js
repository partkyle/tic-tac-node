function allMatch(a) {
  for (var i=1; i < a.length; i++) {
    if (a[i] != a[0]) {
      return false;
    }
  }

  return a[0] != null;
}

var AI = {
  move: function(board) {
    for (var yIndex = 0; yIndex < board.length; yIndex++) {
      for (var xIndex = 0; xIndex < board[yIndex].length; xIndex++) {
        if (board[yIndex][xIndex] === null) {
          return {
            x: xIndex,
            y: yIndex
          };
        }
      }
    }
  },
  winner: function(board) {
    // comparing all rows
    for (var i=0; i < board.length; i++) {
      if (allMatch(board[i])) {
        return board[i][0];
      }
    }
    // comparing all columns
    for (var i=0; i < board.length; i++) {
      if (allMatch([board[0][i], board[1][i], board[2][i]])) {
        return board[0][i];
      }
    }
    // compare diagonals

    if (allMatch([board[0][0], board[1][1], board[2][2]])) {
      return board[0][0];
    }

    if (allMatch([board[2][0], board[1][1], board[0][2]])) {
      return board[2][0];
    }

    // there is no winner yet
    return false;
  },
  getWinner: function(board) {
    var count = 0;
    for (var y = 0; y < board.length; y++) {
      for (var x = 0; x < board[y].length; x++) {
        if (board[y][x]) {
          count++;
        }
      };
    };

    if (count < 9) {
      return this.winner(board);
    }

    if (count == 0) {
      return null;
    }

    return false;
  }
};


exports.AI = AI;
