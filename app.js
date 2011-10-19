
/**
 * Module dependencies.
 */

var express = require('express');
var http = require("http");
var url = require("url");

var app = module.exports = express.createServer();

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
  var requestUrl = url.parse(request.headers['nox-url']);

  var post = http.createClient(requestUrl.port || 80, requestUrl.host);

  var client = post.request('POST', requestUrl.pathname + requestUrl.search, {
    'Content-Type':'application/x-www-form-urlencoded'
  });

  // TODO
  client.write('test=10');

  client.end();

  client.on('response', function(response) {

    response.setEncoding('utf8');

    var chunks = [];
    response.on('data', function(chunk) {
      chunks.push(chunk);
    });

    response.on('end', function(chunk) {
      var json = { response: chunks.join('') };

      res.writeHead(200, { 'content-type': 'text/json' });
      res.write(JSON.stringify(json));
      res.end('\n');
    });

  });

});

app.post('/response/:id', function(req, res) {

  var current = req.params.id;

  requests[current]['res'] = function(res) {
    res.send(req.body.response);
  }

  res.writeHead(200, { 'content-type': 'text/json' });
  res.write(JSON.stringify({ ok: true }));
  res.end('\n');

});

app.get('/request', function(req, res) {

  var current = id++;
  requests[current] = { id: current, req: req };

  wait(function() {
    return requests[current]['res'];
  }, function() {
    var finish = requests[current]['res'];
    delete requests[current];
    finish(res);
  });

});

app.listen(7654);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
