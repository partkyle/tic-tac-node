var uuid = require('node-uuid');
var name = uuid();
var io = require('socket.io-client');
var AI = require('./lib/tic-tac').AI;
var socket = io.connect('http://localhost:3000');

socket.emit('init', {name: name});

socket.on('status', function(data) {
  if (data.status == 'success') {
    socket.emit('queue');
  }
});

socket.on('turn', function(data) {
  console.log(data.board);

  socket.emit('move', {
    gameId: data.gameId,
    move: AI.move(data.board)
  });
});
