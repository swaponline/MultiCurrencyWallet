var test = require('tape');
var quotemeta = require('../');

test(function (t) {
    t.plan(1);
    
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
    
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (filter(xs[i])) res.push(xs[i]);
    }
    t.same(res, [ '2 node.js 5' ]);
});
