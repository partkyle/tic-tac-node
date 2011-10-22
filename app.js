
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var AI = require('./lib/tic-tac.js').AI;

var http = require('http');

var uuid = require('node-uuid');

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

// Route for starting a game with another server.
app.get('/start/:host/:port?', function (req, res) {
  var options = {
    host: req.params.host,
    port: req.params.port || 3000,
    path: '/game/new',
    method: 'GET'
  };

  http.get(options, function (resp) {
    resp.on('data', function (data) {
      var json = JSON.parse(data);
    });
  });
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
