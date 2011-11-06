var uuid = require('node-uuid');
var name = uuid();
var io = require('socket.io-client');
var AI = require('./lib/tic-tac').AI;
var socket = io.connect('http://localhost:3000');

socket.emit('init', {name: name});

socket.on('status', function(data) {
  if (data.status == 'success') {
    socket.emit('queue', {name: name});
  } else {
    console.log(data.status);
  }
});

socket.on('turn', function(data) {
  console.log(data.board);

  var move = AI.move(data.board, data.character);

  socket.emit('move', {
    name: name,
    gameId: data.gameId,
    move: move
  });
});

socket.on('done', function(data) {
  if (data.win) {
    console.log('You won game ' + data.gameId);
  } else {
    console.log('You lost game ' + data.gameId);
  }
  console.log(data.board);

  setTimeout(function() {
    socket.emit('queue', {name: name});
  }, 200);
});
