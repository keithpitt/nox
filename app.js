
/**
 * Module dependencies.
 */

var express = require('express');

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

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

var wait = function(check, finish) {
  if(check()) {
    finish();
  } else {
    setTimeout(function() {
      wait(check, finish);
    }, 100);
  }
}

app.get('/request', function(req, res) {

  var x = true;

  setTimeout(function(){
    x = false;
    console.log("ASDASDASD");
  }, 3000);

  console.log(req);

  wait(function() {
    return !x;
  }, function() {
    res.render('index', {
      title: 'Express'
    });
  });

});

app.listen(7654);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
