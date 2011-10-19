var sys = require('sys'),
    events = require('events'),
    util = require('util'),
    url = require('url'),
    http = require('http'),
    https = require('https'),
    _ = require('underscore');

Nox = function() {

  // Superclass
  events.EventEmitter.call(this);

  var currentId = 0;
  var requests = {};

  this.currentRequests = function() {

    return requests;

  };

  this.findRequest = function(id) {

    return requests[id];

  };

  this.addRequest = function(req, res) {

    var self = this;
    var postBody = [];

    var id = ++currentId;

    req.on('data', function(chunk) {
      postBody.push(chunk);
    });

    // When the request times out
    req.on('close', function(error) {
      var message = requests[id].error = "The request's connection closed with a code of: `" + error.code + "`";
      requests[id].state = 'error';

      self.emit('requestError', { id: id, message: message });
    });

    req.on('end', function() {
      var current = requests[id] = { id: id, req: req, res: res, postBody: postBody.join() };

      res.partial('request', { request: current }, function(error, partial) {
        self.emit('newRequest', partial);
      });
    });

  };

  this.killRequest = function(request) {

    this.respondToRequest(request);

  };

  this.respondToRequest = function(request, options) {

    var req = request.req,
        res = request.res;

    if(options) {
      res.writeHead(options.statusCode, { 'content-type': options.contentType });
      res.write(options.body);
    }

    res.end();

    delete requests[request.id];

  };

  this.performRequest = function(request, callback) {

    var req = request.req,
        postBody = request.postBody;

    var requestUrl = url.parse(req.headers['nox-url']);

    var passThroughHeaders = _.clone(req.headers);
    delete passThroughHeaders['nox-url'];
    delete passThroughHeaders['user-agent'];
    delete passThroughHeaders['connection'];
    delete passThroughHeaders['host'];

    var options = {
      host: requestUrl.hostname,
      port: parseInt(requestUrl.port || 80),
      path: requestUrl.pathname + (requestUrl.search || ''),
      method: req.method,
      headers: passThroughHeaders
    };

    console.log(options);

    var protocol = (options.port == 443 ? https : http);

    var stream = protocol.request(options, function(response) {

      response.setEncoding('utf8');

      response.on('error', function() {
        console.log('Response Error');
        console.log(response);
        console.log(arguments);
        callback(null, e.message);
      });

      var chunks = [];
      response.on('data', function(chunk) {
        chunks.push(chunk);
      });

      response.on('end', function() {
        callback({
          response: chunks.join(''),
          statusCode: response.statusCode,
          contentType: response.headers['content-type']
        });
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
      callback(null, e.message);
    });

  };


};

util.inherits(Nox, events.EventEmitter);

module.exports = new Nox();