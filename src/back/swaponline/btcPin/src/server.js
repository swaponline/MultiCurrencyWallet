console.log('begin')
const fs = require("fs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const config = require("./config.js")

const web3utils = require('web3-utils');
const uuidValidate = require('uuid-validate');
const WEB3 = require('web3')
const database = require('./database.js')
const btcutils = require('./btcutils.js')


const util = require('util');
const log_file_path = path.join(__dirname, '..', 'logger.log')
const log_file = fs.createWriteStream(log_file_path, {flags : 'a'});


const logger = function(ip, d) { //
  log_file.write(util.format(new Date().toISOString()+' ['+ip+':'+d) + '\n');
};

const app = express()

const timestamp = () => { return Math.round(+new Date()/1000); }

const getIP = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

const getDate = () => { return new Date().toISOString() }

const registerStack = {}

console.log('Load database')
database.load()
console.log('Init bitcoin account')
btcutils.login(config.privateKey.mainnet, config.privateKey.testnet)


const crossOriginAllow = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If needed
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// Подтверждение регистрации
app.post('/register/', async (req, res) => {
  const { address, publicKey, password, checkSign, mainnet } = req.body

  const ip = getIP(req)

  if (address && publicKey && password && checkSign) {
    // Проверяем ключи
    const publicKeys = (() => {
      try {
        return JSON.parse(publicKey)
      } catch (e) {
        return false
      }
    })()

    if (publicKeys === false) {
      logger( ip, `Register - bad public key` )
      res.status(502).json({ error: 'Bad request' })
      return
    }

    logger( ip, `Register: ${address} ${publicKey}` )
    if (btcutils.CheckPublicKey(address, publicKeys, checkSign)) {
      const exists = database.exist(address, publicKey, mainnet)

      if (!exists) {
        const answer = await database.add(address, publicKey, password, checkSign , mainnet )
        if (answer.error) {
          logger( ip, `Fail register: ${address} ${publicKey} ${answer.error}` )
          res.status(200).json({ error: answer.error })
        } else {
          res.status(200).json({ answer: 'ok' })
        }
      } else {
        if (exists.passhash === database.getPassHash(password)) {
          res.status(200).json({ error: 'Already registered' })
        } else {
          res.status(200).json({ error: 'This wallet already locked by other pin code' })
        }
      }
    } else {
      res.status(200).json({ error: 'Fail check sign' })
    }
  } else {
    res.status(502).json({ error: 'Bad request' })
  }
})
// Проверяет наличие регистрации.
app.post('/login/', async (req, res) => {
  const { address, publicKey, mainnet } = req.body
  const ip = getIP(req)
  logger(ip, "Check login")

  if (address && publicKey) {

    if (database.exist(address, publicKey, mainnet)) {
      res.status(200).json({ answer: 'Exist' })
    } else {
      res.status(200).json({ answer: 'Not found' })
    }
  } else {
    res.status(502).json({ error: 'Bad request' })
  }
})

// Получает полу-подписаную транзакцию и пароль
app.post('/sign/', async (req,res) => {
  const ip = getIP(req)
  const { address, publicKey, checkSign, rawTX, password, mainnet } = req.body
  const version = (req.body.version || 'v4')
  logger( ip, "Sign TX" )
  if (address && publicKey && rawTX && password) {
    // Проверяем ключи
    const publicKeys = (() => {
      try {
        return JSON.parse(publicKey)
      } catch (e) {
        return false
      }
    })()

    if (publicKeys === false) {
      logger( ip, `Confirm register - bad public key` )
      res.status(502).json({ error: 'Bad request' })
      return
    }

    const exists = database.exist(address, publicKey, mainnet)
    if (exists) {
      if (exists.passhash === database.getPassHash(password)) {
        let signedTX = false
        if (version === 'v4') signedTX = await btcutils.SignTXv4( publicKey, rawTX, mainnet )
        if (version === 'v5') signedTX = await btcutils.SignTXv5( publicKey, rawTX, mainnet )

        res.status(200).json( { answer: 'ok', rawTX: signedTX } )
        return
      } else {
        res.status(200).json({ error: 'Pin code not valid' })
      }
    } else {
      res.status(200).json({ error: 'Account not founded' })
    }
  } else {
    res.status(502).json({ error: 'Bad request' })
  }
})

//app.listen(process.env.PORT)
app.listen((process.env.PORT) ? process.env.PORT : config.port)
