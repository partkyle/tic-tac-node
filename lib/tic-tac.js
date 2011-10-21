var AI = {
  move: function (board) {
    for (var yIndex in board) {
      for (var xIndex in board[yIndex]) {
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