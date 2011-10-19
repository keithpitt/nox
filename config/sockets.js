module.exports = function(io, nox){

  io.configure('development', function(){

    io.set('log level', 1);

  });

  io.sockets.on('connection', function (socket) {

    nox.on('requestError', function(error){
      socket.emit('requestError', error);
    });

    nox.on('newRequest', function(partial){
      socket.emit('newRequest', partial);
    });

  });

}
