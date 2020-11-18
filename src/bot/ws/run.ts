#!/usr/bin/env node

const ws = require('ws')

try {
  const server = new ws('ws://localhost:7333')
  server.on('message', mess => console.dir(JSON.parse(mess)))
} catch (err) {
  console.error(err)
}
