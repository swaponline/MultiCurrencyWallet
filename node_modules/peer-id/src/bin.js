#!/usr/bin/env node

'use strict'

const PeerId = require('./index.js')
const argv = require('minimist')(process.argv.slice(2))

async function main () {
  const id = await PeerId.create({
    keyType: argv.type,
    bits: argv.bits
  })
  console.log(JSON.stringify(id.toJSON(), null, 2)) // eslint-disable-line no-console
}

main()
