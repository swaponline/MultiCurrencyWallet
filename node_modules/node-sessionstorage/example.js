const storage = require('./index.js')

storage.setItem('foo', 'bar')

console.log('item set:', storage.getItem('foo'))

