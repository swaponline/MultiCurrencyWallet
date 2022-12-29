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
const SMSru = require('sms_ru');


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

const generateCode = () => {
  const min = 0
  const max = 9
  const p1 = Math.floor(Math.random() * (max - min) + min)
  const p2 = Math.floor(Math.random() * (max - min) + min)
  const p3 = Math.floor(Math.random() * (max - min) + min)
  const p4 = Math.floor(Math.random() * (max - min) + min)
  return `${p1}${p2}${p3}${p4}`
}

console.log('Load database')
database.load()
console.log('Init bitcoin account')
btcutils.login(config.privateKey.mainnet, config.privateKey.testnet)
console.log('Init sms gateway')

const smsGateway = new SMSru(config.smsapi);
console.log((smsGateway) ? 'Ok' : 'Fail')

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

// Начало регистрации - отправка смс
app.post('/register/begin/', async (req, res) => {
  const { address, publicKey, phone ,checkSign } = req.body
  const ip = getIP(req)
  
  if (address && publicKey && phone && checkSign) {
    logger( ip, `Begin register: ${address} ${publicKey} ${phone}` )
    if (btcutils.CheckPublicKey(address, publicKey, checkSign)) {
      const smsCode = generateCode()
      console.log('Generated sms: '+smsCode)
      console.log('SMS sended to: '+phone)

      await smsGateway.sms_send({
        to: phone,
        text: smsCode
      }, function(e){
        console.log('Send SMS status:' + e.description);
      });

      registerStack[address] = {
        publicKey,
        phone,
        smsCode
      }
      res.status(200).json({ answer: 'ok' })
    } else {
      res.status(200).json({ error: 'Fail check sign' })
    }
  } else {
    res.status(502).json({ error: 'Bad request' })
  }
})
// Подтверждение регистрации
app.post('/register/confirm/', async (req, res) => {
  const { address, publicKey, phone, smsCode, checkSign, mainnet } = req.body
  const ip = getIP(req)
  
  if (address && publicKey && phone && smsCode && checkSign) {
    logger( ip, `Confirm register: ${address} ${publicKey} ${phone}` )
    if (btcutils.CheckPublicKey(address, publicKey, checkSign)) {
      if (registerStack[address]
        && (registerStack[address].publicKey == publicKey)
        && (registerStack[address].phone == phone)
        && (registerStack[address].smsCode == smsCode)
      ) {
        const exists = database.exist(address, publicKey, mainnet)
        if (!exists) {
          const answer = await database.add(address, publicKey, phone, checkSign , mainnet )
          if (answer.error) {
            logger( ip, `Fail register: ${address} ${phone} ${publicKey} ${answer.error}` )
            res.status(200).json({ error: answer.error })
          } else {
            res.status(200).json({ answer: 'ok' })
          }
        } else {
          if (exists.phone && exists.phone==phone) {
            res.status(200).json({ error: 'Already registered' })
          } else {
            res.status(200).json({ error: 'This wallet already locked by other phone number' })
          }
        }
      } else {
        res.status(200).json({ error: 'Sms code not valid' })
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
  const { address, publicKey } = req.body
  const ip = getIP(req)
  logger(ip, "Check login")
  if (address && publicKey) {
    if (database.exist(address, publicKey)) {
      res.status(200).json({ answer: 'Exist' })
    } else {
      res.status(200).json({ answer: 'Not found' })
    }
  } else {
    res.status(502).json({ error: 'Bad request' })
  }
})

// Принимает полу-подписаную транзакцию и отправляет смс код
app.post('/push/', async (req,res) => {
  const ip = getIP(req)
  const { address, publicKey, checkSign, rawTX, mainnet } = req.body
  logger( ip, "Push tx and send sms" )
  if (address, publicKey, checkSign, rawTX) {
    const user = database.exist(address, publicKey)
    if (user) {
      const answer = await database.pushTX(address, publicKey, rawTX, checkSign, mainnet )
      if (answer.error) {
        logger( ip, `Fail push TX: ${address} ${user.phone} ${publicKey} ${answer.error}` )
        res.status(200).json({ error: answer.error })
      } else {
        const smsCode = generateCode()
        console.log('Phone: '+user.phone)
        console.log('SMS: '+smsCode)
        await smsGateway.sms_send({
          to: user.phone,
          text: smsCode
        }, function(e){
          console.log('Send SMS status:' + e.description);
        });
        // SEND SMS
        if (database.pushSMS(address, publicKey, mainnet, smsCode)) {
          res.status(200).json({ answer: 'ok' })
        } else {
          res.status(200).json({ error: 'Fail save sms code' })
        }
      }
    } else {
      res.status(200).json({ error: 'User not exist' })
    }
  } else {
    res.status(502).json({ error: 'Bad request' })
  }
})

// Сверяет 
app.post('/sign/', async (req,res) => {
  const ip = getIP(req)
  const { address, publicKey, checkSign, code, mainnet } = req.body
  logger( ip, "Sign TX" )
  if (address, publicKey, checkSign, code) {
    const answer = await database.validateSMS(address, publicKey, code, checkSign, mainnet )
    if (answer.error) {
      logger( ip, `Fail validate SMS: ${address} ${publicKey} ${answer.error}` )
      res.status(200).json({ error: answer.error })
    } else {
      logger( ip, `TX validated: ${address} ${publicKey}` )
      // SMS Validated
      const rawTX = answer
      const signedTX = await btcutils.SignTX( publicKey, rawTX, mainnet )
      // Broadcast TX
      console.log('Signed - broadcast')
      const txID = await btcutils.broadcast( signedTX )
      if (txID) {
        logger( ip, `txID: ${txID}`)
        res.status(200).json({
          answer: 'ok',
          txID: txID,
        })
      } else {
        // Если броадкаст не удался (апи отказал или еще что), то вернем ошибку и подписаную транзакцию. Пускай вторая сторона пробует броадкаст
        res.status(200).json( { error: 'Fail broadcast', rawTX: signedTX } )
      }
    }
  } else {
    res.status(502).json({ error: 'Bad request' })
  }
})

//app.listen(process.env.PORT)
app.listen((process.env.PORT) ? process.env.PORT : 30100)
