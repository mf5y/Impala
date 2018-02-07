function bold (str) {
  var substr = str.substring(2, str.length - 2);
  return '<strong>' + substr + '</strong>';
}

function italics (str) {
  var substr = str.substring(3, str.length - 3);
  return '<i>' + substr + '</i>';
}

function strikethrough (str) {
  var substr = str.substring(2, str.length - 2);
  return '<strike>' + substr + '</strike>';
}

function quoted (str) {
  return '<span class=\'quoted\'>' + str + '</span>';
}

function formatString (str) {
  str = str.replace(/^&gt;(.*?)$/g, quoted);
  str = str.replace(/\'\'\'(.*?)\'\'\'/g, italics);
  str = str.replace(/\'\'(.*?)\'\'/g, bold);
  str = str.replace(/~~(.*?)~~/g, strikethrough);

  return str;
}

function formatText (text) {
  /* Format each string */
  for (var i = 0; i < text.length; i ++) {
    text[i] = formatString(text[i]);
  }

  return text;
}

module.exports.splitAndFormat = function (text) {
  text = text.split(/\r?\n/ug);
  text = formatText(text);
  text = '<p>' + text.join('</p><p>') + '</p>';

  return text;
}
