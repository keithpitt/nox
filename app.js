
/**
 * Module dependencies.
 */

var express = require('express');
var http = require("http");

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
  res.render('index', {
    title: "Nox",
    requests: requests
  });
});

app.get('/request', function(req, res) {

  var current = id++;
  requests[current] = { req: req };

  http.get({ host: 'google.com', path: '/' }, function (res) {

    console.log(res);

    requests[current]['res'] = function(res) {
      res.send('yes');
    }

  });

  // Replace with something else
  setTimeout(function(){
  }, 3000);

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
