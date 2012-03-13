var util = require('util'),
    events = require('events'),
    util = require('util'),
    url = require('url'),
    http = require('http'),
    https = require('https'),
    _ = require('underscore'),
    querystring = require('querystring');

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

  this.killAll = function() {

    var self = this;

    _.each(_.values(requests), function(v) {
      self.respondToRequest(v);
    });

  };

  this.addRequest = function(req, res) {

    var self = this;

    var id = ++currentId;

    console.log("Adding new request for URL " + req.headers['nox-url']);

    // When the request times out
    req.on('close', function(error) {
      if(!requests[id]) return;

      if(error && error.code) {
        var message = requests[id].error = "The request's connection closed with a code of: `" + error.code + "`";
      } else {
        var message = requests[id].error = "The request's connection closed and no error was provided.";
      }

      var state = requests[id].state = 'error';

      self.emit('requestError', { id: id, message: message, state: state });
    });

    var create = function(postBody) {
      var now = new Date();

      var current = requests[id] = { id: id, req: req, res: res, postBody: postBody, startedAt: now, secondsLeft: function() {
        var dif = now.getTime() - (new Date()).getTime()
        var left = Math.round(parseInt(req.headers['nox-timeout']) - Math.abs(dif / 1000));

        return left <= 0 ? 0 : left;
      }};

      res.partial('request', { request: current }, function(error, partial) {
        self.emit('newRequest', partial);
      });
    }

    if (!req.complete) {

      var postBody = [];

      req.on('data', function(chunk) {
        postBody.push(chunk);
      });

      req.on('end', function() {
        create(postBody.join());
      });

    } else {

      create(querystring.stringify(req.body));

    }

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
    delete passThroughHeaders['nox-timeout'];
    delete passThroughHeaders['nox-method'];
    delete passThroughHeaders['user-agent'];
    delete passThroughHeaders['connection'];
    delete passThroughHeaders['host'];
    delete passThroughHeaders['content-length'];

    // Add the _real_ content length
    if(postBody) {
      passThroughHeaders['content-length'] = postBody.length;
    }

    var ssl = requestUrl.protocol == 'https:';
    var protocol = ssl ? https : http;
    var port = ssl ? 443 : parseInt(requestUrl.port || 80);

    var options = {
      host: requestUrl.hostname,
      port: port,
      path: requestUrl.pathname + (requestUrl.search || ''),
      method: req.headers['nox-method'] || req.method,
      headers: passThroughHeaders
    };

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

    stream.on('error', function(e) {
      console.log('Error on request: ' + e.message);
      console.log(e.stack);
      callback(null, e.message);
    });

    if(postBody) {
      stream.write(postBody);
    }

    stream.end();

  };

};

util.inherits(Nox, events.EventEmitter);

module.exports = new Nox();
