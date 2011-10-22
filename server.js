/**
 * Application for hosting tic-tac-toe games
 */

var express = require('express');

var app = module.exports = express.createServer();

var AI = require('./lib/tic-tac.js').AI;

var store = require('./lib/store.js').store;

var http = require('http');

var uuid = require('node-uuid');

var server_name = "game-server";

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

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.get('/register', function (req, res) {
  
});

app.get('/game/new', function (req, res) {
  res.json(
    {
      gameId: 1,
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]
    }
  );
});

app.listen(process.argv[2] || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
