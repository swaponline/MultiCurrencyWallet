console.log('begin')
const fs = require("fs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const config = require("./config.js")

const database = require('./database.js')
const request = require('request');

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


console.log('Load database')
database.load()


const memodyDB = []

const checkSign = (address, pubkey, data) => {
  return true
}

const crossOriginAllow = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
}

const proxyUrl = (url, req, res) => {
  var r = null;
  if(req.method === 'POST') {
    r = request.post({uri: url, json: req.body});
  } else {
    r = request(url);
  }
  req.pipe(r).pipe(res);
}

app.use('/proxybitpay', function(req,res) {
  var url = 'https://insight.bitpay.com/api'+ req.url;
  proxyUrl(url, req, res)
});
app.use('/proxyetherscan', function(req,res) {
  var url = 'https://api.etherscan.io/api'+ req.url;
  proxyUrl(url, req, res)
});

app.use('/proxybitpay-testnet', function(req,res) {
  var url = 'https://test-insight.swaponline.io/insight-api'+ req.url;
  proxyUrl(url, req, res)
});
app.use('/proxyetherscan-testnet', function(req,res) {
  var url = 'https://rinkeby.etherscan.io/api'+ req.url;
  proxyUrl(url, req, res)
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(function (req, res, next) {
  crossOriginAllow(res)
  next();
});

app.post('/invoice/cancel/', async (req,res) => {
  const { invoiceId } = req.body
  if (invoiceId) {
    await database.cancel( invoiceId )
    res.status(200).json({ answer: 'ok' })
  } else {
    res.status(502).json({ error: 'Bad request' })
  }
})

app.post('/invoice/mark/', async (req,res) => {
  const { invoiceId, mark, txid, address} = req.body
  if (invoiceId && mark && txid) {
    await database.mark(invoiceId, mark, txid, address)
    res.status(200).json({ answer: 'ok' })
  } else {
    res.status(502).json({ error: 'Bad request' })
  }
})
// Добавляет запись по транзакции
app.post('/invoice/push/', async (req,res) => {
  const {
    address,
    amount,
    currency,
    fromAddress,
    label,
    mainnet,
    pubkey,
    toAddress,
    contact,
    destination,
  } = req.body
  if (address && pubkey && checkSign(address, pubkey, req.body)) {
    if (amount && currency && fromAddress) {
      const invoiceId = await database.add(
        currency,
        toAddress,
        fromAddress,
        amount,
        label,
        mainnet,
        destination,
        contact,
      )
      res.status(200).json({ answer: 'ok', invoiceId })
    } else {
      res.status(400).json({ error: 'Bad request' })
    }
  } else {
    res.status(400).json({ error: 'Bad sign' })
  }
})

app.post('/invoice/fetchmany', async (req,res) => {
  const { wallets, mainnet, limit, offset } = req.body

  if (wallets
    && wallets instanceof Array
    && wallets.length
  ) {
    const filteredWallets = wallets.filter((wallet) => (wallet && wallet.type && wallet.address))

    let retData = []

    if (filteredWallets.length) {
      retData = await database.fetchmany(wallets, mainnet)
    }

    res.status(200).json({
      answer: 'ok',
      wallets,
      items: retData
    })

  } else {
    res.status(400).json({ error: 'Bad request' })
  }
})

app.post('/invoice/get/', async (req,res) => {
  const { hash } = req.body

  if (hash) {
    const invoice = await database.get(hash)
    if (invoice) {
      res.status(200).json({
        answer: 'ok',
        hash,
        item: invoice
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

// Запрашивает информацию по кошельку
app.post('/invoice/fetch/', async (req,res) => {
  const { currency, address, mainnet, limit, offset } = req.body

  if (currency && address) {
    const retData = await database.fetch(currency, address, mainnet)

    res.status(200).json({
      answer: 'ok',
      currency,
      address,
      items: retData,
    })
    
  } else {
    res.status(400).json({ error: 'Bad request' })
  }
  /*
    currency [BTC|ETH| etc] requery
    address - requery
    Возможность запросить сразу по нескольким валютам адресам
    
    list = [
      {
        currency [BTC|ETH| etc]
        address
      },
      ....
      ....
      {
        currency N
        address N
      }
    ]
  */
  
  // walletHash = sha(currency+|+address)
  // Запрашиваем из базы все где toHash = walletHash OR fromHash = walletHash
  //
})
app.post('/sign/', async (req,res) => {
  
})

//app.listen(process.env.PORT)
app.listen((process.env.PORT) ? process.env.PORT : 30250)
