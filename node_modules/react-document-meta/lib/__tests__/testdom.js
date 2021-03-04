(function() {
  if (typeof document !== 'undefined') {
    return;
  }

  var jsdom = require('jsdom').jsdom;

  global.document = jsdom('<html><head></head><body></body></html>');
  global.window = document.defaultView;
  global.navigator = {
    userAgent: 'node.js'
  };
})();