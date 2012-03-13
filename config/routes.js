var _ = require('underscore');

module.exports = function(app, nox) {

  var json = function(res, json) {

    res.writeHead(200, { 'content-type': 'text/json' });
    res.write(JSON.stringify(json));
    res.end('\n');

  };

  app.get('/', function(req, res){

    res.render('index', {
      title: "Nox",
      requests: nox.currentRequests(),
      sounds: (req.query.sounds == 'false') ? false : true
    });

  });

  app.all('/request', function(req, res) {

    nox.addRequest(req, res);

  });

  app.get('/kill-all', function(req, res) {

    nox.killAll();

    res.redirect('/');

  });

  app.delete('/kill/:id', function(req, res) {

    var request = nox.findRequest(req.params.id);

    nox.killRequest(request);

    json(res, { ok: true });

  });

  app.post('/response/:id', function(req, res) {

    var request = nox.findRequest(req.params.id);

    nox.respondToRequest(request, { statusCode: req.body.statusCode,
                                    contentType: req.body.contentType,
                                    body: req.body.response });

    json(res, { ok: true });

  });

  app.get('/perform/:id', function(req, res) {

    var request = nox.findRequest(req.params.id);

    nox.performRequest(request, function(response, error) {
      if(error)
        json(res, { ok: false, error: error });
      else
        json(res, _.extend({ ok: true }, response));
    });

  });

}
