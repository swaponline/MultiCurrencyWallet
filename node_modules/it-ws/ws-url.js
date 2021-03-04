const rurl = require('relative-url')
const map = { http: 'ws', https: 'wss' }
const def = 'ws'

module.exports = (url, location) => rurl(url, location, map, def)
