const methods = [
  {
    name: 'rest',
    tokens: ['url']
  },
  {
    name: 'create',
    tokens: ['buy', 'sell', 'buyAmount', 'sellAmount']
  },
  {
    name: 'request',
    tokens: ['id']
  },
  {
    name: 'accept',
    tokens: ['id']
  },
  {
    name: 'swap',
    tokens: ['id']
  },
  {
    name: 'autoaccept',
    tokens: []
  },
  {
    name: 'autosearch',
    tokens: ['minPrice']
  },
  {
    name: 'fill',
    tokens: ['ticker', 'price', 'total']
  },
  {
    name: 'fillbook',
    tokens: ['total']
  },
  {
    name: 'plotbook',
    tokens: ['ticker']
  },
  {
    name: 'plotbids',
    tokens: ['ticker']
  },
  {
    name: 'plotasks',
    tokens: ['ticker']
  },
  {
    name: 'printbook',
    tokens: ['ticker']
  },
]

const methods_list = methods.map(m => m.name)

const decodeMethod = (action, payload) => {
  const method = methods.filter(m => m.name == action)[0]

  if (!method) throw new Error(`No method: ${action}`)

  if ( payload.length != method.tokens.length )
    throw new Error(`Wrong length: [${payload}] / [${method.tokens}]`)

  return method.tokens.reduce((acc, token, index) => {
    acc[token] = payload[index]
    return acc
  }, {})
}

const printHelp = (action) => {
  const method = methods.filter(m => m.name == action)[0]

  if (!method)
    return `no method: ${action}`
  else
    return method.tokens
}

export {
  methods,
  methods_list,
  decodeMethod,
  printHelp,
}
