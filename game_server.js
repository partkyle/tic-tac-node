var uuid    = require('node-uuid');
var express = require('express');
var app     = module.exports = express.createServer();
var io      = require('socket.io').listen(app);
var store   = require('./lib/Store').Store;
var AI      = require('./lib/tic-tac').AI;
var _       = require('underscore')._;

var servers = store.index('servers'),
    games   = store.index('games'),
    stats   = store.index('stats');

// Queue for managing players waiting to play
var queue = [];

// List of people watching on the web
var watchers = [];

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
app.get('/', function(req, res) {
  res.render('index', {
    title: 'Express'
  });
});

app.get('/watch', function(req, res) {
  res.render('watch', {
    title: 'Watching the action'
  });
});

// socket config
io.sockets.on('connection', function(socket) {
  socket.on('init', function(data) {
    // socket has connected for the first time
    servers.put(data.name, {socket: socket});

    // add them to the stats store if they aren't there
    if (!stats.get(data.name)) {
      stats.put(data.name, {name: data.name, wins: 0});
    }

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
      // the game is finished
      _(game.players).forEach(function(player) {
        var win = player.character == winner;
        if (win) {
          stats.get(player.name).wins++;
        }
        player.socket.emit('done', {
          win: win,
          gameId: game.gameId,
          board: game.board
        });
      });
      _(watchers).forEach(function(watcher) {
        watcher.socket.emit('stats', getStats(stats));
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

  // listen for people connecting from the web
  socket.on('watch', function(data) {
    watchers.push({socket: socket});
    // give some intial stats
    socket.emit('stats', getStats(stats));
  });
});

function getStats(stats) {
  stats_array = [];
  for (var name in stats.all()) {
    console.log(name);
    stats_array.push({
      name: name,
      wins: stats.get(name).wins
    });
  }
  return {stats: stats_array};
}
