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

// socket config
io.sockets.on('connection', function(socket) {
  socket.on('init', function(data) {
    // socket has connected for the first time
    servers.put(data.name, {socket: socket});

    // tell the player that everything went ok
    socket.emit('status', {status: 'success'});
  });

  socket.on('queue', function(data) {
    var gameId = uuid();
    games.put(gameId, {
      board: [
        [null,null,null],
        [null,null,null],
        [null,null,null] ]
    });
    socket.emit('turn', {
      gameId: gameId,
      board: games.get(gameId).board
    });
  });

  socket.on('move', function(data) {
    var game = games.get(data.gameId);
    game.board[data.move.y][data.move.x] = 'x';
    games.put(data.gameId, game);
    socket.emit('your turn', {
      gameId: data.gameId,
      board: game.board
    }); 
  });
  socket.on('new game', function(data) {
    console.log(data);
  });
});
