/* Called on reply button click */
function copyReply (id) {
  /* Get the body of the post */
  var post = document.getElementById(id).children[1];
  var body = post.children[1];
  var postSubject = post.children[0].children[3].children[1].innerHTML;
  var postName = post.children[0].children[1].children[1].innerHTML;
  var lines = body.innerHTML.split('</p><p>');

  /* Remove extra tags */
  lines[0] = lines[0].substring(3);
  lines[lines.length - 1] = lines[lines.length - 1].substring(
    0,
    lines[lines.length - 1].length - 4
  );

  var textarea = document.getElementById('text');
  var subject = document.getElementById('userSubject');

  /* Add reply name */
  lines.unshift('');
  lines.unshift(postName + ' said:');

  /* Add quoted material to text box */
  for (var i = 0; i < lines.length; i ++) {
    /* Strip HTML */
    lines[i] = lines[i].replace(/<(?:.|\n)*?>/gm, '');
    /* Replace &gt; */
    lines[i] = lines[i].replace(/\&gt\;/g, '>');
    /* Add quote */
    textarea.value += ('> ' + lines[i] + '\r\n');
  }

  /* Set subject */
  subject.value = 'Re: ' + postSubject;
}
