var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Player = new Schema({
  playerId: Schema.ObjectId,
  name: {
    type: String,
    index: {unique: true}
  },
  wins: {
    type: Number,
    default: 0
  }
});

var Game = new Schema({
  gameId: { type: Schema.ObjectId, index: true },
  board: {
    type: Schema.Types.Mixed,
    default: [
      [null,null,null], 
      [null,null,null],
      [null,null,null]
    ]
  },
  players: {
    type: [ {
      character: String,
      player: String
    } ]
  }
});

mongoose.model('Player', Player);
mongoose.model('Game', Game);
