var uuid = require('node-uuid');
var express = require('express');
var app = module.exports = express.createServer();
var io  = require('socket.io').listen(app);
var store = require('./lib/Store').Store;
var AI = require('./lib/tic-tac').AI;
var _ = require('underscore')._;

var servers = store.index('servers'),
    games   = store.index('games');

// Queue for managing players waiting to play
var queue = [];

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
    var incoming = {name: data.name, socket:socket};
    if (queue.length == 0) {
      // add player to queue
      queue.push(incoming);

      // tell the player to wait for another game to start
      socket.emit('status', {status: 'waiting'});
    } else {
      // if there is another player, notify them it is their turn
      var player = queue.pop();

      // set up the characters for each player
      player.character = 'x';
      incoming.character = 'o';

      var gameId = uuid();

      var players = {};
      players[player.name] = player;
      players[incoming.name] = incoming;

      // persist the game
      games.put(gameId, {
        gameId: gameId,
        players: players,
        board: [
          [null,null,null],
          [null,null,null],
          [null,null,null] ]
      });

      player.socket.emit('turn', {
        gameId: gameId,
        board: games.get(gameId).board
      });
    }
  });

  socket.on('move', function(data) {
    var game = games.get(data.gameId);
    game.board[data.move.y][data.move.x] = game.players[data.name].character;
    games.put(data.gameId, game);

    var winner = AI.getWinner(game.board);
    if (winner) {
      _(game.players).each(function(player) {
        player.socket.emit('done', {win: false});
      });
    } else {
      // find the other player
      var other;
      for (var player in game.players) {
        if (player != data.name) {
          other = game.players[player];
        }
      }

      // send "turn" event to other player
      other.socket.emit('turn', {
        gameId: data.gameId,
        board: game.board
      });
    }
  });
});
