var uuid = require('node-uuid');
var express = require('express');
var app = module.exports = express.createServer();
var io  = require('socket.io').listen(app);
var store = require('./lib/Store').Store;

var servers = store.index('servers'),
    games   = store.index('games');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.listen(process.argv[2] || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Routes
app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

io.sockets.on('connection', function(socket) {
  socket.on('init', function(data) {
    // socket has connected for the first time
    servers.put(data.name, '');
    var gameId = uuid();
    games.put(gameId, {
      board: [
        [null,null,null],
        [null,null,null],
        [null,null,null] ]
    });
    socket.emit('your turn', {
      gameId: gameId,
      board: games.get(gameId).board
    });
  });
  socket.on('move', function(data) {
    console.log(data);
    var board = games.get(data.gameId).board;
    console.log(board);
    board[data.move.y][data.move.x] = 'x';
    games.put(data.gameId, board);
    console.log(board);
    socket.emit('your turn', {
      gameId: data.gameId,
      board: board
    }); 
  });
  socket.on('new game', function(data) {
    console.log(data);
  });
});