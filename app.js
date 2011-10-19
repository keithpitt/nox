
/**
 * Module dependencies.
 */

var express = require('express');
var http = require("http");
var https = require("https");
var url = require("url");
var events = require('events');
var util = require('util');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

var eventEmitter = new events.EventEmitter();

function clone(o) {
  var ret = {};
  Object.keys(o).forEach(function (val) {
    ret[val] = o[val];
  });
  return ret;
}

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

var id = 0;
var requests = {};

var wait = function(check, finish) {
  if(check()) {
    finish();
  } else {
    setTimeout(function() {
      wait(check, finish);
    }, 100);
  }
}

app.get('/', function(req, res){

  var collection = [];
  for(var k in requests) collection.push(requests[k]);

  res.render('index', {
    title: "Nox",
    requests: collection
  });

});

app.get('/perform/:id', function(req, res) {

  var current = req.params.id;
  var request = requests[current].req;
  var postBody = requests[current].postBody;

  var requestUrl = url.parse(request.headers['nox-url']);

  var passThroughHeaders = clone(request.headers);
  delete passThroughHeaders['nox-url'];
  delete passThroughHeaders['user-agent'];
  delete passThroughHeaders['connection'];
  delete passThroughHeaders['host'];

  var options = {
    host: requestUrl.hostname,
    port: parseInt(requestUrl.port || 80),
    path: requestUrl.pathname + (requestUrl.search || ''),
    method: request.method,
    headers: passThroughHeaders
  };

  console.log(options);

  var stream = (options.port == 443 ? https : http).request(options, function(response) {

    response.setEncoding('utf8');

    response.on('error', function() {
      console.log('Response Error');
      console.log(response);
      console.log(arguments);
    });

    var chunks = [];
    response.on('data', function(chunk) {
      chunks.push(chunk);
    });

    response.on('end', function(chunk) {
      var json = {
        response: chunks.join(''),
        statusCode: res.statusCode,
        contentType: response.headers['content-type']
      };

      res.writeHead(200, { 'content-type': 'text/json' });
      res.write(JSON.stringify(json));
      res.end('\n');
    });

  });

  if(postBody) {
    console.log(postBody);
    stream.write(postBody);
  }

  stream.end();

  stream.on('error', function(e) {
    console.log('Error on request: ' + e.message);
    console.log(e.stack);
  });

});

app.delete('/kill/:id', function(req, res) {

  var current = req.params.id;

  requests[current]['res'] = function(res) {
    res.end();
  }

  res.writeHead(200, { 'content-type': 'text/json' });
  res.write(JSON.stringify({ ok: true }));
  res.end('\n');

});

app.post('/response/:id', function(req, res) {

  var current = req.params.id;

  requests[current]['res'] = function(res) {
    res.writeHead(req.body.statusCode, { 'content-type': req.body.contentType });
    res.write(req.body.response);
    res.end();
  }

  res.writeHead(200, { 'content-type': 'text/json' });
  res.write(JSON.stringify({ ok: true }));
  res.end('\n');

});

app.all('/request', function(req, res) {

  var postBody = [];

  req.on('data', function(chunk) {
    postBody.push(chunk);
  });

  req.on('end', function() {

    var current = id++;
    requests[current] = { id: current, req: req, postBody: postBody.join() };

    res.partial('request', { request: requests[current] }, function(error, partial) {
      eventEmitter.emit('newRequest', partial);
    });

    wait(function() {
      return requests[current]['res'];
    }, function() {
      var finish = requests[current]['res'];
      delete requests[current];
      finish(res);
    });

  });

});

// Sockets

io.sockets.on('connection', function (socket) {

  eventEmitter.on('newRequest', function(partial){
    socket.emit('newRequest', partial);
  });

});

app.listen(7654);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
