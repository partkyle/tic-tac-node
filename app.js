
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var AI = require('./lib/tic-tac.js').AI;

var http = require('http');

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

app.get('/start/:host', function (req, res) {
  var options = {
    host: req.params.host,
    path: '/game/new'
  };

  http.get(options, function (resp) {
    console.log(resp);
  })
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

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
