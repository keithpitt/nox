module.exports = function(io, nox){

  io.configure('development', function(){
    io.set('log level', 1);
  });

  io.sockets.on('connection', function (socket) {
    // When nox shoots a newRequest event, pass it to our websocket.
    nox.on('newRequest', function(partial){
      socket.emit('newRequest', partial);
    });
  });

}
