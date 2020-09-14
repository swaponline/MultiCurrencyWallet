const port = 32250;


const fs = require("fs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const { BigNumber } = require("bignumber.js")

const request = require('superagent')

const util = require('util')

const app = express()

const timestamp = () => { return Math.round(+new Date()/1000); }

const getIP = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

const getDate = () => { return new Date().toISOString() }
const calcSum = (accumulator, currentValue) => accumulator + currentValue;

const memodyDB = []

const crossOriginAllow = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
}


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(function (req, res, next) {
  crossOriginAllow(res)
  next()
})

app.get('/btc/testnet/txs/', async (req, res) => {
  const { address } = req.query
  if (address) {
    const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full`
    request
      .get(url)
      .then((req) => {
        const answer = JSON.parse(req.text)
        if (answer
          && answer.txs
        ) {
          const retJson = {
            pagesTotal: 1,
            txs: answer.txs.map((txInfo, index) => {
              return {
                blockhash: txInfo.block_hash,
                blockheight: txInfo.block_height,
                blocktime: Math.floor(
                  new Date(
                    (txInfo.confirmations)
                    ? txInfo.confirmed
                    : txInfo.received
                  )
                ),
                confirmations: txInfo.confirmations,
                fees: BigNumber(txInfo.fees).dividedBy(1e8).toNumber(),
                locktime: 0,
                size: txInfo.size,
                time: Math.floor(
                  new Date(
                    (txInfo.confirmations)
                    ? txInfo.confirmed
                    : txInfo.received
                  )
                ),
                txid: txInfo.hash,
                valueIn: BigNumber(
                    txInfo.inputs.map((input) => { return input.output_value }).reduce(calcSum)
                  ).dividedBy(1e8).toNumber(),
                valueOut: BigNumber(
                    txInfo.outputs.map((output) => { return output.value }).reduce(calcSum)
                  ).dividedBy(1e8).toNumber(),
                version: txInfo.ver,
                vin: txInfo.inputs.map((input, index) => {
                  return {
                    addr: input.addresses[0],
                    n: input.output_index,
                    scriptSig: {
                      hex: input.script,
                    },
                    txid: input.prev_hash,
                    value: BigNumber(input.output_value).dividedBy(1e8).toNumber(),
                    valueSat: input.output_value,
                    vout: input.output_index,
                  }
                }),
                vout: txInfo.outputs.map((output, index) => {
                  return {
                    addresses: output.addresses,
                    n: index,
                    scriptPubKey: {
                      hex: output.script,
                    },
                    spentHeight: null,
                    spentIndex: null,
                    spentTxId: null,
                    value: BigNumber(output.value).dividedBy(1e8).toNumber(),
                  }
                }),
              }
            }),
          }
          res.status(200).json(retJson)
        } else {
          res.status(503).json({error: 'empty api answer'})
        }
      })
      .catch((e) => {
        console.log('Error', e)
        res.status(503).json({error: e.message})
      })
  } else {
    res.status(503).json({error: 'need address'})
  }
})

app.use('/btc/testnet/rawtx', async (req, res) => {
  const urlParts = req.url.split('/')
  urlParts.shift()

  if (urlParts.length == 1) {
    const txId = urlParts[0]
    const url = `https://api.blockcypher.com/v1/btc/test3/txs/${txId}?includeHex=true`
    request
      .get(url)
      .then((req) => {
        const answer = JSON.parse(req.text)
        if (answer) {
          res.status(200).json({
            rawtx: answer.hex,
          })
        } else {
          res.status(503).json({ error: 'api answer empty' })
        }
      })
      .catch((e) => {
        console.log('Error', e)
        res.status(503).json({ error: e.message })
      })

  }
})
app.get('/btc/testnet/tx/:txId', async (req, res) => {
  const { txId } = req.params
  if (txId) {

    const url = `https://api.blockcypher.com/v1/btc/test3/txs/${txId}`
    request
      .get(url)
      .then((req) => {
        const answer = JSON.parse(req.text)
        if (answer) {
          const retJson = {
            blockhash: answer.block_hash,
            blockheight: answer.block_height,
            blocktime: Math.floor(
              new Date(
                (answer.confirmations)
                ? answer.confirmed
                : answer.received
              )
            ),
            confirmations: answer.confirmations,
            fees: BigNumber(answer.fees).dividedBy(1e8).toNumber(),
            locktime: answer.lock_time,
            size: answer.size,
            time: Math.floor(
              new Date(
                (answer.confirmations)
                ? answer.confirmed
                : answer.received
              )
            ),
            txid: txId,
            valueIn: BigNumber(
                answer.inputs.map((input) => { return input.output_value }).reduce(calcSum)
              ).dividedBy(1e8).toNumber(),
            valueOut: BigNumber(
                answer.outputs.map((output) => { return output.value }).reduce(calcSum)
              ).dividedBy(1e8).toNumber(),
            version: answer.ver,
            vin: answer.inputs.map((input, index) => {
              return {
                addr: input.addresses[0],
                n: input.output_index,
                scriptSig: {
                  hex: input.script,
                },
                txid: input.prev_hash,
                value: BigNumber(input.output_value).dividedBy(1e8).toNumber(),
                valueSat: input.output_value,
                vout: input.output_index,
              }
            }),
            vout: answer.outputs.map((output, index) => {
              return {
                n: index,
                scriptPubKey: {
                  addresses: output.addresses,
                  hex: output.script,
                },
                spentHeight: null,
                spentIndex: null,
                spentTxId: null,
                value: BigNumber(output.value).dividedBy(1e8).toNumber(),
              }
            }),
          }
          res.status(200).json(retJson)
        } else {
          res.status(503).json({error: 'api answer empty'})
        }
      })
      .catch((e) => {
        console.log('Error', e)
        res.status(503).json({error: e.message})
      })
  } else {
    res.status(404).json({ error: 'need tx id' })
  }
})
app.use('/btc/testnet/addr/', async (req,res) => {
  const urlParts = req.url.split('/')
  urlParts.shift()

  if (urlParts.length >= 1) {
    const address = urlParts[0]
    let isUnspends = false
    let url = `https://api.bitcore.io/api/BTC/testnet/address/${address}/balance`
    if (urlParts.length === 2 && urlParts[1] === `utxo`) {
      isUnspends = true
      url = `https://api.bitcore.io/api/BTC/testnet/address/${address}?unspent=true`
    }
    //const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`
    
    request
      .get(url)
      .then((req) => {

        const answer = JSON.parse(req.text)

        if (answer) {
          if (isUnspends) {
            const retJson = answer.map((txInfo, index) => {
              return {
                address,
                amount: BigNumber(txInfo.value).dividedBy(1e8).toNumber(),
                confirmations: txInfo.confirmations,
                height: txInfo.mintHeight,
                satoshis: txInfo.value,
                scriptPubKey: txInfo.script,
                txid: txInfo.mintTxid,
                vout: txInfo.mintIndex,
              }
            })
            res.status(200).json(retJson)
          } else {
            const retJson = {
              addrStr: address,
              balance: BigNumber(answer.balance).dividedBy(1e8).toNumber(),
              balanceSat: answer.balance,
              totalReceived: 0,
              totalReceivedSat: 0,
              totalSent: 0,
              totalSentSat: 0,
              transactions: [],
              txApperances: 0,
              unconfirmedBalance: BigNumber(answer.unconfirmed_balance).dividedBy(1e8).toNumber(),
              unconfirmedBalanceSat: answer.unconfirmed_balance,
              unconfirmedTxApperances: 0,
            }
            res.status(200).json(retJson)
          }
        } else {
          res.status(503).json({error: 'Api answer empty'})
        }
      })
      .catch((e) => {
        console.log('Error', e)
        res.status(503).json({error: e.message})
      })
  }
})

app.post('/btc/testnet/tx/send', async (req, res) => {
  const { rawtx } = req.body
  console.log(rawtx)
  try {
    request
      .post(`https://api.bitcore.io/api/BTC/testnet/tx/send`)
      .send({
        rawTx: rawtx,
      })
      .end((err, res) => {
        if (err) {

        }
        console.log(res)
        console.log(err)
      });
  } catch (e) {
    console.log(e)
  }
  res.status(200).json({rawtx})
})

app.listen((process.env.PORT) ? process.env.PORT : port)

console.log(`BTC-testnet proxy listening: localhost:${port} ⮂ bitcore & blockcryper`);


