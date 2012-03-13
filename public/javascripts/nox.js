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
  var form = el.parents('.request-container');

  if(data.ok) {
    form.find('textarea[name=response]').val(data.response);
    form.find('input[name=statusCode]').val(data.statusCode);
    form.find('input[name=contentType]').val(data.contentType);
  }

  e.stopPropagation();
});

$('a[nox-kill]').live('ajax:success', function(e, data, status, xhr) {
  $(this).parents('.request-container').remove();

  e.stopPropagation();
});

$('form[nox-response]').live('ajax:success', function(e, data, status, xhr) {
  $(this).parents('.request-container').remove();

  e.stopPropagation();
});

$(function() {
  var socket = io.connect();

  socket.on('connect', function () {
    socket.on('newRequest', function (data) {
      $('div.requests-container').append(data);

      if (soundsEnabled())
        notificationSound.play();

      // window.fluid.showGrowlNotification({
      //   title: "title",
      //   description: "description",
      //   priority: 1,
      //   sticky: false,
      //   identifier: "foo",
      //   onclick: callbackFunc,
      //   icon: imgEl // or URL string
      // })

    });

    socket.on('requestError', function (data) {
      var request = $('#request-' + data.id);
      request.find('.request').addClass('error');
      request.find('.alert-error').show().html('Error: ' + data.message);
      request.find('.inputs').remove()
      request.find('.perform-button').remove()

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
