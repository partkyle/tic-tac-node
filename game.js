var name = require('node-uuid')();

var io = require('socket.io-client');

var socket = io.connect('http://localhost:3000');

socket.emit('new game', {name: name});

socket.on('your turn', function(data) {
  console.log(data);
});