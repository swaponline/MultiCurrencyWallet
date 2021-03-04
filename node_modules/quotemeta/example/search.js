var quotemeta = require('../');

var query = new RegExp('\\d ' + quotemeta('node.js'));
var filter = function (x) { return query.test(x) };

var xs = [
    '0 node^js y',
    '1 node_js x',
    '2 node.js 5',
    '3 beep z',
    'X node.js Y',
    '4 boop w'
];
console.dir(xs.filter(filter));
