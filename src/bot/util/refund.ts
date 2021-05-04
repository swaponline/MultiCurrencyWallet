import * as swap from 'simple.swap.core'

import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'


const KEY_ID = ['id', 'i']
const KEY_HASH = ['hash', 'h']
const KEY_SECRET = ['secret', 's']
const KEY_ALL = ['all', 'a']
const KEY_HELP = ['help']

const sections = [
  {
    header: 'Refund swaps',
    content: 'Refund one your swap by swapID, transaction hash, script address or refund all swaps in history'
  },
  {
    header: 'Options',
    optionList: [
      {
        name: KEY_ID[0],
        alias: KEY_ID[1],
        typeLabel: '{underline string}',
        description: 'Refund swap by swapID.'
      },
      {
        name: KEY_HASH[0],
        alias: KEY_HASH[1],
        typeLabel: '{underline string}',
        description: 'Refund swap by hash transaction.'
      },
      {
        name: KEY_SECRET[0],
        alias: KEY_SECRET[1],
        typeLabel: '{underline string}',
        description: 'Refund swap by secret transaction.'
      },
      {
        name: KEY_ALL[0],
        alias: KEY_ALL[1],
        typeLabel: '{underline string}',
        description: 'Refund all swaps inhistory.'
      },
      {
        name: KEY_HELP[0],
        description: 'Print this usage guide.'
      }
    ]
  }
]

const optionDefinitions = [
  { name: KEY_ID[0], alias: KEY_ID[1], type: String, defaultOption: true, },
  { name: KEY_HASH[0], alias: KEY_HASH[1], type: String, },
  { name: KEY_SECRET[0], alias: KEY_SECRET[1], type: String, },
  { name: KEY_ALL[0], alias: KEY_ALL[1], type: String, },
  { name: KEY_HELP[0], alias: KEY_HELP[1], type: String, },
]

const usage = commandLineUsage(sections)
let options = {}

try {
  options = commandLineArgs(optionDefinitions)
}
catch (error) {
  console.log('Invalid key type', '\n', usage)
  process.exit(0)
}

const {
  on: { onFinish },
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, get, start, refund },
  history: { getAllInProgress, removeInProgress, saveFinished },
  filter: { hash2id, secret2id },
} = swap.helpers

const { app, room, orders } = swap.setup({})

console.clear()
console.log('IPFS loading...')
console.log('REFUND getting ready...')

const _ = (async () => {
  await ready(room)

  console.clear()

  swap.helpers.history.init(app)

  const swapHistory = getAllInProgress()
  const keyType = Object.keys(options)[0]
  const key = options[keyType]

  let swapID = null
  let refundResult = null

  switch (keyType) {

    case KEY_ID[0]:
      console.log('Key type is ID')

      swapID = key

      if (swapHistory.includes(swapID)) {
        //@ts-ignore: strictNullChecks
        refundResult = await refund(app, swapID)

        if (refundResult) {
          removeInProgress(swapID)
          saveFinished(swapID)
        }
      } else {
        console.log('This swap does not exist in history.')
      }

      process.exit(0)
      break

    case KEY_HASH[0]:
      console.log('Key type is HASH', '\n')

      //@ts-ignore: strictNullChecks
      swapID = await hash2id(app, key)

      if (swapID) {
        //@ts-ignore: strictNullChecks
        refundResult = await refund(app, swapID)

        if (refundResult) {
          removeInProgress(swapID)
          saveFinished(swapID)
        }
      }

      process.exit(0)
      break

    case KEY_SECRET[0]:
      console.log('Key type is SECRET', '\n')

      //@ts-ignore: strictNullChecks
      swapID = await secret2id(app, key)

      if (swapID) {
        //@ts-ignore: strictNullChecks
        refundResult = await refund(app, swapID)

        if (refundResult) {
          removeInProgress(swapID)
          saveFinished(swapID)
        }
      }

      process.exit(0)
      break

    case KEY_ALL[0]:
      console.log('Key type is ALL', '\n')

      for (let a = 0; a < swapHistory.length; a++) {
        swapID = swapHistory[a]

        //@ts-ignore: strictNullChecks
        refundResult = await refund(app, swapID)

        if (refundResult) {
          removeInProgress(swapID)
          saveFinished(swapID)
        }
      }

      process.exit(0)
      break

    case KEY_HELP[0]:
      console.log('Key type is HELP', '\n')
      console.log(usage)
      process.exit(0)
      break
  }

  process.exit(0)

})()

console.log(swap.helpers)
console.log(swap.helpers.history)
console.log(swap.helpers.history.init)
