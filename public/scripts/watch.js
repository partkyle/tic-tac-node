var socket = io.connect();

socket.emit('watch');

var template = "\
<table>\
  <thead>\
    <tr>\
      <th>Player</th>\
      <th>Score</th>\
    </tr>\
  </thead>\
  <% _.each(stats, function(stat) { %>\
    <tr>\
      <td><%= stat.name %></td>\
      <td><%= stat.wins %></td>\
    </tr>\
  <% }); %>\
</table>";

socket.on('stats', function(data) {
  $('#stats').html(_.template(template, data));
});
