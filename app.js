// Nox
var nox = require('./lib/nox.js');

// Require express and setup app
var express = require('express');
var app = module.exports = express.createServer();

// Require socket.io and listen to the express app
var io = require('socket.io').listen(app);

// Require stuff
require('./config/environment.js')(app, express);
require('./config/routes.js')(app, nox);
require('./config/sockets.js')(io, nox);

// Start listening
app.listen(7654);

// Output
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
