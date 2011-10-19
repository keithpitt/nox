$('a[nox-perform]').live('ajax:success', function(e, data, status, xhr) {
  var el = $(this);
  var form = el.parents('form');

  form.find('textarea[name=response]').val(data.response);
  form.find('input[name=statusCode]').val(data.statusCode);
  form.find('input[name=contentType]').val(data.contentType);

  e.stopPropagation();
});

$('a[nox-kill]').live('ajax:success', function(e, data, status, xhr) {
  $(this).parents('.request').remove();

  e.stopPropagation();
});

$('form[nox-response]').live('ajax:success', function(e, data, status, xhr) {
  $(this).parents('.request').remove();

  e.stopPropagation();
});

$(function() {
  var socket = io.connect();

  socket.on('connect', function () {
    socket.on('newRequest', function (data) {
      $('div.container').append(data);
    });
  });
});
