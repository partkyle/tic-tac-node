var socket = io.connect();

socket.emit('watch');

socket.on('stats', function(data) {
  console.log(data);
});
