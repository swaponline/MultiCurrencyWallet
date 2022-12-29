const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');
const { SHA3 } = require('sha3');
const md5 = require('md5');
const striptags = require('striptags');
const escape = require('sqlutils/mysql/escape');

const tableFields = {
  'id':             `INTEGER PRIMARY KEY AUTOINCREMENT`,
  'fromHex':        `VARCHAR(128)`,
  'toHex':          `VARCHAR(128)`,
  'type':           `TEXT`,
  'fromAddress':    `TEXT`,
  'toAddress':      `TEXT`,
  'mainnet':        `INT`,
  'txInfo':         `TEXT`,
  'status':         `TEXT`,
  'amount':         `DOUBLE`,
  'label':          `TEXT`,
  'utx':            `INT`,
  'invoiceNumber':  `INTEGER`,
  'destAddress':    `TEXT`,
  'contact':        `TEXT`,
  'uniqhash':       `VARCHAR(32)`
}

const load = async () => {
  const fields = Object.keys(tableFields).map((name) => {
    return `${name} ${tableFields[name]}`
  }).join(',')
  const createQuery = `CREATE TABLE IF NOT EXISTS invoices( ${fields} )`;

  db.serialize( async () => {
    db.run(createQuery)
  })
}

const add = async (currency, toAddress, fromAddress, amount, label, mainnet, destAddress, contact) => {
  return new Promise(async (resolve, fail) => {
    const fromHashString = `${currency}:${fromAddress}:${(mainnet) ? '1' : '0'}`
    const toHashString = `${currency}:${toAddress}:${(mainnet) ? '1' : '0'}`
    const fromHash = new SHA3(512)
    const toHash = new SHA3(512)

    fromHash.update(fromHashString)
    toHash.update(toHashString)

    const fromHex = fromHash.digest('hex')
    const toHex = toHash.digest('hex')

    const invoiceNumber = await getNextInvoiceNumber(fromHex)

    const createUtx = Math.floor(new Date().getTime() / 1000)

    const uniqhash = md5(`${fromHashString}:${toHashString}:${invoiceNumber}:${amount}:${createUtx}`)

    db.serialize( () => {
      const stmt = db.prepare('INSERT INTO invoices VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )')
      stmt.run(null,
        fromHex,
        toHex,
        currency,
        fromAddress,
        toAddress,
        mainnet,
        '',
        'new',
        amount,
        striptags(label),
        createUtx,
        invoiceNumber,
        (destAddress) ? destAddress : '',
        striptags(contact),
        uniqhash
      )
      stmt.finalize();
      resolve( uniqhash )
    })
  })
}

const get = async (hash) => {
  return new Promise(async (resolve, fail) => {
    const selectQuery = `SELECT * FROM invoices WHERE uniqhash = ? LIMIT 1`

    let founded = false
    db.each(selectQuery, [ hash ], (err,row) => {
      founded = row
    }, () => {
      resolve(founded)
    })
  })
}

const getById = async (id) => {
  return new Promise(async (resolve, fail) => {
    const selectQuery = `SELECT * FROM invoices WHERE uniqhash = ? LIMIT 1`

    let founded = false
    db.each(selectQuery, [ id ], (err,row) => {
      founded = row
    }, () => {
      resolve(founded)
    })
  })
}

const getNextInvoiceNumber = async (fromHex) => {
  return new Promise((resolve, fail) => {
    const selectQuery = `SELECT COUNT(id) AS number FROM invoices WHERE fromHex='${fromHex}'`
    let nextNumber = 1
    db.each(selectQuery, function (err,row) {
      nextNumber = row.number+1
    }, () => {
      resolve(nextNumber)
    })
  })
}

const cancel = async (invoiceID) => {
  return new Promise((resolve, fail) => {
    db.serialize( () => {
      const stmt = db.prepare(`UPDATE invoices SET status='cancelled' WHERE id=?`)
      stmt.run(invoiceID)
      stmt.finalize()
      resolve(true)
    })
  })
}

const mark = async (invoiceID, mark, txID, address) => {
  return new Promise(async (resolve, fail) => {
    const invoice = await getById(invoiceID)

    db.serialize( () => {
      if (!invoice.toAddress && address) {
        const stmt = db.prepare(`UPDATE invoices SET status=?, txInfo=?, toAddress=? WHERE id=?`)
        stmt.run(mark, txID, address, invoiceID)
        stmt.finalize()
        resolve(true)
      } else {
        const stmt = db.prepare(`UPDATE invoices SET status=?, txInfo=? WHERE id=?`)
        stmt.run(mark, txID, invoiceID)
        stmt.finalize()
        resolve(true)
      }
    })
  })
}

const updateStatus = async(invoiceID, newStatus) => {
}

const updateTX = async(invoiceID, txID) => {
}

const fetchmany = async (wallets, mainnet) => {
  return new Promise(async (resolve, fail) => {
    const walletsHashMap = []
    const addressList = wallets.map(( { type, address } ) => {
      walletsHashMap.push(`${type}:${address}`)
      return escape(address)
    })

    const sqlAddressList = `m.toAddress IN (${addressList.join(',')}) OR m.fromAddress IN (${addressList.join(',')})`
    const countQuery = `(SELECT COUNT(i.id) FROM invoices AS i WHERE i.fromAddress=m.fromAddress ) AS totalCount`
    const selectQuery = `SELECT m.*, ${countQuery} FROM invoices AS m WHERE ${sqlAddressList} ORDER BY m.utx DESC LIMIT 100`

    const ret = []
    await db.each(selectQuery, [], async (err,row) => {
      const { type, toAddress, fromAddress } = row

      if ((walletsHashMap.indexOf(`${type}:${fromAddress}`) !== -1)
        || (walletsHashMap.indexOf(`${type}:${toAddress}`) !== -1)
      ) ret.push(row)
    }, () => {
      resolve(ret)
    })
  })
}

const fetch = async (currency, address, mainnet) => {
  return new Promise(async (resolve, fail) => {
    //const hashString = `${currency}:${address}:${(mainnet) ? '1' : '0'}`

    //const Hash = SHA3(512)
    //Hash.update(hashString)
    //const hex = Hash.digest('hex')
    //const selectQuery = `SELECT * FROM invoices WHERE fromHex = '${hex}' OR toHex = '${hex}' ORDER BY utx DESC LIMIT 100`
    //const selectQuery = `SELECT * FROM invoices WHERE currency = '${currency}' fromHex = '${hex}' OR toHex = '${hex}' ORDER BY utx DESC LIMIT 100`
    const selectQuery = 'SELECT m.*, (SELECT COUNT(i.id) FROM invoices AS i WHERE i.fromAddress=m.fromAddress ) AS totalCount FROM invoices as m WHERE m.type = ? AND ( m.toAddress = ? OR m.fromAddress = ? ) ORDER BY m.utx DESC LIMIT 100'
    
    
    
    const ret = []
    await db.each(selectQuery,[currency,address,address], async function(err, row) {
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
  fetch,
  fetchmany,
  updateStatus,
  updateTX,
  cancel,
  mark,
}