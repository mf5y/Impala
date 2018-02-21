function toggleLock (id) {
  var formName = 'toggle-lock-' + id;
  var form = document.forms[formName];

  form.submit();
}

function toggleSticky (id) {
  var formName = 'toggle-sticky-' + id;
  var form = document.forms[formName];

  form.submit();
}

function deleteThread (id) {
  var formName = 'delete-' + id;
  var form = document.forms[formName];

  form.submit();
}
