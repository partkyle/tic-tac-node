var uuid    = require('node-uuid');
var express = require('express');
var app     = module.exports = express.createServer();
var io      = require('socket.io').listen(app);
var store   = require('./lib/Store').Store;
var AI      = require('./lib/tic-tac').AI;
var _       = require('underscore')._;

var servers = store.index('servers');

var models = require('./lib/models');
var mongoose = require('mongoose');
var db = mongoose.createConnection('http://localhost/tic-tac-node');
var Game = db.model('Game');
var Player = db.model('Player');

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
    var player = new Player({name: data.name});
    player.save();

    // socket has connected for the first time
    servers.put(player._id, {socket: socket});

    // tell the player that everything went ok
    socket.emit('status', {status: 'success'});
  });

  socket.on('queue', function(data) {
    Player.findOne({name: data.name}, function(err, player) {
      if (player) {
        if (queue.length == 0) {
          // add player to queue
          queue.push(player);
          var player_socket = servers.get(player._id).socket;
          player_socket.emit('status', {status: 'waiting'});
        } else {
          var queued_player = queue.pop();

          var game = new Game();
          game.players.push({character: 'x', player:queued_player._id});
          game.players.push({character: 'o', player:player._id});

          game.save();

          var player_socket = servers.get(queued_player._id).socket;
          player_socket.emit('turn', {
            gameId: game._id,
            board: game.board,
            character: 'x'
          });
        }
      }
    });
  });

  socket.on('move', function(data) {
    Game.findById(data.gameId, function(err, game) {
      Player.findOne({name:data.name}, function(err, player) {
        var game_player;
        for (var i = 0; i < game.players.length; i++) {
          if (game.players[i].player.toString() == player._id.toString()) {
            game_player = game.players[i];
            break;
          }
        };
        game.board[data.move.y][data.move.x] = game_player.character;
        game.markModified('board');
        game.save(function (err) {
          var winner = AI.getWinner(game.board);
          if (winner) {
            // the game is finished
            _(game.players).forEach(function(player) {
              var win = player.character == winner;
              if (win) {
                Player.findById(player.player, function(err, player_doc) {
                  player_doc.wins++;
                  player_doc.save();
                });
              }
              servers.get(player.player).socket.emit('done', {
                win: win,
                gameId: game.gameId,
                board: game.board
              });
            });
            _(watchers).forEach(function(watcher) {
              sendStats(watcher.socket);
            });
          } else {
            // find the other player
            var other;
            for (var i=0; i<game.players.length; i++) {
              if (game.players[i].player.toString() != player._id.toString()) {
                other = game.players[i];
                break;
              }
            }
            var other_socket = servers.get(other.player).socket;
            other_socket.emit('turn', {
              gameId: data.gameId,
              board: game.board,
              character: player.character
            });
          }
        });  
      });
    });
  });

  // listen for people connecting from the web
  socket.on('watch', function(data) {
    watchers.push({socket: socket});

    // give some intial stats
    sendStats(socket);
  });
});

function sendStats(watcher) {
  Player.find(function(err, players) {
    var stats = [];
    _(players).forEach(function (player) {
      stats.push({
        name: player.name,
        wins: player.wins
      });
    });

    watcher.emit('stats', {stats: stats});
  });
}
