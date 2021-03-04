/* eslint-env browser */
module.exports = typeof WebSocket === 'undefined' ? require('ws') : WebSocket
