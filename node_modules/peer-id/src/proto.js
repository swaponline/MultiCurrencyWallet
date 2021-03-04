'use strict'

const protons = require('protons')
module.exports = protons(`

message PeerIdProto {
  required bytes id = 1;
  bytes pubKey = 2;
  bytes privKey = 3;
}

`)
