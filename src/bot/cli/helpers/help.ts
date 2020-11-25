import { methods, methods_list } from './methods'

const HELP = `
  COMMANDS:
    help - this help
    spec - list of methods and specs
    me - get node info
    balance - get wallet balances
    clear - clear screen
    orders - list orders available

  METHODS:
    create [buy] [sell] [buy-amount] [sell-amount] - create order
    request [id|small-id]
    accept [id|small-id]
    swap [id|small-id]
    fill [ticker] [price] [total_amount]
    plotbook [ticker]

  FULL LIST:
    ${methods_list}

  TICKER
    BTC-ETH

  URL
    Any request can be fired using no-slash syntax. E.g. to call
      localhost:1337/orders/QwAAA-111/request
    you can write:
      orders/QwAAA-111/request

  SMALL-ID
    If your orders array contains 3 orders, you can address them by index instead of long Qw... IDs
    e.g. orders = [
      { id: QwR3rq...-123123 }, // 1
      { id: QwR3rq...-321321 }, // 2
      { id: QwR3rq...-777777 }, // 3
    ]

      request 2
    would be the same as
      request QwR3rq...-321321


`

const FULL_HELP = `
  FULL SPEC:
    ${JSON.stringify(methods, null, 4)}
`

export { HELP, FULL_HELP }
