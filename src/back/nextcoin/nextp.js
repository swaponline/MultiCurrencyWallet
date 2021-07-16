const express = require('express')

const request = require('superagent')
const app = express()
const cors = require('cors')
const helmet = require('helmet')


app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
  extended: true,
}))


const portDefault = 7079

const nextCoinNode = {
  // testnet is down
  /*testnet: {
    port: 17078
  },*/
  mainnet: {
    port: 7078,
    ip: '127.0.0.1', //'195.201.222.194'
  },
}

const networks = Object.keys(nextCoinNode)

/*const allowedRpcMethods = [
  'getblockchaininfo',
  'getaddressbalance'
]*/


const sendRequest = ({ network, rpcMethod, rpcMethodParams = [], onSuccess, onError, appRes }) => {
  if (!networks.includes(network)) {
    const error = `bad request: unknown network "${network}", expected ${networks}`
    throw new Error(error)
    // appRes.status(400).json({ error })
    return
  }

  /*
  if (!allowedRpcMethods.includes(rpcMethod)) {
    const error = `bad request: unknown rpcMethod "${rpcMethod}", expected ${allowedRpcMethods}`
    //appRes.status(400).json({ error })
    throw new Error(error)
    return
  }
  */

  const user = { name: 'test', password: 'test' }
  const nodePort = nextCoinNode[network].port
  const nodeIP = nextCoinNode[network].ip

  const url = `http://${user.name}:${user.password}@${nodeIP}:${nodePort}`

  const bodyJson = {
    'jsonrpc': '1.0',
    'id': 'curltext',
    'method': rpcMethod,
    'params': rpcMethodParams,
  }

  const body = JSON.stringify(bodyJson)

  return request
    .post(url)
    .set('content-type', 'text/plain')
    .send(body)
    .then((req) => {
      const data = JSON.parse(req.text)
      // console.log('data =', data)
      if (data.error === null) {
        if (!onSuccess) return data.result
        onSuccess(data.result)
      } else {
        throw new Error(data.error)
      }
    })
    .catch((e) => {
      let resultError = e
      if (e.code === 'ECONNREFUSED') {
        resultError = new Error('Node is offline')
      }
      if (!onError) return resultError
      onError(resultError)
    })
}


/*
Planning proxy interface:

/:network +
/:network/:var(addr|address)/:address' +
/:network/:var(addr|address)/:address/utxo' +
/:network/sendrawtransaction +
/:network/tx/:txId +
/:network/txs/:address +
/:network/rawtx/:txId
*/

app.get('/:network', async (req, res) => {
  const { network } = req.params

  sendRequest({
    network,
    rpcMethod: 'getblockchaininfo',
    rpcMethodParams: [],
    onSuccess: (data) => {
      res.status(200).json(data)
    },
    onError: (e) => {
      res.status(503).json({ error: e.message })
    },
    appRes: res,
  })
})


app.get('/:network/:var(addr|address)/:address', async (req, res) => {
  const { network, address } = req.params

  sendRequest({
    network,
    rpcMethod: 'getaddressbalance',
    rpcMethodParams: [{ 'addresses': [address] }],
    onSuccess: (data) => {
      res.status(200).json(data)
    },
    onError: (e) => {
      res.status(503).json({ error: e.message })
    },
  })
})

app.get('/:network/txs/:address', async (req, res) => {
  const { network, address } = req.params

  sendRequest({
    network,
    rpcMethod: 'getaddresstxids',
    rpcMethodParams: [{ 'addresses': [address] }],
    onSuccess: (data) => {
      const txs = data.reverse().slice(0, 10) // return last 10 transactions
      const ret = {
        txs,
      }

      const fetchTxInfos = txs.map((txid, i) => {
        return new Promise(async (resolve) => {
          const txInfo = await sendRequest({
            network,
            rpcMethod: 'getrawtransaction',
            rpcMethodParams: [ txid, 1 ],
          })
          ret.txs[i] = txInfo
          resolve(txInfo)
        })
      })

      Promise.all(fetchTxInfos).then(() => {
        res.status(200).json(ret)
      }).catch ((e) => {
        res.status(503).json({ error: e.message })
      })
    },
    onError: (e) => {
      res.status(503).json({ error: e.message })
    },
  })
})

app.get('/:network/tx/:txid', async (req, res) => {
  const { network, txid } = req.params

  sendRequest({
    network,
    rpcMethod: 'getrawtransaction',
    rpcMethodParams: [ txid, true ],
    onSuccess: (data) => {
      res.status(200).json(data)
    },
    onError: (e) => {
      res.status(503).json({ error: e.message })
    },
  })
})

// todo: unexisting address case

app.get('/:network/:var(addr|address)/:address/utxo', async (req, res) => {
  const { network, address } = req.params

  sendRequest({
    network,
    rpcMethod: 'getaddressutxos',
    rpcMethodParams: [{ 'addresses': [address] }],
    onSuccess: (data) => {
      res.status(200).json(data)
    },
    onError: (e) => {
      res.status(503).json({ error: e.message })
    },
  })
})

app.post('/:network/sendrawtransaction', async (req, res) => {
  const { network } = req.params
  const { rawtx } = req.body

  sendRequest({
    network,
    rpcMethod: 'sendrawtransaction',
    rpcMethodParams: [ rawtx ],
    onSuccess: (data) => {
      res.status(201).json({ raw: data })
    },
    onError: (e) => {
      res.status(503).json({ error: e.message })
    },
  })
})


app.listen(process.env.PORT ? process.env.PORT : portDefault)
console.log(`nextp (NEXT.coin proxy) listening: localhost:${portDefault} ⇄ NEXT.coin node`)
