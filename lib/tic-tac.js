var AI = {
  move: function (board) {
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
  }
};


exports.AI = AI;