console.log('swap.multisig.txholder')
const fs = require("fs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const config = require("./config.js")

const database = require('./database.js')
const request = require('superagent')


const util = require('util');
const log_file_path = path.join(__dirname, '..', 'logger.log')
const log_file = fs.createWriteStream(log_file_path, {flags : 'a'});


const logger = function(ip, d) {
  log_file.write(util.format(new Date().toISOString()+' ['+ip+':'+d) + '\n');
}

const app = express()

const timestamp = () => { return Math.round(+new Date()/1000); }

const getIP = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

const getDate = () => { return new Date().toISOString() }

const broadcast = (txRaw, mainnet) => {
  console.log('broadcast', mainnet)
  const api = (mainnet === '1') ? config.api.mainnet : config.api.testnet
  console.log(api)
  return request.post(`${api}/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })
}

console.log('Load database')
database.load()


const memoryDB = {}
const memoryDBLimit = 10

const checkSign = (address, pubkey, data) => {
  return true
}

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
  next();
});


// Добавляет запись по транзакции
app.post('/broadcast/', async (req,res) => {
  const {
    address,
    pubkey,

    sender,
    destination,
    amount,
    fee,
    rawTx,
    keys,
    invoice,
  } = req.body

  if (address && pubkey && checkSign(address, pubkey, req.body)) {
    if (sender && destination && amount && fee && rawTx && keys) {
      const txId = await database.add({
        sender,
        destination,
        amount,
        fee,
        rawTx,
        keys,
        invoice,
        holder: pubkey,
      })

      res.status(200).json({ answer: 'ok', txId })
    } else {
      res.status(400).json({ error: 'Bad request' })
    }
  } else {
    res.status(400).json({ error: 'Bad sign' })
  }
})


app.post('/confirmtx/', async (req, res) => {
  const { msTxId, keys, signedTx, txId } = req.body

  if (msTxId
    && keys
    && keys instanceof Array
    && keys.length
    && signedTx
    && txId
  ) {
    const checkKeys = keys.join('|')
    const transaction = await database.get(msTxId)
    if (transaction) {
      const {
        id,
        walletkeys,
        status,
        txId: storedTxId,
      } = transaction

      if (checkKeys === walletkeys) {
        switch (status) {
          case 1:
            database.ready(
              id,
              signedTx,
              txId
            ).then(() => {
              res.status(200).json({
                answer: 'ready',
                txId,
              })
            })
            break;
          case 2:
            res.status(200).json({
              answer: 'ready',
              storedTxId,
            })
            break;
          case 3:
            res.status(200).json({
              answer: 'rejected'
            })
            break;
        }
      } else {
        res.status(403).json({
          answer: 'access dinied'
        })
      }
    } else {
      res.status(404).json({
        answer: 'not found'
      })
    }
  } else {
    res.status(400).json({ error: 'Bad request' })
  }
})

app.post('/rejecttx/', async (req, res) => {
  const { txId, keys } = req.body

  if (txId
    && keys
    && keys instanceof Array
    && keys.length
  ) {
    const checkKeys = keys.join('|')
    const transaction = await database.get(txId)
    if (transaction) {
      const {
        id,
        walletkeys,
        status,
        txId: storedTxId,
      } = transaction

      if (checkKeys === walletkeys) {
        switch (status) {
          case 1:
            database.reject(
              id,
            ).then(() => {
              res.status(200).json({
                answer: 'rejected',
              })
            })
            break;
          case 2:
            res.status(200).json({
              answer: 'already ready',
              storedTxId,
            })
            break;
          case 3:
            res.status(200).json({
              answer: 'rejected'
            })
            break;
        }
      } else {
        res.status(403).json({
          answer: 'access dinied'
        })
      }
    } else {
      res.status(404).json({
        answer: 'not found'
      })
    }
  } else {
    res.status(400).json({ error: 'Bad request' })
  }
})

app.post('/rawtx/', async (req, res) => {
  const { txId, keys } = req.body

  if (txId
    && keys 
    && keys instanceof Array 
    && keys.length
  ) {
    const checkKeys = keys.join('|')
    const transaction = await database.get(txId)
    if (transaction) {
      if (checkKeys === transaction.walletkeys) {
        res.status(200).json({
          answer: 'ok',
          ...transaction,
        })
      } else {
        res.status(403).json({
          answer: 'access dinied'
        })
      }
    } else {
      res.status(404).json({
        answer: 'not found'
      })
    }
  } else {
    res.status(400).json({ error: 'Bad request' })
  }
})

app.use('/tx/', async (req,res) => {
  const urlParts = req.url.split('/')
  urlParts.shift()

  if (urlParts.length === 1) {
    const uniqhash = urlParts[0]
    const transaction = await database.get(uniqhash)
    if (transaction) {
      const {
        utx,
        sender,
        destination,
        amount,
        fee,
        status,
        txId,
      } = transaction
      
      res.status(200).json({
        answer: 'ok',
        uniqhash,
        utx,
        sender,
        destination,
        amount,
        fee,
        status,
        txId,
      })
    } else {
      res.status(404).json({
        answer: 'not found'
      })
    }
  } else {
    res.status(400).json({ error: 'Bad request' })
  }
})

const router_txs = async (address, req, res) => {
  if (address) {
    if (address instanceof Array
      && address.length
    ) {
      const retData = []

      retData = await database.fetchmany(address)

      res.status(200).json({
        answer: 'ok',
        address,
        items: retData,
      })
    } else {
      const retData = await database.fetch(address)

      res.status(200).json({
        answer: 'ok',
        address,
        items: retData,
      })
    }
  } else {
    res.status(400).json({ error: 'Bad request' })
  }
}

app.post('/txs/', async (req, res) => {
  console.log('post')
  const { address } = req.body

  console.log(req.body)
  router_txs(address, req, res)
})
/*
// Запрашивает информацию по кошельку
app.use('/txs/', async (req,res) => {
  let address = false
  console.log('use')

  console.log(req)
  const urlParts = req.url.split('/')
  urlParts.shift()
  if (urlParts.length === 1) address = urlParts[0]
  router_txs(address, req, res)
})
*/



//app.listen(process.env.PORT)
app.listen((process.env.PORT) ? process.env.PORT : 30350)
