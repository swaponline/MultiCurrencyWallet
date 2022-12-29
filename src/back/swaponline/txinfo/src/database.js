const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');
const { SHA3 } = require('sha3');
const md5 = require('md5');
const striptags = require('striptags');
const escape = require('sqlutils/mysql/escape');


const txStatus = {
  PENDING: 1,
  READY: 2,
  REJECT: 3,
}

const txTable = `transactions`

const tableFields = {
  'id':             `INTEGER PRIMARY KEY AUTOINCREMENT`,
  'uniqhash':       `VARCHAR(64)`,
  'utx':            `INT`,
  'sender':         `VARCHAR(64)`,
  'walletkeys':     `TEXT`,
  'destination':    `VARCHAR(64)`,
  'amount':         `DOUBLE PRECISION`,
  'fee':            `DOUBLE PRECISION`,
  'status':         `INT`,
  'rawTx':          `TEXT`,
  'txId':           `TEXT`,
  'invoice':        `INT`,
  'holder':         `TEXT`,
}

const load = async () => {
  const fields = Object.keys(tableFields).map((name) => {
    return `${name} ${tableFields[name]}`
  }).join(',')
  const createQuery = `CREATE TABLE IF NOT EXISTS ${txTable}( ${fields} )`;

  console.log(createQuery)
  db.serialize( async () => {
    db.run(createQuery)
  })
}

const add = async ( txInfo ) => {
  const {
    sender,
    destination,
    amount,
    fee,
    rawTx,
    keys,
    invoice,
    holder,
  } = txInfo

  return new Promise(async (resolve, fail) => {
    const walletkeys = keys.join('|')
    const createUtx = Math.floor(new Date().getTime() / 1000)
    const uniqhashSha = new SHA3(256)
    
    let uniqhashGenerated = false
    let uniqhash = false

    while (!uniqhashGenerated) {
      const someRand =  Math.random() * createUtx
      const uniqhashString = [
        someRand,
        createUtx,
        sender,
        destination,
        amount,
        fee,
        walletkeys
      ].join('')

      uniqhashSha.update(uniqhashString)

      uniqhash = uniqhashSha.digest('hex')

      uniqhashGenerated = !await get(uniqhash)
      console.log('find uniq hash', uniqhash)
    }

    console.log('ok')
    
    

    db.serialize( () => {
      const fPart = `?, `
      const sqlQuery = `INSERT INTO ${txTable} VALUES ( ${fPart.repeat(Object.keys(tableFields).length-1)} ? )`
      console.log(sqlQuery)

      const stmt = db.prepare(sqlQuery)
      stmt.run(null,      // 'id':             `INTEGER PRIMARY KEY AUTOINCREMENT`,
        uniqhash,         // 'uniqhash':       `VARCHAR(64)`,
        createUtx,        // 'utx':            `INT`,
        sender,           // 'sender':         `VARCHAR(64)`,
        walletkeys,       // 'walletkeys':     `TEXT`,
        destination,      // 'destination':    `VARCHAR(64)`,
        amount,           // 'amount':         `DOUBLE PRECISION`,
        fee,              // 'fee':            `DOUBLE PRECISION`,
        txStatus.PENDING, // 'status':         `INT`,
        rawTx,            // 'rawTx':          `TEXT`,
        `pending`,        // 'txId':           `TEXT`,
        invoice,          // 'invoice':        `INT`,
        holder,           // 'holder':         `TEXT`,
      )
      stmt.finalize();
      resolve( uniqhash )
    })
  })
}

const reject = (id) => {
  return new Promise( (resolve, fail) => {
    const sqlQuery = `UPDATE ${txTable} SET status = ? WHERE id = ?`
    console.log(sqlQuery)
    
    const stmt = db.prepare(sqlQuery)
    stmt.run( txStatus.REJECT, id )
    stmt.finalize()
    resolve( true )
  })
}

const ready = (id, rawTx, txId) => {
  return new Promise(async (resolve, fail) => {
    const sqlQuery = `UPDATE ${txTable} SET rawTx = ?, txId = ?, status = ? WHERE id = ?`
    console.log(sqlQuery)
    
    const stmt = db.prepare(sqlQuery)
    stmt.run( rawTx, txId, txStatus.READY, id )
    stmt.finalize()
    resolve( true )
  })
}

const get = (uniqhash) => {
  return new Promise(async (resolve, fail) => {
    const selectQuery = `SELECT * FROM ${txTable} WHERE uniqhash = ? LIMIT 1`

    console.log(selectQuery)
    let founded = false
    db.each(selectQuery, [ uniqhash ], (err,row) => {
      founded = row
    }, () => {
      resolve(founded)
    })
  })
}

const getId = async (uniqhash) => {
  get.then( ({ id }) => id || false )
}


const fetchmany = async (wallets, mainnet) => {
  return new Promise(async (resolve, fail) => {
    const addressList = wallets.map(( { address } ) => {
      return escape(address)
    })

    const fields = [
      `uniqhash`,
      `utx`,
      `sender`,
      `destination`,
      `amount`,
      `fee`
      `status`,
      `txId`,
      `invoice`,
      `holder`,
    ]

    const sqlQuery = `SELECT ${fields.join(',')} FROM ${txTable} WHERE sender IN (${addressList.join(',')}) AND status != ? ORDER BY utx DESC LIMIT 100`

    console.log(sqlQuery)
    const ret = []
    await db.each(selectQuery, [txStatus.READY], async (err,row) => {
      ret.push(row)
    }, () => {
      resolve(ret)
    })
  })
}

const fetch = async (address) => {
  return new Promise(async (resolve, fail) => {
    const fields = [
      `uniqhash`,
      `utx`,
      `sender`,
      `destination`,
      `amount`,
      `fee`,
      `status`,
      `txId`,
      `invoice`,
      `holder`,
    ]

    const sqlQuery = `SELECT ${fields.join(',')} FROM ${txTable} WHERE sender = ? AND status != ? ORDER BY utx DESC LIMIT 100`

    console.log(sqlQuery)

    const ret = []
    await db.each(sqlQuery, [address, txStatus.READY], async function(err, row) {
      ret.push(row)
    }, () => {
      resolve(ret)
    })
  })
}

module.exports = {
  load,
  add,
  get,
  getId,
  ready,
  reject,
  fetch,
  fetchmany,
}