#!/usr/bin/env node
/* eslint-disable no-console */

'use strict'

// Usage: $0 [--host <host>] [--port <port>] [--disable-metrics]

const signalling = require('./index')
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2), {
  alias: {
    p: 'port',
    h: 'host',
    'disable-metrics': 'disableMetrics'
  }
})

;(async () => {
  const server = await signalling.start({
    port: argv.port || process.env.PORT || 9090,
    host: argv.host || process.env.HOST || '0.0.0.0',
    metrics: !(argv.disableMetrics || process.env.DISABLE_METRICS)
  })

  console.log('Listening on:', server.info.uri)

  process.on('SIGINT', async () => {
    await server.stop()
    console.log('Signalling server stopped')
    process.exit()
  })
})()
