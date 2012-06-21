module('data-disable', {
  setup: function() {
    $('#qunit-fixture').append('<form action="/echo" data-remote="true" method="post"></form>')
      .find('form')
      .append('<input type="text" data-disable-with="processing ..." name="user_name" value="john" />');

    $('#qunit-fixture').append('<form action="/echo" method="post"></form>')
      .find('form:last-child')
      // WEEIRDD: the form won't submit to an iframe if the button is name="submit" (??!)
      .append('<input type="submit" data-disable-with="submitting ..." name="submit2" value="Submit" />');

    $('#qunit-fixture').append('<a href="/echo" data-disable-with="clicking...">Click me</a>');
  }
});

function getVal(el) {
  return (el.filter('input,textarea,select').length > 0) ? el.val() : el.text();
}

function disabled(el) {
  return (el.filter('input,textarea,select,button').length > 0) ? el.attr('disabled') !== null : el.data('ujs:enable-with');
}

function checkEnabledState(el, text) {
  ok(!disabled(el), el.get(0).tagName + ' should not be disabled');
  equal(getVal(el), text, el.get(0).tagName + ' text should be original value');
}

function checkDisabledState(el, text) {
  ok(disabled(el), el.get(0).tagName + ' should be disabled');
  equal(getVal(el), text, el.get(0).tagName + ' text should be disabled value');
}

asyncTest('form input field with "data-disable-with" attribute', 7, function() {
  var form = $('form[data-remote]'), input = form.find('input[type=text]');

  checkEnabledState(input, 'john');

  form.bind('ajax:success', function(e, data) {
    setTimeout(function() {
      checkEnabledState(input, 'john');
      equal(data.params.user_name, 'john');
      start();
    }, 13)
  })
  form.trigger('submit');

  checkDisabledState(input, 'processing ...');
});

asyncTest('form button with "data-disable-with" attribute', 6, function() {
  var form = $('form[data-remote]'), button = $('<button data-disable-with="submitting ..." name="submit2">Submit</button>');
  form.append(button);

  checkEnabledState(button, 'Submit');

  form.bind('ajax:success', function(e, data) {
    setTimeout(function() {
      checkEnabledState(button, 'Submit');
      start();
    }, 13)
  })
  form.trigger('submit');

  checkDisabledState(button, 'submitting ...');
});

asyncTest('form input[type=submit][data-disable-with] disables', 6, function(){
  var form = $('form:not([data-remote])'), input = form.find('input[type=submit]');

  checkEnabledState(input, 'Submit');

  // WEEIRDD: attaching this handler makes the test work in IE7
  form.bind('iframe:loading', function(e, form) {});

  form.bind('iframe:loaded', function(e, data) {
    setTimeout(function() {
      checkDisabledState(input, 'submitting ...');
      start();
    }, 30);
  });
  input.trigger('click');

  setTimeout(function() {
    checkDisabledState(input, 'submitting ...');
  }, 30);
});

asyncTest('form[data-remote] input[type=submit][data-disable-with] is replaced in ajax callback', 2, function(){
  var form = $('form:not([data-remote])').attr('data-remote', 'true'), origFormContents = form.html();

  form.bind('ajax:success', function(){
    form.html(origFormContents);

    setTimeout(function(){
      var input = form.find('input[type=submit]');
      checkEnabledState(input, 'Submit');
      start();
    }, 30);
  }).trigger('submit');
});

asyncTest('form[data-remote] input[data-disable-with] is replaced with disabled field in ajax callback', 2, function(){
  var form = $('form:not([data-remote])').attr('data-remote', 'true'), input = form.find('input[type=submit]'),
      newDisabledInput = input.clone().attr('disabled', 'disabled');

  form.bind('ajax:success', function(){
    var parent = input[0].parentNode;
    $(input).remove()
    $(parent).append(newDisabledInput);

    setTimeout(function(){
      checkEnabledState(newDisabledInput, 'Submit');
      start();
    }, 30);
  }).trigger('submit');
});

asyncTest('form[data-remote] textarea[data-disable-with] attribute', 3, function() {
  var form = $('form[data-remote]'),
      textarea = $('<textarea data-disable-with="processing ..." name="user_bio">born, lived, died.</textarea>');
  form.append(textarea);

  form.bind('ajax:success', function(e, data) {
    setTimeout(function() {
      equal(data.params.user_bio, 'born, lived, died.');
      start();
    }, 13)
  })
  form.trigger('submit');

  checkDisabledState(textarea, 'processing ...');
});

asyncTest('a[data-disable-with] disables', 4, function() {
  var link = $('a[data-disable-with]');

  checkEnabledState(link, 'Click me');

  link.bind('click', function(e){
    e.preventDefault();
  }).trigger('click');
  checkDisabledState(link, 'clicking...');
  start();
});

asyncTest('a[data-remote][data-disable-with] disables and re-enables', 6, function() {
  var link = $('a[data-disable-with]').attr('data-remote', true);

  checkEnabledState(link, 'Click me');

  link
    .bind('ajax:beforeSend', function() {
      checkDisabledState(link, 'clicking...');
    })
    .trigger('click');

    setTimeout(function() {
      checkEnabledState(link, 'Click me');
      start();
    }, 13)
});

asyncTest('a[data-remote][data-disable-with] re-enables when `ajax:before` event is cancelled', 6, function() {
  var link = $('a[data-disable-with]').attr('data-remote', true);

  checkEnabledState(link, 'Click me');

  link
    .bind('ajax:before', function() {
      checkDisabledState(link, 'clicking...');
      return false;
    })
    .trigger('click');

  setTimeout(function() {
    checkEnabledState(link, 'Click me');
    start();
  }, 30);
});

asyncTest('a[data-remote][data-disable-with] re-enables when `ajax:beforeSend` event is cancelled', 6, function() {
  var link = $('a[data-disable-with]').attr('data-remote', true);

  checkEnabledState(link, 'Click me');

  link
    .bind('ajax:beforeSend', function() {
      checkDisabledState(link, 'clicking...');
      return false;
    })
    .trigger('click');

  setTimeout(function() {
    checkEnabledState(link, 'Click me');
    start();
  }, 30);
});

asyncTest('form[data-remote] input|button|textarea[data-disable-with] does not disable when `ajax:beforeSend` event is cancelled', 8, function() {
  var form = $('form[data-remote]'),
      input = form.find('input[type=text]'),
      button = $('<button data-disable-with="submitting ..." name="submit2">Submit</button>'),
      textarea = $('<textarea data-disable-with="processing ..." name="user_bio">born, lived, died.</textarea>'),
      submit = $('<input type="submit" data-disable-with="submitting ..." name="submit2" value="Submit" />');

  form.append(button).append(textarea).append(submit)
    .bind('ajax:beforeSend', function() {
      return false;
    })
    .trigger('submit');

    setTimeout(function() {
      checkEnabledState(input, 'john');
      checkEnabledState(button, 'Submit');
      checkEnabledState(textarea, 'born, lived, died.');
      checkEnabledState(submit, 'Submit');
      start();
    }, 30);

});
