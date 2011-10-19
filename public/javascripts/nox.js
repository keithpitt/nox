$('a[nox-perform]').live('ajax:success', function(e, data, status, xhr) {
  var el = $(this);
  var form = el.parents('form');
  var input = form.find('textarea[name=response]')

  input.val(data.response);

  e.stopPropagation();
});

$('form[nox-response]').live('ajax:success', function(e, data, status, xhr) {
  var el = $(this);
  var li = el.parents('li');

  li.remove();

  e.stopPropagation();
});
