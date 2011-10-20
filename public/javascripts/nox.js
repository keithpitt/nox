var notificationSound = new buzz.sound( "/sounds/alert", {
  formats: [ "wav" ]
});

var badSound = new buzz.sound( "/sounds/bad", {
  formats: [ "wav" ]
});

function soundsEnabled() {
  return !(window.location.search || "").match(/sounds=false/)
}

$('*').live('ajax:success', function(e, data, status, xhr) {
  if(!data.ok && data.error) {
    alert('Error: ' + data.error);
  }
});

$('a[nox-perform]').live('ajax:success', function(e, data, status, xhr) {
  var el = $(this);
  var form = el.parents('form');

  if(data.ok) {
    form.find('textarea[name=response]').val(data.response);
    form.find('input[name=statusCode]').val(data.statusCode);
    form.find('input[name=contentType]').val(data.contentType);
  }

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

      if (soundsEnabled())
        notificationSound.play();
    });

    socket.on('requestError', function (data) {
      var request = $('#request-' + data.id);
      request.addClass('error');
      request.find('.error-message').html('Error: ' + data.message);

      if (soundsEnabled())
        badSound.play();
    });
  });
});

setInterval(function() {

  $('.countdown').each(function(idx, el) {
    var current = parseInt($(el).text());

    $(el).text((current <= 0) ? 0 : current - 1);
  });

}, 1000);
